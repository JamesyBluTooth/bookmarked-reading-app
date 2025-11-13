-- Add onboarding and goal fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS daily_goal_type TEXT CHECK (daily_goal_type IN ('pages', 'minutes')),
ADD COLUMN IF NOT EXISTS daily_goal_value INTEGER;