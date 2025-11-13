import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/useAppStore";
import { SyncManager } from "@/lib/syncManager";

interface UpdateProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  currentPage: number;
  totalPages: number;
  onUpdate: () => void;
}

export const UpdateProgressModal = ({
  open,
  onOpenChange,
  bookId,
  currentPage,
  totalPages,
  onUpdate,
}: UpdateProgressModalProps) => {
  const [pagesRead, setPagesRead] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const addProgressEntry = useAppStore((state) => state.addProgressEntry);
  const updateBook = useAppStore((state) => state.updateBook);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pages = parseInt(pagesRead);
      const minutes = parseInt(timeSpent);

      if (pages <= 0 || minutes <= 0) {
        toast({
          title: "Invalid input",
          description: "Please enter positive numbers for pages and time.",
          variant: "destructive",
        });
        return;
      }

      const newCurrentPage = Math.min(currentPage + pages, totalPages);

      // Add progress entry
      addProgressEntry({
        book_id: bookId,
        pages_read: pages,
        time_spent_minutes: minutes,
      });

      // Update book current page
      updateBook(bookId, { current_page: newCurrentPage });

      // Trigger sync to cloud
      await SyncManager.uploadSnapshot();

      toast({
        title: "Progress updated!",
        description: `You've read ${pages} pages in ${minutes} minutes.`,
      });

      setPagesRead("");
      setTimeSpent("");
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
          <DialogTitle>Update Progress</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pages">How many pages did you read?</Label>
            <Input
              id="pages"
              type="number"
              min="1"
              placeholder="e.g., 25"
              value={pagesRead}
              onChange={(e) => setPagesRead(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Currently on page {currentPage} of {totalPages}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">How long did it take? (minutes)</Label>
            <Input
              id="time"
              type="number"
              min="1"
              placeholder="e.g., 30"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Progress"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
