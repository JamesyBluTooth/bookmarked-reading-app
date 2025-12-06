import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, AlertTriangle } from "lucide-react";
import { lookupBookByISBN, CanonicalBook } from "@/lib/hybridBookLookup";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataCompletenessIndicator } from "./DataCompletenessIndicator";

interface AddBookFormProps {
  onBookAdded: () => void;
}

export const AddBookForm = ({ onBookAdded }: AddBookFormProps) => {
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewBook, setPreviewBook] = useState<CanonicalBook | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!isbn.trim()) return;
    
    setLoading(true);
    setPreviewBook(null);

    try {
      const bookData = await lookupBookByISBN(isbn);
      
      if (!bookData) {
        toast({
          title: "Book not found",
          description: "No book found with that ISBN in Google Books or Open Library. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      setPreviewBook(bookData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async () => {
    if (!previewBook) return;
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("books").insert({
        user_id: user.id,
        isbn: previewBook.isbn,
        title: previewBook.title,
        author: previewBook.authors,
        genres: previewBook.categories || [],
        cover_url: previewBook.cover_url,
        total_pages: previewBook.page_count,
      });

      if (error) throw error;

      const hasIncompleteData = previewBook.missing_fields.length > 0;

      if (hasIncompleteData) {
        toast({
          title: "Book added with incomplete data",
          description: "Some details are missing. You can edit them in the book details to help improve the data.",
        });
      } else {
        toast({
          title: "Book added!",
          description: `${previewBook.title} has been added to your collection.`,
        });
      }

      setIsbn("");
      setPreviewBook(null);
      onBookAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewBook) {
      await handleAddBook();
    } else {
      await handleSearch();
    }
  };

  const handleReset = () => {
    setPreviewBook(null);
    setIsbn("");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="isbn" className="sr-only">ISBN</Label>
          <Input
            id="isbn"
            placeholder="Enter ISBN (e.g., 9780545010221)"
            value={isbn}
            onChange={(e) => {
              setIsbn(e.target.value);
              if (previewBook) setPreviewBook(null);
            }}
            required
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Searching..." : previewBook ? "Add Book" : "Search"}
        </Button>
        {previewBook && (
          <Button type="button" variant="outline" onClick={handleReset}>
            Cancel
          </Button>
        )}
      </form>

      {previewBook && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex gap-4">
            {previewBook.cover_url ? (
              <img
                src={previewBook.cover_url}
                alt={previewBook.title}
                className="w-16 h-24 object-cover rounded shadow-sm"
              />
            ) : (
              <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                <span className="text-xs text-muted-foreground">No cover</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{previewBook.title}</h4>
              <p className="text-sm text-muted-foreground truncate">
                {previewBook.authors || "Unknown author"}
              </p>
              {previewBook.page_count && (
                <p className="text-xs text-muted-foreground">
                  {previewBook.page_count} pages
                </p>
              )}
              
              <div className="mt-2 flex items-center gap-3">
                <DataCompletenessIndicator 
                  missingFields={previewBook.missing_fields} 
                />
                
                {(previewBook.source_google || previewBook.source_open_library) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Sources:</span>
                    {previewBook.source_google && (
                      <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        Google
                      </span>
                    )}
                    {previewBook.source_open_library && (
                      <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                        Open Library
                      </span>
                    )}
                  </div>
                )}
              </div>

              {previewBook.missing_fields.length > 0 && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    Some details missing. You can edit them after adding to help improve data quality.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
