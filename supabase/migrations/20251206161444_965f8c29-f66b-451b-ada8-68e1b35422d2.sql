-- Create canonical_books table for shared book metadata
CREATE TABLE public.canonical_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn TEXT UNIQUE,
  title TEXT NOT NULL,
  authors TEXT,
  cover_url TEXT,
  description TEXT,
  page_count INTEGER,
  published_date TEXT,
  categories TEXT[],
  
  -- Source tracking
  google_books_id TEXT,
  open_library_key TEXT,
  source_google BOOLEAN DEFAULT false,
  source_open_library BOOLEAN DEFAULT false,
  
  -- Data completeness tracking
  missing_fields TEXT[] DEFAULT '{}',
  
  -- Community edits
  community_edited BOOLEAN DEFAULT false,
  last_edited_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.canonical_books ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view canonical books (shared resource)
CREATE POLICY "Authenticated users can view canonical books"
ON public.canonical_books
FOR SELECT
USING (auth.role() = 'authenticated');

-- Anyone authenticated can insert canonical books
CREATE POLICY "Authenticated users can insert canonical books"
ON public.canonical_books
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Anyone authenticated can update canonical books (community editable)
CREATE POLICY "Authenticated users can update canonical books"
ON public.canonical_books
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_canonical_books_updated_at
BEFORE UPDATE ON public.canonical_books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster ISBN lookups
CREATE INDEX idx_canonical_books_isbn ON public.canonical_books(isbn);

-- Create API cache table for storing raw API responses
CREATE TABLE public.book_api_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn TEXT NOT NULL,
  source TEXT NOT NULL, -- 'google' or 'openlib'
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(isbn, source)
);

-- Enable RLS
ALTER TABLE public.book_api_cache ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read cache
CREATE POLICY "Authenticated users can view cache"
ON public.book_api_cache
FOR SELECT
USING (auth.role() = 'authenticated');

-- Anyone authenticated can insert to cache
CREATE POLICY "Authenticated users can insert cache"
ON public.book_api_cache
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create index for cache lookups
CREATE INDEX idx_book_api_cache_isbn_source ON public.book_api_cache(isbn, source);