-- Fix RLS policies for book_clubs table

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create clubs" ON book_clubs;

-- Recreate INSERT policy with correct check
CREATE POLICY "Authenticated users can create clubs"
ON book_clubs FOR INSERT
WITH CHECK (
  auth.uid() = created_by
);