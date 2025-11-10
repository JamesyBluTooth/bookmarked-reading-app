import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AddBookForm } from "@/components/books/AddBookForm";
import { BookCard } from "@/components/books/BookCard";
import { BookDetail } from "@/components/books/BookDetail";
import { Button } from "@/components/ui/button";
import { LogOut, BookMarked } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author?: string;
  cover_url?: string;
  current_page: number;
  total_pages: number;
  is_completed: boolean;
}

export const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching books:", error);
    } else {
      setBooks(data || []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <BookMarked className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Bookmarked</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Add a Book</h2>
            <AddBookForm onBookAdded={fetchBooks} />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">My Books</h2>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : books.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookMarked className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No books yet. Add your first book by entering an ISBN above!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    coverUrl={book.cover_url}
                    currentPage={book.current_page}
                    totalPages={book.total_pages}
                    isCompleted={book.is_completed}
                    onClick={() => setSelectedBookId(book.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedBookId && (
        <BookDetail
          bookId={selectedBookId}
          open={!!selectedBookId}
          onOpenChange={(open) => !open && setSelectedBookId(null)}
          onUpdate={fetchBooks}
        />
      )}
    </div>
  );
};
