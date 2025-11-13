import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  onUpdate: () => void;
}

export const AddNoteModal = ({
  open,
  onOpenChange,
  bookId,
  onUpdate,
}: AddNoteModalProps) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("notes")
        .insert({
          book_id: bookId,
          content: note,
        });

      if (error) throw error;

      toast({
        title: "Note added!",
        description: "Your note has been saved.",
      });

      setNote("");
      onOpenChange(false);
      onUpdate();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note">Your thoughts</Label>
            <Textarea
              id="note"
              placeholder="Write your thoughts about this book..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              rows={6}
              className="resize-none"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Note"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
