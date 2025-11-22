-- Add CHECK constraints to enforce input validation limits at database level
-- These constraints provide an additional security layer beyond client-side validation

-- Limit notes content to 5000 characters
ALTER TABLE notes ADD CONSTRAINT notes_content_length 
  CHECK (char_length(content) <= 5000);

-- Limit profile display_name to 50 characters
ALTER TABLE profiles ADD CONSTRAINT profiles_display_name_length 
  CHECK (char_length(display_name) <= 50);

-- Limit profile bio to 500 characters
ALTER TABLE profiles ADD CONSTRAINT profiles_bio_length 
  CHECK (char_length(bio) <= 500);

-- Limit book review to 2000 characters
ALTER TABLE books ADD CONSTRAINT books_review_length 
  CHECK (char_length(review) <= 2000);