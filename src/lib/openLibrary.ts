import { logError } from './logger';

export interface OpenLibraryBook {
  title?: string;
  authors?: string[];
  covers?: number[];
  number_of_pages?: number;
  publish_date?: string;
  subjects?: string[];
  description?: string | { value: string };
  key?: string;
}

export interface OpenLibraryResponse {
  [key: string]: OpenLibraryBook;
}

export async function fetchBookFromOpenLibrary(isbn: string): Promise<OpenLibraryBook | null> {
  const cleanISBN = isbn.replace(/[^0-9X]/gi, '');
  
  if (!/^(\d{9}[\dX]|\d{13})$/.test(cleanISBN)) {
    throw new Error('Invalid ISBN format');
  }

  try {
    const response = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(cleanISBN)}&format=json&jscmd=data`
    );

    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data: OpenLibraryResponse = await response.json();
    const bookKey = `ISBN:${cleanISBN}`;
    
    if (!data[bookKey]) {
      return null;
    }

    const book = data[bookKey];
    
    // Normalize the response
    return {
      title: book.title,
      authors: book.authors?.map((a: any) => a.name),
      covers: book.covers,
      number_of_pages: book.number_of_pages,
      publish_date: book.publish_date,
      subjects: book.subjects?.map((s: any) => s.name || s),
      description: book.description,
      key: book.key,
    };
  } catch (error) {
    logError(error, 'Open Library API fetch failed');
    return null;
  }
}

export function getOpenLibraryCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}
