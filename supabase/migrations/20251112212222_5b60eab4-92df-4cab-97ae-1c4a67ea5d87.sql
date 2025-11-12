-- Fix profiles table RLS - require authentication for viewing
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix achievements table - remove permissive INSERT policy
DROP POLICY IF EXISTS "System can insert achievements" ON public.achievements;

-- Create secure function to award achievements with validation
CREATE OR REPLACE FUNCTION public.award_achievement(
  p_user_id uuid,
  p_achievement_type text,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_achievement_id uuid;
BEGIN
  -- Validate that we're awarding to the authenticated user
  -- This prevents privilege escalation
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot award achievements to other users';
  END IF;
  
  -- Check if achievement already exists to prevent duplicates
  SELECT id INTO v_achievement_id
  FROM public.achievements
  WHERE user_id = p_user_id 
    AND achievement_type = p_achievement_type;
  
  -- If not exists, create it
  IF v_achievement_id IS NULL THEN
    INSERT INTO public.achievements (user_id, achievement_type, metadata)
    VALUES (p_user_id, p_achievement_type, p_metadata)
    RETURNING id INTO v_achievement_id;
  END IF;
  
  RETURN v_achievement_id;
END;
$$;