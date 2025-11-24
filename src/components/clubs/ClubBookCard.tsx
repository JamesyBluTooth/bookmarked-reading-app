import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar } from "lucide-react";
import { ClubReadingProgress } from "./ClubReadingProgress";
import { format } from "date-fns";
import { toast } from "sonner";

interface ClubBookCardProps {
  clubId: string;
}

export function ClubBookCard({ clubId }: ClubBookCardProps) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, [clubId]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("club_books")
        .select("*")
        .eq("club_id", clubId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      toast.error("Failed to load books");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "upcoming":
        return "bg-blue-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading books...</div>;
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No books assigned yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <Card key={book.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex gap-4 flex-1">
                {book.book_cover_url && (
                  <img
                    src={book.book_cover_url}
                    alt={book.book_title}
                    className="w-24 h-32 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{book.book_title}</h3>
                    <Badge className={getStatusColor(book.status)}>
                      {book.status}
                    </Badge>
                  </div>
                  {book.book_author && (
                    <p className="text-muted-foreground mb-2">by {book.book_author}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(book.start_date), "MMM d")} - {format(new Date(book.end_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    {book.total_pages && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{book.total_pages} pages</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {book.status === "active" && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedBook(selectedBook === book.id ? null : book.id)}
                >
                  {selectedBook === book.id ? "Hide Progress" : "View Progress"}
                </Button>
              )}
            </div>
          </CardHeader>

          {selectedBook === book.id && (
            <CardContent>
              <ClubReadingProgress clubBookId={book.id} />
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
