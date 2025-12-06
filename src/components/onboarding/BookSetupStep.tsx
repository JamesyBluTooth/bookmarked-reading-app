import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, BookOpen, AlertTriangle } from "lucide-react";
import { lookupBookByISBN, CanonicalBook } from "@/lib/hybridBookLookup";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataCompletenessIndicator } from "@/components/books/DataCompletenessIndicator";

interface BookSetupStepProps {
  onBookAdded: () => void;
}

export const BookSetupStep = ({ onBookAdded }: BookSetupStepProps) => {
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
          description: "No book found with that ISBN. Please check and try again.",
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

      toast({
        title: "Book added!",
        description: `${previewBook.title} has been added to your collection.`,
      });

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

  return (
    <div className="space-y-8 animate-scale-in">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Choose Your First Book</h1>
        <p className="text-muted-foreground">Start your reading journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="isbn">Enter ISBN</Label>
          <div className="flex gap-2">
            <Input
              id="isbn"
              placeholder="e.g., 9780545010221"
              value={isbn}
              onChange={(e) => {
                setIsbn(e.target.value);
                if (previewBook) setPreviewBook(null);
              }}
              required
              disabled={loading}
              className="transition-all focus:scale-[1.02]"
            />
            {!previewBook && (
              <Button type="submit" disabled={loading || !isbn.trim()}>
                <Search className="w-4 h-4 mr-2" />
                {loading ? "..." : "Search"}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Find the ISBN on the back cover of your book
          </p>
        </div>

        {previewBook && (
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex gap-4">
              {previewBook.cover_url ? (
                <img
                  src={previewBook.cover_url}
                  alt={previewBook.title}
                  className="w-20 h-28 object-cover rounded shadow-sm"
                />
              ) : (
                <div className="w-20 h-28 bg-muted rounded flex items-center justify-center">
                  <span className="text-xs text-muted-foreground text-center px-1">No cover</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold">{previewBook.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {previewBook.authors || "Unknown author"}
                </p>
                {previewBook.page_count && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {previewBook.page_count} pages
                  </p>
                )}
                
                <div className="mt-2">
                  <DataCompletenessIndicator 
                    missingFields={previewBook.missing_fields} 
                  />
                </div>

                {previewBook.missing_fields.length > 0 && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>Some details missing - you can add them later</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 h-12" 
                disabled={loading}
              >
                {loading ? "Adding..." : "Add to Collection"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setPreviewBook(null);
                  setIsbn("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </form>

      <Button
        type="button"
        variant="outline"
        onClick={onBookAdded}
        className="w-full"
        disabled={loading}
      >
        Skip for now
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <p>You can add more books later from your library</p>
      </div>
    </div>
  );
};
