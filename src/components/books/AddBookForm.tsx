import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { fetchBookByISBN } from "@/lib/googleBooks";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddBookFormProps {
  onBookAdded: () => void;
}

export const AddBookForm = ({ onBookAdded }: AddBookFormProps) => {
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
        cover_url: bookData.imageLinks?.thumbnail?.replace('http:', 'https:'),
        total_pages: bookData.pageCount || 0,
      });

      if (error) throw error;

      toast({
        title: "Book added!",
        description: `${bookData.title} has been added to your collection.`,
      });

      setIsbn("");
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <Label htmlFor="isbn" className="sr-only">ISBN</Label>
        <Input
          id="isbn"
          placeholder="Enter ISBN (e.g., 9780545010221)"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        <Search className="w-4 h-4 mr-2" />
        {loading ? "Searching..." : "Add Book"}
      </Button>
    </form>
  );
};
