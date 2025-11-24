import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddDiscussionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
  onSuccess: () => void;
}

export function AddDiscussionModal({ open, onOpenChange, clubId, onSuccess }: AddDiscussionModalProps) {
  const [content, setContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBooks();
    }
  }, [open, clubId]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("club_books")
        .select("id, book_title")
        .eq("club_id", clubId)
        .in("status", ["active", "completed"])
        .order("start_date", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("club_discussions")
        .insert({
          club_id: clubId,
          club_book_id: selectedBook || null,
          user_id: user.id,
          content,
          is_spoiler: isSpoiler,
        });

      if (error) throw error;

      // Award achievement for first discussion
      const { count } = await supabase
        .from("club_discussions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("club_id", clubId);

      if (count === 1) {
        await supabase.from("club_achievements").insert({
          club_id: clubId,
          user_id: user.id,
          achievement_type: "discussion_starter",
        });
      }

      toast.success("Discussion posted!");
      setContent("");
      setIsSpoiler(false);
      setSelectedBook("");
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to post discussion");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Discussion</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {books.length > 0 && (
            <div>
              <Label>Related Book (Optional)</Label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.book_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="content">Discussion *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={6}
              maxLength={5000}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="spoiler">Contains Spoilers</Label>
              <p className="text-sm text-muted-foreground">
                Mark if this discussion reveals plot details
              </p>
            </div>
            <Switch
              id="spoiler"
              checked={isSpoiler}
              onCheckedChange={setIsSpoiler}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? "Posting..." : "Post Discussion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
