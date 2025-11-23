-- Phase 1: Fix RLS policies for social features

-- Add policy to allow authenticated users to view avatar customizations
-- This enables friends' custom avatars to display in social features
CREATE POLICY "Authenticated users can view avatar customizations"
ON avatar_customizations FOR SELECT
USING (auth.role() = 'authenticated');

-- Add policy to allow users to view their friends' reading stats
-- This enables the leaderboard to display friends' statistics
CREATE POLICY "Users can view friends' reading stats"
ON reading_stats FOR SELECT
USING (
  user_id IN (
    SELECT following_id 
    FROM friendships 
    WHERE follower_id = auth.uid()
  )
);

-- Phase 3: Add missing database-level validation constraints

-- Add length constraints for books table (only missing ones)
ALTER TABLE books 
ADD CONSTRAINT books_title_length 
CHECK (char_length(title) > 0 AND char_length(title) <= 500);

ALTER TABLE books 
ADD CONSTRAINT books_author_length 
CHECK (author IS NULL OR char_length(author) <= 200);