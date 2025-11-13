import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, BookOpen } from "lucide-react";
import { fetchBookByISBN } from "@/lib/googleBooks";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BookSetupStepProps {
  onBookAdded: () => void;
}

export const BookSetupStep = ({ onBookAdded }: BookSetupStepProps) => {
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookData = await fetchBookByISBN(isbn);

      if (!bookData) {
        toast({
          title: "Book not found",
          description: "No book found with that ISBN. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("books").insert({
        user_id: user.id,
        isbn: isbn,
        title: bookData.title,
        author: bookData.authors?.join(", "),
        genres: bookData.categories || [],
        cover_url: bookData.imageLinks?.thumbnail?.replace("http:", "https:"),
        total_pages: bookData.pageCount || 0,
      });

      if (error) throw error;

      toast({
        title: "Book added! 📚",
        description: `${bookData.title} has been added to your collection.`,
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

  return (
    <div className="space-y-8 animate-scale-in">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Choose Your First Book 📖</h1>
        <p className="text-muted-foreground">Start your reading journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="isbn">Enter ISBN</Label>
          <Input
            id="isbn"
            placeholder="e.g., 9780545010221"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            required
            className="transition-all focus:scale-[1.02]"
          />
          <p className="text-xs text-muted-foreground">
            Find the ISBN on the back cover of your book
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-lg transition-all hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Add Book
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <p>You can add more books later from your library</p>
      </div>
    </div>
  );
};
