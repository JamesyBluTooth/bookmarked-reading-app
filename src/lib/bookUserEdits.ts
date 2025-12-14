import { supabase } from '@/integrations/supabase/client';

export interface BookUserEdit {
  id?: string;
  isbn: string;
  user_id: string;
  title?: string;
  author?: string;
  total_pages?: number;
  genres?: string[];
  cover_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get community edits for a book by ISBN (edits from other users)
 */
export async function getCommunityEdit(isbn: string, currentUserId: string): Promise<BookUserEdit | null> {
  try {
    const { data, error } = await supabase
      .from('book_user_edits')
      .select('*')
      .eq('isbn', isbn)
      .neq('user_id', currentUserId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as BookUserEdit;
  } catch {
    return null;
  }
}

/**
 * Get the current user's edit for a book by ISBN
 */
export async function getUserEdit(isbn: string, userId: string): Promise<BookUserEdit | null> {
  try {
    const { data, error } = await supabase
      .from('book_user_edits')
      .select('*')
      .eq('isbn', isbn)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as BookUserEdit;
  } catch {
    return null;
  }
}

/**
 * Save or update a user's book edit
 */
export async function saveUserEdit(edit: Omit<BookUserEdit, 'id' | 'created_at' | 'updated_at'>): Promise<BookUserEdit | null> {
  try {
    // Check if user already has an edit for this ISBN
    const existing = await getUserEdit(edit.isbn, edit.user_id);

    if (existing) {
      // Update existing edit
      const { data, error } = await supabase
        .from('book_user_edits')
        .update({
          title: edit.title,
          author: edit.author,
          total_pages: edit.total_pages,
          genres: edit.genres,
          cover_url: edit.cover_url,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as BookUserEdit;
    } else {
      // Insert new edit
      const { data, error } = await supabase
        .from('book_user_edits')
        .insert(edit)
        .select()
        .single();

      if (error) throw error;
      return data as BookUserEdit;
    }
  } catch (error) {
    console.error('Failed to save user edit:', error);
    return null;
  }
}

/**
 * Accept a community edit - creates a copy under the current user's ID
 */
export async function acceptCommunityEdit(communityEdit: BookUserEdit, currentUserId: string): Promise<BookUserEdit | null> {
  return saveUserEdit({
    isbn: communityEdit.isbn,
    user_id: currentUserId,
    title: communityEdit.title,
    author: communityEdit.author,
    total_pages: communityEdit.total_pages,
    genres: communityEdit.genres,
    cover_url: communityEdit.cover_url,
  });
}

/**
 * Apply user edits to book data
 */
export function applyUserEdits<T extends { isbn?: string | null }>(
  book: T, 
  edit: BookUserEdit | null
): T {
  if (!edit) return book;
  
  return {
    ...book,
    title: edit.title || (book as any).title,
    author: edit.author || (book as any).author,
    total_pages: edit.total_pages || (book as any).total_pages,
    genres: edit.genres || (book as any).genres,
    cover_url: edit.cover_url || (book as any).cover_url,
  };
}
