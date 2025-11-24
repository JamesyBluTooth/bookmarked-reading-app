import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, TrendingUp, Calendar } from "lucide-react";

interface ReadingData {
  dailyProgress: Array<{ date: string; pages: number; minutes: number }>;
  genreBreakdown: Array<{ genre: string; count: number; percentage: number }>;
  weeklyPace: Array<{ week: string; avgPages: number; avgMinutes: number }>;
  hourlyDistribution: Array<{ hour: number; sessions: number }>;
  yearlySummary: {
    totalBooks: number;
    totalPages: number;
    totalMinutes: number;
    avgPagesPerDay: number;
    avgMinutesPerDay: number;
    currentStreak: number;
    longestStreak: number;
  };
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function StatisticsView() {
  const [data, setData] = useState<ReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadStatistics();
  }, [selectedYear]);

  const loadStatistics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch progress entries for the selected year
      const yearStart = new Date(selectedYear, 0, 1).toISOString();
      const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();

      const { data: progressData } = await supabase
        .from("progress_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", yearStart)
        .lte("created_at", yearEnd)
        .order("created_at", { ascending: true });

      const { data: booksData } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", user.id);

      if (!progressData || !booksData) {
        setLoading(false);
        return;
      }

      // Process daily progress
      const dailyMap = new Map<string, { pages: number; minutes: number }>();
      progressData.forEach((entry) => {
        const date = new Date(entry.created_at).toLocaleDateString();
        const existing = dailyMap.get(date) || { pages: 0, minutes: 0 };
        dailyMap.set(date, {
          pages: existing.pages + entry.pages_read,
          minutes: existing.minutes + (entry.time_spent_minutes || 0),
        });
      });

      const dailyProgress = Array.from(dailyMap.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .slice(-30); // Last 30 days

      // Process genre breakdown
      const genreMap = new Map<string, number>();
      booksData.forEach((book) => {
        if (book.genres && Array.isArray(book.genres)) {
          book.genres.forEach((genre: string) => {
            genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
          });
        }
      });

      const totalGenreBooks = Array.from(genreMap.values()).reduce((a, b) => a + b, 0);
      const genreBreakdown = Array.from(genreMap.entries())
        .map(([genre, count]) => ({
          genre,
          count,
          percentage: Math.round((count / totalGenreBooks) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Process weekly pace
      const weeklyMap = new Map<string, { pages: number; minutes: number; count: number }>();
      progressData.forEach((entry) => {
        const date = new Date(entry.created_at);
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        const weekKey = weekStart.toLocaleDateString();
        const existing = weeklyMap.get(weekKey) || { pages: 0, minutes: 0, count: 0 };
        weeklyMap.set(weekKey, {
          pages: existing.pages + entry.pages_read,
          minutes: existing.minutes + (entry.time_spent_minutes || 0),
          count: existing.count + 1,
        });
      });

      const weeklyPace = Array.from(weeklyMap.entries())
        .map(([week, stats]) => ({
          week,
          avgPages: Math.round(stats.pages / 7),
          avgMinutes: Math.round(stats.minutes / 7),
        }))
        .slice(-12); // Last 12 weeks

      // Process hourly distribution
      const hourlyMap = new Map<number, number>();
      progressData.forEach((entry) => {
        const hour = new Date(entry.created_at).getHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      });

      const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        sessions: hourlyMap.get(hour) || 0,
      }));

      // Calculate yearly summary
      const totalPages = progressData.reduce((sum, entry) => sum + entry.pages_read, 0);
      const totalMinutes = progressData.reduce((sum, entry) => sum + (entry.time_spent_minutes || 0), 0);
      const completedBooks = booksData.filter(
        (book) => book.is_completed && 
        book.completed_at && 
        new Date(book.completed_at).getFullYear() === selectedYear
      ).length;

      const daysInYear = selectedYear === new Date().getFullYear() 
        ? Math.ceil((Date.now() - new Date(selectedYear, 0, 1).getTime()) / (1000 * 60 * 60 * 24))
        : 365;

      // Calculate streaks
      const sortedDates = Array.from(dailyMap.keys()).sort();
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      for (let i = sortedDates.length - 1; i >= 0; i--) {
        const currentDate = new Date(sortedDates[i]);
        const nextDate = i < sortedDates.length - 1 ? new Date(sortedDates[i + 1]) : new Date();
        const dayDiff = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dayDiff <= 1) {
          tempStreak++;
          if (i === sortedDates.length - 1) currentStreak = tempStreak;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }

      const yearlySummary = {
        totalBooks: completedBooks,
        totalPages,
        totalMinutes,
        avgPagesPerDay: Math.round(totalPages / daysInYear),
        avgMinutesPerDay: Math.round(totalMinutes / daysInYear),
        currentStreak,
        longestStreak,
      };

      setData({
        dailyProgress,
        genreBreakdown,
        weeklyPace,
        hourlyDistribution,
        yearlySummary,
      });
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No reading data available yet. Start tracking your reading!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Yearly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Books Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.yearlySummary.totalBooks}</div>
            <p className="text-xs text-muted-foreground">in {selectedYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Pages Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.yearlySummary.totalPages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{data.yearlySummary.avgPagesPerDay} pages/day avg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Time Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.yearlySummary.totalMinutes / 60)}h</div>
            <p className="text-xs text-muted-foreground">{data.yearlySummary.avgMinutesPerDay} min/day avg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Reading Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.yearlySummary.currentStreak}</div>
            <p className="text-xs text-muted-foreground">Longest: {data.yearlySummary.longestStreak} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns">Reading Patterns</TabsTrigger>
          <TabsTrigger value="genres">Genres</TabsTrigger>
          <TabsTrigger value="pace">Pace Trends</TabsTrigger>
          <TabsTrigger value="times">Best Times</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Reading Activity (Last 30 Days)</CardTitle>
              <CardDescription>Pages read and time spent per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="pages" stroke="hsl(var(--primary))" name="Pages" strokeWidth={2} />
                  <Line type="monotone" dataKey="minutes" stroke="hsl(var(--chart-2))" name="Minutes" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="genres" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genre Distribution</CardTitle>
              <CardDescription>Breakdown of books by genre</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.genreBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ genre, percentage }) => `${genre}: ${percentage}%`}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="count"
                    >
                      {data.genreBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {data.genreBreakdown.map((genre, index) => (
                    <div key={genre.genre} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">
                        {genre.genre}: <strong>{genre.count}</strong> books ({genre.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Reading Pace</CardTitle>
              <CardDescription>Average daily reading over the last 12 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.weeklyPace}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="avgPages" fill="hsl(var(--primary))" name="Avg Pages/Day" />
                  <Bar dataKey="avgMinutes" fill="hsl(var(--chart-2))" name="Avg Minutes/Day" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="times" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Productive Reading Times</CardTitle>
              <CardDescription>Reading sessions by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    labelFormatter={(hour) => `${hour}:00`}
                  />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Reading Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
