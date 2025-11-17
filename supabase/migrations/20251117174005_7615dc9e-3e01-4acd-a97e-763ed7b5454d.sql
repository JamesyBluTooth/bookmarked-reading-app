-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS daily_goal_type TEXT,
ADD COLUMN IF NOT EXISTS daily_goal_value INTEGER;

-- Add missing columns to books table
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Add missing columns to daily_challenges table
ALTER TABLE public.daily_challenges
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create trigger to update updated_at on daily_challenges
CREATE OR REPLACE FUNCTION update_daily_challenges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_daily_challenges_updated_at_trigger ON public.daily_challenges;
CREATE TRIGGER update_daily_challenges_updated_at_trigger
  BEFORE UPDATE ON public.daily_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_challenges_updated_at();