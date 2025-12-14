-- Create table for user book edits (community corrections)
CREATE TABLE public.book_user_edits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn TEXT NOT NULL,
  user_id UUID NOT NULL,
  title TEXT,
  author TEXT,
  total_pages INTEGER,
  genres TEXT[],
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(isbn, user_id)
);

-- Enable RLS
ALTER TABLE public.book_user_edits ENABLE ROW LEVEL SECURITY;

-- Users can view all edits for any ISBN (to see community corrections)
CREATE POLICY "Authenticated users can view book edits"
ON public.book_user_edits
FOR SELECT
USING (auth.role() = 'authenticated');

-- Users can insert their own edits
CREATE POLICY "Users can insert their own book edits"
ON public.book_user_edits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own edits
CREATE POLICY "Users can update their own book edits"
ON public.book_user_edits
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own edits
CREATE POLICY "Users can delete their own book edits"
ON public.book_user_edits
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_book_user_edits_updated_at
BEFORE UPDATE ON public.book_user_edits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();