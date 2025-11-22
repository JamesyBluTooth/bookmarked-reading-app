-- Fix existing data: convert 0 total_pages to null
UPDATE books 
SET total_pages = NULL 
WHERE total_pages = 0;

-- Add check constraint to ensure total_pages is either null or positive
ALTER TABLE books 
ADD CONSTRAINT books_total_pages_positive 
CHECK (total_pages IS NULL OR total_pages > 0);