import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ClubReadingProgressProps {
  clubBookId: string;
}

export function ClubReadingProgress({ clubBookId }: ClubReadingProgressProps) {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [clubBookId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);

      const { data: bookData } = await supabase
        .from("club_books")
        .select("total_pages, start_date, end_date")
        .eq("id", clubBookId)
        .single();

      const { data: progressData, error } = await supabase
        .from("club_reading_progress")
        .select(`
          current_page,
          status,
          profiles!inner (
            display_name,
            avatar_url
          )
        `)
        .eq("club_book_id", clubBookId);

      if (error) throw error;

      const totalPages = bookData?.total_pages || 100;
      const progressWithCalc = (progressData || []).map((p) => ({
        ...p,
        percentage: Math.round((p.current_page / totalPages) * 100),
      }));

      // Sort by progress
      progressWithCalc.sort((a, b) => b.percentage - a.percentage);

      setProgress(progressWithCalc);
    } catch (error: any) {
      toast.error("Failed to load progress");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading progress...</div>;
  }

  if (progress.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No one has started reading yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold mb-3">Member Progress</h4>
      {progress.map((p, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground w-6">
            #{index + 1}
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={p.profiles.avatar_url} />
            <AvatarFallback>
              {p.profiles.display_name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{p.profiles.display_name}</span>
              <Badge variant="secondary" className="text-xs">
                {p.percentage}%
              </Badge>
            </div>
            <Progress value={p.percentage} className="h-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
