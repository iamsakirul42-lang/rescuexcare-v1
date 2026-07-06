-- ============================================================
-- Fix Check Constraints for bookings and expert_earnings
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- 1. Fix bookings.status check constraint
-- Drop the old constraint and add one with ALL statuses used by the app
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN (
    'pending',
    'waiting_assignment',
    'expert_assigned',
    'expert_on_way',
    'expert_arrived',
    'in_progress',
    'service_in_progress',
    'pending_completion_verification',
    'booking_completed',
    'cancelled'
  ));

-- 2. Fix bookings.payment_status check constraint
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_payment_status_check
  CHECK (payment_status IN (
    'pending',
    'paid',
    'cash_collected',
    'refunded',
    'failed'
  ));

-- 3. Fix expert_earnings.payment_status check constraint
ALTER TABLE public.expert_earnings DROP CONSTRAINT IF EXISTS expert_earnings_payment_status_check;
ALTER TABLE public.expert_earnings ADD CONSTRAINT expert_earnings_payment_status_check
  CHECK (payment_status IN (
    'pending',
    'paid',
    'cash_collected',
    'completed',
    'processing'
  ));
