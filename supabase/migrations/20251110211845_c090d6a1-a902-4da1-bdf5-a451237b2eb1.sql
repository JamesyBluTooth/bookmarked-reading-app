-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  isbn TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  genres TEXT[],
  cover_url TEXT,
  total_pages INTEGER NOT NULL,
  current_page INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  rating INTEGER,
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create progress_entries table
CREATE TABLE public.progress_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  pages_read INTEGER NOT NULL,
  time_spent_minutes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for books
CREATE POLICY "Users can view their own books"
  ON public.books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
  ON public.books FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
  ON public.books FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for progress_entries
CREATE POLICY "Users can view progress for their books"
  ON public.progress_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.books WHERE books.id = progress_entries.book_id AND books.user_id = auth.uid()
  ));

CREATE POLICY "Users can create progress for their books"
  ON public.progress_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.books WHERE books.id = progress_entries.book_id AND books.user_id = auth.uid()
  ));

-- RLS Policies for notes
CREATE POLICY "Users can view notes for their books"
  ON public.notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.books WHERE books.id = notes.book_id AND books.user_id = auth.uid()
  ));

CREATE POLICY "Users can create notes for their books"
  ON public.notes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.books WHERE books.id = notes.book_id AND books.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete notes for their books"
  ON public.notes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.books WHERE books.id = notes.book_id AND books.user_id = auth.uid()
  ));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();