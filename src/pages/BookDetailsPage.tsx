import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  BookOpen, 
  Pencil, 
  Sparkles, 
  CheckCircle2,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReadingTimer } from "@/components/books/ReadingTimer";
import { ActivityLogger } from "@/components/books/ActivityLogger";
import { XPTimelineItem } from "@/components/books/XPTimelineItem";
import { EditBookModal } from "@/components/books/EditBookModal";
import { CompleteBookModal } from "@/components/books/CompleteBookModal";
import { mergeBookWithLocal } from "@/lib/localBookCache";

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
  isbn?: string;
}

interface TimelineEntry {
  id: string;
  type: "pages" | "minutes" | "note" | "completion";
  created_at: string;
  content?: string;
  pages_read?: number;
  time_spent_minutes?: number;
  xp_earned: number;
  rating?: number;
  review?: string;
}

const XP_RATES = {
  PAGE: 3,
  MINUTE: 2,
  NOTE: 10,
  COMPLETION_BONUS: 200,
};

export const BookDetailsPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [description, setDescription] = useState<string | null>(null);

  const fetchBookDetails = useCallback(async () => {
    if (!bookId) return;

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Could not load book details",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const mergedData = mergeBookWithLocal(data);
    setBook(mergedData);

    // Try to fetch description from canonical_books
    if (data.isbn) {
      const { data: canonical } = await supabase
        .from("canonical_books")
        .select("description")
        .eq("isbn", data.isbn)
        .maybeSingle();
      
      if (canonical?.description) {
        setDescription(canonical.description);
      }
    }

    setLoading(false);
  }, [bookId, navigate, toast]);

  const fetchTimeline = useCallback(async () => {
    if (!bookId) return;

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
    let xpTotal = 0;

    progressData.data?.forEach((entry) => {
      const xp = entry.xp_earned || 0;
      xpTotal += xp;
      
      // Determine if this was logged as pages or minutes based on what's present
      const type = entry.pages_read && entry.pages_read > 0 ? "pages" : "minutes";
      
      timelineItems.push({
        id: entry.id,
        type,
        created_at: entry.created_at,
        pages_read: entry.pages_read,
        time_spent_minutes: entry.time_spent_minutes,
        xp_earned: xp,
      });
    });

    notesData.data?.forEach((note) => {
      const xp = note.xp_earned || 0;
      xpTotal += xp;
      
      timelineItems.push({
        id: note.id,
        type: "note",
        created_at: note.created_at,
        content: note.content,
        xp_earned: xp,
      });
    });

    timelineItems.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setTimeline(timelineItems);
    setTotalXP(xpTotal);
  }, [bookId]);

  useEffect(() => {
    fetchBookDetails();
    fetchTimeline();
  }, [fetchBookDetails, fetchTimeline]);

  const awardXP = async (amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc("award_xp", { p_user_id: user.id, p_xp_amount: amount });
  };

  const handleLogPages = async (pages: number) => {
    if (!book || !bookId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const xpEarned = pages * XP_RATES.PAGE;
    const newCurrentPage = Math.min(book.current_page + pages, book.total_pages);
    const isNowComplete = newCurrentPage >= book.total_pages;

    // Insert progress entry with XP
    const { error: progressError } = await supabase
      .from("progress_entries")
      .insert({
        book_id: bookId,
        user_id: user.id,
        pages_read: pages,
        time_spent_minutes: 0,
        xp_earned: xpEarned,
      });

    if (progressError) {
      toast({ title: "Error logging pages", variant: "destructive" });
      return;
    }

    // Update book progress
    const updateData: any = { current_page: newCurrentPage };
    if (isNowComplete) {
      updateData.is_completed = true;
      updateData.completed_at = new Date().toISOString();
    }

    await supabase.from("books").update(updateData).eq("id", bookId);

    // Award XP
    await awardXP(xpEarned);

    // Handle completion bonus
    if (isNowComplete && !book.is_completed) {
      await awardXP(XP_RATES.COMPLETION_BONUS);
      toast({
        title: "🎉 Book Completed!",
        description: `You earned +${xpEarned + XP_RATES.COMPLETION_BONUS} XP total (including +${XP_RATES.COMPLETION_BONUS} completion bonus)!`,
      });
    } else {
      toast({
        title: "Pages logged!",
        description: `+${xpEarned} XP earned`,
      });
    }

    fetchBookDetails();
    fetchTimeline();
  };

  const handleLogMinutes = async (minutes: number) => {
    if (!bookId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const xpEarned = minutes * XP_RATES.MINUTE;

    const { error } = await supabase
      .from("progress_entries")
      .insert({
        book_id: bookId,
        user_id: user.id,
        pages_read: 0,
        time_spent_minutes: minutes,
        xp_earned: xpEarned,
      });

    if (error) {
      toast({ title: "Error logging time", variant: "destructive" });
      return;
    }

    await awardXP(xpEarned);

    toast({
      title: "Time logged!",
      description: `+${xpEarned} XP earned`,
    });

    fetchTimeline();
  };

  const handleAddNote = async (content: string) => {
    if (!bookId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const xpEarned = XP_RATES.NOTE;

    const { error } = await supabase
      .from("notes")
      .insert({
        book_id: bookId,
        user_id: user.id,
        content,
        xp_earned: xpEarned,
      });

    if (error) {
      toast({ title: "Error adding note", variant: "destructive" });
      return;
    }

    await awardXP(xpEarned);

    toast({
      title: "Note added!",
      description: `+${xpEarned} XP earned`,
    });

    fetchTimeline();
  };

  const handleTimerStop = async (minutes: number) => {
    await handleLogMinutes(minutes);
  };

  if (loading || !book) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const progressPercent = book.total_pages > 0
    ? Math.round((book.current_page / book.total_pages) * 100)
    : 0;

  const missingPageCount = !book.total_pages || book.total_pages === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold truncate">Book Details</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Book Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Cover */}
              <div className="w-40 h-56 rounded-lg overflow-hidden shadow-lg bg-muted">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <BookOpen className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Title & Author */}
              <div>
                <h2 className="text-xl font-bold">{book.title}</h2>
                {book.author && (
                  <p className="text-muted-foreground">{book.author}</p>
                )}
              </div>

              {/* Genres */}
              {book.genres && book.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {book.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Completion Status or Progress */}
              {book.is_completed ? (
                <div className="space-y-2 w-full">
                  <Badge className="bg-success text-success-foreground gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </Badge>
                  {book.rating && (
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < book.rating!
                              ? "fill-warning text-warning"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : missingPageCount ? (
                <div className="text-sm text-warning w-full">
                  ⚠️ Page count unknown. Please edit book details.
                </div>
              ) : (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {book.current_page} of {book.total_pages} pages
                  </p>
                </div>
              )}

              {/* Total XP */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10">
                <Sparkles className="w-5 h-5 text-warning" />
                <span className="font-semibold text-warning">{totalXP} XP</span>
                <span className="text-sm text-muted-foreground">earned</span>
              </div>

              {/* Edit Button */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowEditModal(true)}
              >
                <Pencil className="w-4 h-4" />
                Edit Details
              </Button>

              {/* Complete Button (if not completed) */}
              {!book.is_completed && !missingPageCount && (
                <Button
                  className="w-full gap-2"
                  onClick={() => setShowCompleteModal(true)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </Button>
              )}
            </div>
          </Card>

          {/* Description Card */}
          {description && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column - Timer, Logger, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timer & Logger Grid */}
          {!book.is_completed && (
            <div className="grid gap-6 md:grid-cols-2">
              <ReadingTimer 
                onStop={handleTimerStop} 
                disabled={missingPageCount} 
              />
              <ActivityLogger
                onLogPages={handleLogPages}
                onLogMinutes={handleLogMinutes}
                onAddNote={handleAddNote}
                currentPage={book.current_page}
                totalPages={book.total_pages}
                disabled={missingPageCount}
              />
            </div>
          )}

          {/* Timeline */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Reading Timeline</h3>
            {timeline.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No activity yet. Start tracking your progress!</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {timeline.map((entry) => (
                    <XPTimelineItem key={entry.id} entry={entry} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      <EditBookModal
        bookId={bookId!}
        currentData={{
          title: book.title,
          author: book.author,
          total_pages: book.total_pages,
          genres: book.genres,
        }}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSave={() => {
          fetchBookDetails();
        }}
      />

      <CompleteBookModal
        open={showCompleteModal}
        onOpenChange={setShowCompleteModal}
        bookId={bookId!}
        totalPages={book.total_pages}
        onUpdate={() => {
          fetchBookDetails();
          fetchTimeline();
        }}
      />
    </div>
  );
};