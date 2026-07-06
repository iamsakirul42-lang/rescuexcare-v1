-- ============================================================
-- RescueX Wallet System Migration
-- Extends existing expert_earnings + creates withdrawal_requests
-- Production-safe: no seed data, no stored balance
-- ============================================================

-- 1. Extend expert_earnings with missing columns
-- Existing columns: id, expert_id, booking_id, service_amount, commission_amount, expert_amount, payment_method, payment_status, created_at, updated_at

ALTER TABLE public.expert_earnings
ADD COLUMN IF NOT EXISTS service_name text,
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS commission_rate numeric DEFAULT 0.13,
ADD COLUMN IF NOT EXISTS platform_due numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_due_status text DEFAULT 'not_applicable'
  CHECK (platform_due_status IN ('not_applicable', 'unpaid', 'paid'));

COMMENT ON COLUMN public.expert_earnings.service_name IS 'Name of service performed (e.g. Flat Tyre / Puncture)';
COMMENT ON COLUMN public.expert_earnings.customer_name IS 'Name of the customer who booked';
COMMENT ON COLUMN public.expert_earnings.commission_rate IS 'Commission rate applied (default 13%)';
COMMENT ON COLUMN public.expert_earnings.platform_due IS 'Amount owed to RescueX platform (cash jobs only)';
COMMENT ON COLUMN public.expert_earnings.platform_due_status IS 'not_applicable=online job, unpaid=cash job pending, paid=cash job settled';

-- 2. Create withdrawal_requests table
-- Uses expert_id referencing expert_profiles(id)
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id uuid REFERENCES public.expert_profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text DEFAULT 'processing' NOT NULL
    CHECK (status IN ('processing', 'approved', 'rejected', 'paid')),
  admin_note text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.withdrawal_requests IS 'Expert withdrawal requests with admin-controlled lifecycle';
COMMENT ON COLUMN public.withdrawal_requests.status IS 'processing=new request, approved=admin approved, rejected=admin rejected, paid=funds transferred';

-- Balance formula (computed at app level, NOT stored):
-- Available Balance = SUM(expert_amount) − SUM(paid withdrawals) − SUM(unpaid platform_due)

-- 3. Enable RLS on withdrawal_requests
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Experts can read their own withdrawal requests
CREATE POLICY "Experts can view own withdrawal_requests"
  ON public.withdrawal_requests FOR SELECT
  TO authenticated
  USING (expert_id = auth.uid());

-- Experts can create their own withdrawal requests
CREATE POLICY "Experts can create own withdrawal_requests"
  ON public.withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (expert_id = auth.uid());

-- [DEV ONLY] Allow authenticated users full access for admin dashboard
-- TODO: Replace with proper admin role check in production
CREATE POLICY "DEV_ONLY_admin_full_access_withdrawal_requests"
  ON public.withdrawal_requests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Ensure expert_earnings has proper RLS policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'expert_earnings' 
    AND policyname = 'Experts can view own expert_earnings'
  ) THEN
    EXECUTE 'CREATE POLICY "Experts can view own expert_earnings" ON public.expert_earnings FOR SELECT TO authenticated USING (expert_id = auth.uid())';
  END IF;

  -- [DEV ONLY] Admin full access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'expert_earnings' 
    AND policyname = 'DEV_ONLY_admin_full_access_expert_earnings'
  ) THEN
    EXECUTE 'CREATE POLICY "DEV_ONLY_admin_full_access_expert_earnings" ON public.expert_earnings FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expert_earnings_expert_id ON public.expert_earnings(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_earnings_created_at ON public.expert_earnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_expert_id ON public.withdrawal_requests(expert_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON public.withdrawal_requests(created_at DESC);
