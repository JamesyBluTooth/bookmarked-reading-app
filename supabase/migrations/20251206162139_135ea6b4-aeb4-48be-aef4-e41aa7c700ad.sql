-- Drop the old table and recreate with merged structure
DROP TABLE IF EXISTS public.book_api_cache;

-- Create new merged cache table
CREATE TABLE public.book_api_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn TEXT NOT NULL UNIQUE,
  google_response JSONB,
  openlib_response JSONB,
  google_cached_at TIMESTAMP WITH TIME ZONE,
  openlib_cached_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for ISBN lookups
CREATE INDEX idx_book_api_cache_isbn ON public.book_api_cache(isbn);

-- Enable RLS
ALTER TABLE public.book_api_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view cache"
  ON public.book_api_cache FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert cache"
  ON public.book_api_cache FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update cache"
  ON public.book_api_cache FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE TRIGGER update_book_api_cache_updated_at
  BEFORE UPDATE ON public.book_api_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();