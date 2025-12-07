-- Fix search_path for calculate_level function
CREATE OR REPLACE FUNCTION public.calculate_level(xp integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(xp / 100) + 1);
END;
$$;