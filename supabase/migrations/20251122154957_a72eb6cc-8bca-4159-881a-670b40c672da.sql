-- Add avatar_seed and avatar_type columns to profiles table
ALTER TABLE profiles 
ADD COLUMN avatar_seed TEXT,
ADD COLUMN avatar_type TEXT DEFAULT 'upload' CHECK (avatar_type IN ('upload', 'generated'));

-- For existing users with no avatar, generate a seed from their user_id
UPDATE profiles 
SET avatar_seed = user_id::text, 
    avatar_type = 'generated' 
WHERE avatar_url IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.avatar_seed IS 'Seed string for generating DiceBear Personas avatars';
COMMENT ON COLUMN profiles.avatar_type IS 'Type of avatar: upload (user uploaded photo) or generated (DiceBear Personas)';