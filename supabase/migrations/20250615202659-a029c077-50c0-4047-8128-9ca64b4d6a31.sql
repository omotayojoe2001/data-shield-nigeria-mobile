
-- Add missing columns to daily_bonus_claims table
ALTER TABLE public.daily_bonus_claims 
ADD COLUMN days_claimed INTEGER NOT NULL DEFAULT 0,
ADD COLUMN is_eligible BOOLEAN NOT NULL DEFAULT true;
