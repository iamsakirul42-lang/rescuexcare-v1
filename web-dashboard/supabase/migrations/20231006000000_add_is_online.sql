-- Add is_online column to mechanics table
ALTER TABLE public.mechanics ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
