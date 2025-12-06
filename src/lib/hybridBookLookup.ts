import { supabase } from '@/integrations/supabase/client';
import { fetchBookByISBN, GoogleBook } from './googleBooks';
import { fetchBookFromOpenLibrary, getOpenLibraryCoverUrl, OpenLibraryBook } from './openLibrary';
import { logError } from './logger';

export interface CanonicalBook {
  id?: string;
  isbn: string;
  title: string;
  authors: string | null;
  cover_url: string | null;
  description: string | null;
  page_count: number | null;
  published_date: string | null;
  categories: string[];
  google_books_id: string | null;
  open_library_key: string | null;
  source_google: boolean;
  source_open_library: boolean;
  missing_fields: string[];
  community_edited: boolean;
}

interface CacheEntry {
  response: any;
  expires_at: string;
}

const CACHE_DURATION_HOURS = 24 * 7; // 7 days

// Required fields for a "complete" book record
const REQUIRED_FIELDS = ['title', 'authors', 'page_count', 'cover_url'] as const;

function calculateMissingFields(book: Partial<CanonicalBook>): string[] {
  const missing: string[] = [];
  
  if (!book.title) missing.push('title');
  if (!book.authors) missing.push('authors');
  if (!book.page_count || book.page_count <= 0) missing.push('page_count');
  if (!book.cover_url) missing.push('cover_url');
  if (!book.description) missing.push('description');
  if (!book.categories || book.categories.length === 0) missing.push('categories');
  if (!book.published_date) missing.push('published_date');
  
  return missing;
}

export function getDataCompletenessScore(missingFields: string[]): { score: number; label: string; color: string } {
  const totalFields = 7;
  const completedFields = totalFields - missingFields.length;
  const score = Math.round((completedFields / totalFields) * 100);
  
  if (score >= 90) return { score, label: 'Complete', color: 'text-green-500' };
  if (score >= 70) return { score, label: 'Good', color: 'text-emerald-500' };
  if (score >= 50) return { score, label: 'Partial', color: 'text-yellow-500' };
  return { score, label: 'Incomplete', color: 'text-orange-500' };
}

async function getCachedResponse(isbn: string, source: 'google' | 'openlib'): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('book_api_cache')
      .select('response, expires_at')
      .eq('isbn', isbn)
      .eq('source', source)
      .single();

    if (error || !data) return null;

    // Check if cache is still valid
    if (new Date(data.expires_at) < new Date()) {
      return null;
    }

    return data.response;
  } catch {
    return null;
  }
}

async function setCachedResponse(isbn: string, source: 'google' | 'openlib', response: any): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

    await supabase
      .from('book_api_cache')
      .upsert({
        isbn,
        source,
        response,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'isbn,source'
      });
  } catch (error) {
    logError(error, 'Failed to cache API response');
  }
}

async function fetchGoogleBooksWithCache(isbn: string): Promise<GoogleBook | null> {
  // Check cache first
  const cached = await getCachedResponse(isbn, 'google');
  if (cached) return cached;

  // Fetch from API
  const result = await fetchBookByISBN(isbn);
  
  // Cache the result (even if null, to avoid repeated calls)
  if (result) {
    await setCachedResponse(isbn, 'google', result);
  }
  
  return result;
}

async function fetchOpenLibraryWithCache(isbn: string): Promise<OpenLibraryBook | null> {
  // Check cache first
  const cached = await getCachedResponse(isbn, 'openlib');
  if (cached) return cached;

  // Fetch from API
  const result = await fetchBookFromOpenLibrary(isbn);
  
  // Cache the result
  if (result) {
    await setCachedResponse(isbn, 'openlib', result);
  }
  
  return result;
}

function mergeBookData(
  isbn: string,
  google: GoogleBook | null,
  openLib: OpenLibraryBook | null
): CanonicalBook {
  const getDescription = (ol: OpenLibraryBook | null): string | null => {
    if (!ol?.description) return null;
    if (typeof ol.description === 'string') return ol.description;
    return ol.description.value || null;
  };

  const getCoverUrl = (): string | null => {
    // Prefer Google Books cover (usually higher quality)
    if (google?.imageLinks?.thumbnail) {
      return google.imageLinks.thumbnail.replace('http:', 'https:');
    }
    // Fallback to Open Library cover
    if (openLib?.covers && openLib.covers.length > 0) {
      return getOpenLibraryCoverUrl(openLib.covers[0], 'M');
    }
    return null;
  };

  const merged: CanonicalBook = {
    isbn,
    title: google?.title || openLib?.title || 'Unknown Title',
    authors: google?.authors?.join(', ') || openLib?.authors?.join(', ') || null,
    cover_url: getCoverUrl(),
    description: getDescription(openLib) || null,
    page_count: (google?.pageCount && google.pageCount > 0) ? google.pageCount : (openLib?.number_of_pages || null),
    published_date: openLib?.publish_date || null,
    categories: google?.categories || openLib?.subjects || [],
    google_books_id: null, // Would need to extract from Google response
    open_library_key: openLib?.key || null,
    source_google: google !== null,
    source_open_library: openLib !== null,
    missing_fields: [],
    community_edited: false,
  };

  merged.missing_fields = calculateMissingFields(merged);

  return merged;
}

export async function lookupBookByISBN(isbn: string): Promise<CanonicalBook | null> {
  const cleanISBN = isbn.replace(/[^0-9X]/gi, '');
  
  if (!/^(\d{9}[\dX]|\d{13})$/.test(cleanISBN)) {
    throw new Error('Invalid ISBN format. Please enter a valid 10 or 13 digit ISBN.');
  }

  // Step 1: Check if we already have this book in canonical_books
  const { data: existingBook, error: fetchError } = await supabase
    .from('canonical_books')
    .select('*')
    .eq('isbn', cleanISBN)
    .single();

  if (existingBook && !fetchError) {
    return existingBook as CanonicalBook;
  }

  // Step 2: Primary lookup - Google Books
  let googleData: GoogleBook | null = null;
  try {
    googleData = await fetchGoogleBooksWithCache(cleanISBN);
  } catch (error) {
    logError(error, 'Google Books lookup failed');
  }

  // Step 3: Determine if we need secondary lookup
  const needsSecondary = !googleData || 
    !googleData.pageCount || 
    !googleData.authors?.length ||
    !googleData.imageLinks?.thumbnail;

  // Step 4: Secondary lookup - Open Library (if needed)
  let openLibData: OpenLibraryBook | null = null;
  if (needsSecondary) {
    try {
      openLibData = await fetchOpenLibraryWithCache(cleanISBN);
    } catch (error) {
      logError(error, 'Open Library lookup failed');
    }
  }

  // Step 5: If both APIs returned nothing, return null
  if (!googleData && !openLibData) {
    return null;
  }

  // Step 6: Merge data from both sources
  const mergedBook = mergeBookData(cleanISBN, googleData, openLibData);

  // Step 7: If we used Open Library or have missing fields, save to canonical_books
  if (openLibData || mergedBook.missing_fields.length > 0) {
    try {
      const { data: savedBook, error: insertError } = await supabase
        .from('canonical_books')
        .insert({
          isbn: mergedBook.isbn,
          title: mergedBook.title,
          authors: mergedBook.authors,
          cover_url: mergedBook.cover_url,
          description: mergedBook.description,
          page_count: mergedBook.page_count,
          published_date: mergedBook.published_date,
          categories: mergedBook.categories,
          google_books_id: mergedBook.google_books_id,
          open_library_key: mergedBook.open_library_key,
          source_google: mergedBook.source_google,
          source_open_library: mergedBook.source_open_library,
          missing_fields: mergedBook.missing_fields,
        })
        .select()
        .single();

      if (savedBook && !insertError) {
        return savedBook as CanonicalBook;
      }
    } catch (error) {
      logError(error, 'Failed to save canonical book');
    }
  }

  return mergedBook;
}

export async function updateCanonicalBook(
  isbn: string,
  updates: Partial<CanonicalBook>,
  userId: string
): Promise<CanonicalBook | null> {
  // Recalculate missing fields based on updates
  const { data: currentBook } = await supabase
    .from('canonical_books')
    .select('*')
    .eq('isbn', isbn)
    .single();

  if (!currentBook) return null;

  const mergedData = { ...currentBook, ...updates };
  const newMissingFields = calculateMissingFields(mergedData);

  const { data, error } = await supabase
    .from('canonical_books')
    .update({
      ...updates,
      missing_fields: newMissingFields,
      community_edited: true,
      last_edited_by: userId,
    })
    .eq('isbn', isbn)
    .select()
    .single();

  if (error) {
    logError(error.message, 'Failed to update canonical book');
    return null;
  }

  return data as CanonicalBook;
}
