-- ============================================================
-- RescueX Wallet System — Development Seed Data
-- Run ONLY in development/staging environments
-- DO NOT run in production
-- ============================================================

-- Sample expert earnings (uses existing expert_profiles IDs)
-- Replace the expert_id below with a real expert_profiles.id from your dev database

INSERT INTO public.expert_earnings (expert_id, booking_id, service_name, customer_name, service_amount, commission_rate, commission_amount, expert_amount, payment_method, payment_status, platform_due, platform_due_status)
VALUES
  -- Online payment job (platform collects, no due)
  ('11111111-1111-1111-1111-111111111111', 'BK1001', 'Battery Replacement', 'Amit Roy', 1400, 0.13, 182, 1218, 'online', 'completed', 0, 'not_applicable'),

  -- Cash payment job (expert collects full amount, owes platform commission)
  ('11111111-1111-1111-1111-111111111111', 'BK1002', 'Flat Tyre / Puncture', 'Suman Das', 1000, 0.13, 130, 870, 'cash', 'completed', 130, 'unpaid'),

  -- Another online job
  ('11111111-1111-1111-1111-111111111111', 'BK1003', 'Engine Oil Change', 'Priya Sen', 2500, 0.13, 325, 2175, 'online', 'completed', 0, 'not_applicable'),

  -- Cash job (already settled with platform)
  ('11111111-1111-1111-1111-111111111111', 'BK1004', 'AC Repair', 'Rajesh Ghosh', 3000, 0.13, 390, 2610, 'cash', 'completed', 390, 'paid')
ON CONFLICT DO NOTHING;

-- Expected wallet calculations for the above seed data:
-- Total Expert Earnings:  1218 + 870 + 2175 + 2610 = ₹6,873.00
-- Total Withdrawn:        ₹0.00 (no withdrawal_requests seeded)
-- Unpaid RescueX Due:     ₹130.00 (BK1002 cash job)
-- Available Balance:      6873 - 0 - 130 = ₹6,743.00
-- Max Withdrawable:       ₹6,743.00
