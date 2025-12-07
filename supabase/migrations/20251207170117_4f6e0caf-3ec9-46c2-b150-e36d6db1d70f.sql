-- Add XP and level tracking to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_reading_date date;

-- Add xp_earned to progress_entries for tracking XP per entry
ALTER TABLE public.progress_entries
ADD COLUMN IF NOT EXISTS xp_earned integer DEFAULT 0;

-- Add xp_earned to notes for tracking XP per note
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS xp_earned integer DEFAULT 0;

-- Create function to calculate level from XP (100 XP per level)
CREATE OR REPLACE FUNCTION public.calculate_level(xp integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(xp / 100) + 1);
END;
$$;

-- Create function to award XP and update level
CREATE OR REPLACE FUNCTION public.award_xp(p_user_id uuid, p_xp_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_total integer;
BEGIN
  -- Update total XP and recalculate level
  UPDATE public.profiles
  SET 
    total_xp = COALESCE(total_xp, 0) + p_xp_amount,
    level = calculate_level(COALESCE(total_xp, 0) + p_xp_amount),
    last_reading_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;