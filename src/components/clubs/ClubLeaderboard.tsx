import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Book, Clock } from "lucide-react";
import { toast } from "sonner";

interface ClubLeaderboardProps {
  clubId: string;
}

export function ClubLeaderboard({ clubId }: ClubLeaderboardProps) {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [clubId]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get all club members
      const { data: members } = await supabase
        .from("club_members")
        .select(`
          user_id,
          profiles!inner (
            display_name,
            avatar_url
          )
        `)
        .eq("club_id", clubId)
        .eq("is_active", true);

      if (!members) return;

      // Get stats for each member
      const statsWithData = await Promise.all(
        members.map(async (member) => {
          // Get completed books in this club
          const { count: booksCompleted } = await supabase
            .from("club_reading_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", member.user_id)
            .eq("status", "completed")
            .in("club_book_id", 
              (await supabase
                .from("club_books")
                .select("id")
                .eq("club_id", clubId)
              ).data?.map(b => b.id) || []
            );

          // Get this week's progress
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());

          const { data: weekProgress } = await supabase
            .from("progress_entries")
            .select("pages_read, time_spent_minutes")
            .eq("user_id", member.user_id)
            .gte("created_at", weekStart.toISOString());

          const pagesThisWeek = weekProgress?.reduce((sum, p) => sum + p.pages_read, 0) || 0;
          const minutesThisWeek = weekProgress?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) || 0;

          return {
            ...member,
            books_completed: booksCompleted || 0,
            pages_this_week: pagesThisWeek,
            minutes_this_week: minutesThisWeek,
          };
        })
      );

      setStats(statsWithData);
    } catch (error: any) {
      toast.error("Failed to load stats");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading stats...</div>;
  }

  const renderLeaderboard = (sortKey: string, icon: React.ReactNode, label: string) => {
    const sorted = [...stats].sort((a, b) => b[sortKey] - a[sortKey]);

    return (
      <div className="space-y-3">
        {sorted.map((stat, index) => (
          <div key={stat.user_id} className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-lg font-bold w-8">
                {index === 0 && <Trophy className="h-6 w-6 text-yellow-500" />}
                {index === 1 && <Trophy className="h-6 w-6 text-gray-400" />}
                {index === 2 && <Trophy className="h-6 w-6 text-amber-600" />}
                {index > 2 && `#${index + 1}`}
              </div>
              <Avatar>
                <AvatarImage src={stat.profiles.avatar_url} />
                <AvatarFallback>
                  {stat.profiles.display_name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{stat.profiles.display_name}</span>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              {icon}
              <span>{stat[sortKey]}</span>
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="pages" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pages">Pages</TabsTrigger>
        <TabsTrigger value="minutes">Minutes</TabsTrigger>
        <TabsTrigger value="books">Books</TabsTrigger>
      </TabsList>

      <TabsContent value="pages" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pages Read This Week</CardTitle>
          </CardHeader>
          <CardContent>
            {renderLeaderboard("pages_this_week", <Book className="h-4 w-4" />, "pages")}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="minutes" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Reading Time This Week</CardTitle>
          </CardHeader>
          <CardContent>
            {renderLeaderboard("minutes_this_week", <Clock className="h-4 w-4" />, "min")}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="books" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Books Completed</CardTitle>
          </CardHeader>
          <CardContent>
            {renderLeaderboard("books_completed", <Book className="h-4 w-4" />, "books")}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
