-- Create table for avatar customizations
CREATE TABLE public.avatar_customizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  background_color text NOT NULL,
  skin_color text NOT NULL,
  eyes text NOT NULL,
  hair text NOT NULL,
  hair_color text NOT NULL,
  facial_hair text NOT NULL,
  body text NOT NULL,
  clothing_color text NOT NULL,
  mouth text NOT NULL,
  nose text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.avatar_customizations ENABLE ROW LEVEL SECURITY;

-- Users can view their own avatar customizations
CREATE POLICY "Users can view their own avatar customizations"
ON public.avatar_customizations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own avatar customizations
CREATE POLICY "Users can insert their own avatar customizations"
ON public.avatar_customizations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own avatar customizations
CREATE POLICY "Users can update their own avatar customizations"
ON public.avatar_customizations
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_avatar_customizations_updated_at
BEFORE UPDATE ON public.avatar_customizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();