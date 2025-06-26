
-- Update the plan_type check constraint to include 'welcome_bonus'
ALTER TABLE public.user_plans DROP CONSTRAINT IF EXISTS user_plans_plan_type_check;
ALTER TABLE public.user_plans ADD CONSTRAINT user_plans_plan_type_check 
CHECK (plan_type IN ('payg', 'data', 'welcome_bonus'));
