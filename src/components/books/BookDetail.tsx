import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Clock, FileText, Star, CheckCircle2 } from "lucide-react";
import { UpdateProgressModal } from "./UpdateProgressModal";
import { AddNoteModal } from "./AddNoteModal";
import { CompleteBookModal } from "./CompleteBookModal";
import { TimelineItem } from "./TimelineItem";
import { useAppStore } from "@/store/useAppStore";
import { SyncManager } from "@/lib/syncManager";
import { useToast } from "@/hooks/use-toast";

interface BookDetailProps {
  bookId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

interface TimelineEntry {
  id: string;
  type: 'progress' | 'note' | 'completion' | 'incomplete';
  created_at: string;
  content?: string;
  pages_read?: number;
  time_spent_minutes?: number;
  rating?: number;
  review?: string;
}

export const BookDetail = ({ bookId, open, onOpenChange, onUpdate }: BookDetailProps) => {
  const book = useAppStore((state) => state.getBook(bookId));
  const getProgressEntries = useAppStore((state) => state.getProgressEntries);
  const getNotes = useAppStore((state) => state.getNotes);
  const updateBook = useAppStore((state) => state.updateBook);
  const addNote = useAppStore((state) => state.addNote);
  
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && bookId && book) {
      fetchTimeline();
    }
  }, [open, bookId, book]);

  const fetchTimeline = () => {
    if (!book) return;
    
    const progressEntries = getProgressEntries(bookId);
    const notes = getNotes(bookId);

    const timelineEntries: TimelineEntry[] = [];

    // Add progress entries
    progressEntries.forEach((entry) => {
      timelineEntries.push({
        id: entry.id,
        type: 'progress',
        created_at: entry.created_at,
        pages_read: entry.pages_read,
        time_spent_minutes: entry.time_spent_minutes,
      });
    });

    // Add notes
    notes.forEach((note) => {
      timelineEntries.push({
        id: note.id,
        type: 'note',
        created_at: note.created_at,
        content: note.content,
      });
    });

    // Add completion marker if book is completed
    if (book.is_completed) {
      timelineEntries.push({
        id: `completion-${book.id}`,
        type: 'completion',
        created_at: book.updated_at,
        rating: book.rating,
        review: book.review,
      });
    }

    // Sort by date descending
    timelineEntries.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setTimeline(timelineEntries);
  };

  const handleMarkIncomplete = async () => {
    if (!book) return;

    updateBook(book.id, {
      is_completed: false,
      current_page: 0,
    });

    addNote({
      book_id: book.id,
      content: "Marked as incomplete",
    });

    await SyncManager.uploadSnapshot();

    toast({
      title: "Book marked as incomplete",
      description: "You can start reading this book again.",
    });

    fetchTimeline();
    onUpdate();
  };

  if (!book) {
    return null;
  }

  const progressPercentage = book.total_pages > 0 
    ? Math.round((book.current_page / book.total_pages) * 100) 
    : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Book Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Book Header */}
            <div className="flex gap-4">
              {book.cover_url && (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-24 h-36 object-cover rounded-lg shadow-md"
                />
              )}
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-semibold text-foreground">{book.title}</h3>
                {book.author && (
                  <p className="text-muted-foreground">by {book.author}</p>
                )}
                {book.genres && book.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {book.genres.map((genre, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">
                  {book.current_page} / {book.total_pages} pages ({progressPercentage}%)
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {!book.is_completed ? (
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProgressModal(true)}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Update
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNoteModal(true)}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Note
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompleteModal(true)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Complete
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Completed!</span>
                  {book.rating && (
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="text-sm">{book.rating}/5</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkIncomplete}
                >
                  Mark as Incomplete
                </Button>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Reading History
              </h4>
              <ScrollArea className="h-64 rounded-md border border-border p-4">
                {timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No activity yet. Start reading to see your progress!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {timeline.map((entry) => (
                      <TimelineItem key={entry.id} entry={entry} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <UpdateProgressModal
        open={showProgressModal}
        onOpenChange={setShowProgressModal}
        bookId={book.id}
        currentPage={book.current_page}
        totalPages={book.total_pages}
        onUpdate={() => {
          fetchTimeline();
          onUpdate();
        }}
      />

      <AddNoteModal
        open={showNoteModal}
        onOpenChange={setShowNoteModal}
        bookId={book.id}
        onUpdate={() => {
          fetchTimeline();
          onUpdate();
        }}
      />

      <CompleteBookModal
        open={showCompleteModal}
        onOpenChange={setShowCompleteModal}
        bookId={book.id}
        totalPages={book.total_pages}
        onUpdate={() => {
          fetchTimeline();
          onUpdate();
        }}
      />
    </>
  );
};
