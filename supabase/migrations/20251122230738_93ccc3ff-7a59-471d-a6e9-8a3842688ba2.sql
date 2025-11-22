-- Enable users to view completed books from friends
CREATE POLICY "Users can view friends' completed books"
ON books FOR SELECT
TO authenticated
USING (
  is_completed = true 
  AND user_id IN (
    SELECT following_id 
    FROM friendships 
    WHERE follower_id = auth.uid()
  )
);

-- Enable users to view completed challenges from friends
CREATE POLICY "Users can view friends' completed challenges"
ON daily_challenges FOR SELECT
TO authenticated
USING (
  completed = true 
  AND user_id IN (
    SELECT following_id 
    FROM friendships 
    WHERE follower_id = auth.uid()
  )
);