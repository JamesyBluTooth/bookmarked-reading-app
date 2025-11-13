-- Add ISBN column to books table
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS isbn TEXT;