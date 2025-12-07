import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Clock, FileText, Star, CheckCircle2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UpdateProgressModal } from "./UpdateProgressModal";
import { AddNoteModal } from "./AddNoteModal";
import { CompleteBookModal } from "./CompleteBookModal";
import { TimelineItem } from "./TimelineItem";
import { EditBookModal } from "./EditBookModal";
import { mergeBookWithLocal } from "@/lib/localBookCache";

interface BookDetailProps {
  bookId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

interface Book {
  id: string;
  title: string;
  author?: string;
  genres: string[];
  cover_url?: string;
  total_pages: number;
  current_page: number;
  is_completed: boolean;
  rating?: number;
  review?: string;
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
  const [book, setBook] = useState<Book | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open && bookId) {
      fetchBookDetails();
      fetchTimeline();
    }
  }, [open, bookId, refreshKey]);

  const fetchBookDetails = async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (error) {
      console.error("Error fetching book:", error);
      return;
    }

    // Apply local overrides
    const mergedData = mergeBookWithLocal(data);
    setBook(mergedData);
  };

  const fetchTimeline = async () => {
    const [progressData, notesData] = await Promise.all([
      supabase
        .from("progress_entries")
        .select("*")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false }),
      supabase
        .from("notes")
        .select("*")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false }),
    ]);

    const timelineItems: TimelineEntry[] = [];

    progressData.data?.forEach((entry) => {
      timelineItems.push({
        id: entry.id,
        type: 'progress',
        created_at: entry.created_at,
        pages_read: entry.pages_read,
        time_spent_minutes: entry.time_spent_minutes,
      });
    });

    notesData.data?.forEach((note) => {
      timelineItems.push({
        id: note.id,
        type: 'note',
        created_at: note.created_at,
        content: note.content,
      });
    });

    timelineItems.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setTimeline(timelineItems);
  };

  const handleMarkIncomplete = async () => {
    if (!book) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!profile) return;

    const { error: updateError } = await supabase
      .from("books")
      .update({
        is_completed: false,
        current_page: Math.floor(book.total_pages * 0.99),
        rating: null,
        review: null,
      })
      .eq("id", bookId);

    if (updateError) {
      console.error("Error marking incomplete:", updateError);
      return;
    }

    const { error: noteError } = await supabase
      .from("notes")
      .insert({
        book_id: bookId,
        user_id: profile.user_id,
        content: "Marked incomplete",
      });

    if (noteError) {
      console.error("Error adding note:", noteError);
    }

    fetchBookDetails();
    fetchTimeline();
    onUpdate();
  };

  if (!book) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{book.title}</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </div>
          </DialogHeader>

          <div className="flex gap-6 pb-4 border-b">
            <div className="w-32 h-44 bg-muted rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <BookOpen className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              {book.author && (
                <p className="text-lg text-muted-foreground">{book.author}</p>
              )}
              
              {book.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {book.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>{book.total_pages ? `${book.total_pages} pages` : 'Page count unknown'}</span>
              </div>

              {book.is_completed ? (
                <div className="space-y-2">
                  <Badge className="bg-success text-success-foreground">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Completed
                  </Badge>
                  {book.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-medium">{book.rating}/5</span>
                    </div>
                  )}
                </div>
              ) : book.total_pages && book.total_pages > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Page {book.current_page} of {book.total_pages}
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{
                        width: `${(book.current_page / book.total_pages) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-amber-600 dark:text-amber-500">
                  ⚠️ Page count unknown - Add missing details below
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pb-4">
            {!book.is_completed ? (
              <>
                <Button 
                  onClick={() => {
                    if (!book.total_pages || book.total_pages === 0) {
                      toast({
                        title: "Missing page count",
                        description: "Please add the total page count first using the Edit Details button.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setShowProgressModal(true);
                  }} 
                  className="flex-1"
                  disabled={!book.total_pages || book.total_pages === 0}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Update Progress
                </Button>
                <Button onClick={() => setShowNoteModal(true)} variant="secondary" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
                <Button onClick={() => setShowCompleteModal(true)} variant="default" className="flex-1">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete
                </Button>
              </>
            ) : (
              <Button onClick={handleMarkIncomplete} variant="outline" className="w-full">
                Mark as Incomplete
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Timeline</h3>
              {timeline.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No activity yet. Start tracking your progress!
                </p>
              ) : (
                <div className="space-y-3">
                  {timeline.map((entry) => (
                    <TimelineItem key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UpdateProgressModal
        open={showProgressModal}
        onOpenChange={setShowProgressModal}
        bookId={bookId}
        currentPage={book.current_page}
        totalPages={book.total_pages}
        onUpdate={() => {
          fetchBookDetails();
          fetchTimeline();
          onUpdate();
        }}
      />

      <AddNoteModal
        open={showNoteModal}
        onOpenChange={setShowNoteModal}
        bookId={bookId}
        onUpdate={() => {
          fetchTimeline();
        }}
      />

      <CompleteBookModal
        open={showCompleteModal}
        onOpenChange={setShowCompleteModal}
        bookId={bookId}
        totalPages={book.total_pages}
        onUpdate={() => {
          fetchBookDetails();
          fetchTimeline();
          onUpdate();
        }}
      />

      <EditBookModal
        bookId={bookId}
        currentData={{
          title: book.title,
          author: book.author,
          total_pages: book.total_pages,
          genres: book.genres,
        }}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSave={() => {
          setRefreshKey(prev => prev + 1);
        }}
      />
    </>
  );
};
