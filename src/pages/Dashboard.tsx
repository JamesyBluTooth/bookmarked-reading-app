import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { CurrentlyReading } from "@/components/dashboard/CurrentlyReading";
import { BookDetail } from "@/components/books/BookDetail";
import { Gauge, Flame, Clock, BookCheck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface DashboardStats {
  readingSpeed: number;
  readingStreak: number;
  totalTimeRead: number;
  booksCompletedThisYear: number;
}

interface CurrentBook {
  id: string;
  title: string;
  author?: string;
  cover_url?: string;
  current_page: number;
  total_pages: number;
}

export const Dashboard = () => {
  const books = useAppStore((state) => state.books);
  const progressEntries = useAppStore((state) => state.progressEntries);
  const [stats, setStats] = useState<DashboardStats>({
    readingSpeed: 0,
    readingStreak: 0,
    totalTimeRead: 0,
    booksCompletedThisYear: 0,
  });
  const [currentBook, setCurrentBook] = useState<CurrentBook | undefined>();
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [books, progressEntries]);

  const fetchDashboardData = () => {
    // Calculate reading speed (pages per minute)
    const totalPages = progressEntries.reduce((sum, entry) => sum + entry.pages_read, 0);
    const totalMinutes = progressEntries.reduce((sum, entry) => sum + entry.time_spent_minutes, 0);
    const readingSpeed = totalMinutes > 0 ? totalPages / totalMinutes : 0;

    // Calculate total time read in hours
    const totalTimeRead = totalMinutes / 60;

    // Calculate reading streak (consecutive days with progress)
    const readingStreak = calculateReadingStreak(progressEntries);

    // Find currently reading book (not completed, has progress)
    const inProgressBook = books.find(
      (book) => !book.is_completed && book.current_page > 0
    );
    
    if (inProgressBook) {
      setCurrentBook({
        id: inProgressBook.id,
        title: inProgressBook.title,
        author: inProgressBook.author,
        cover_url: inProgressBook.cover_url,
        current_page: inProgressBook.current_page,
        total_pages: inProgressBook.total_pages,
      });
    } else {
      setCurrentBook(undefined);
    }

    // Count books completed this year
    const currentYear = new Date().getFullYear();
    const booksThisYear = books.filter((book) => {
      if (!book.is_completed) return false;
      const bookYear = new Date(book.updated_at).getFullYear();
      return bookYear === currentYear;
    }).length;

    setStats({
      readingSpeed: parseFloat(readingSpeed.toFixed(2)),
      readingStreak,
      totalTimeRead: parseFloat(totalTimeRead.toFixed(1)),
      booksCompletedThisYear: booksThisYear,
    });
  };

  const calculateReadingStreak = (progressData: any[]) => {
    if (!progressData.length) return 0;

    // Sort by date descending
    const sortedDates = progressData
      .map((entry) => new Date(entry.created_at).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < sortedDates.length; i++) {
      const entryDate = new Date(sortedDates[i]);
      const diffDays = Math.floor(
        (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const handleContinueReading = (bookId: string) => {
    setSelectedBookId(bookId);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">
            {currentBook 
              ? `You left off in "${currentBook.title}". Ready to continue?`
              : "Start tracking your reading journey today."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Reading Speed"
            value={stats.readingSpeed}
            icon={Gauge}
            suffix="pages/min"
          />
          <StatCard
            title="Reading Streak"
            value={stats.readingStreak}
            icon={Flame}
            suffix="days"
          />
          <StatCard
            title="Total Time Read"
            value={stats.totalTimeRead}
            icon={Clock}
            suffix="hrs"
          />
          <StatCard
            title="Books Completed"
            value={stats.booksCompletedThisYear}
            icon={BookCheck}
            suffix="this year"
          />
        </div>

        <CurrentlyReading book={currentBook} onContinue={handleContinueReading} />
      </div>

      {selectedBookId && (
        <BookDetail
          bookId={selectedBookId}
          open={!!selectedBookId}
          onOpenChange={(open) => !open && setSelectedBookId(null)}
          onUpdate={fetchDashboardData}
        />
      )}
    </>
  );
};
