import { Card } from "@/components/ui/card";
import { BookOpen, Clock, MessageSquare, Trophy, Sparkles } from "lucide-react";
import { format } from "date-fns";

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

interface XPTimelineItemProps {
  entry: TimelineEntry;
}

export const XPTimelineItem = ({ entry }: XPTimelineItemProps) => {
  const getIcon = () => {
    switch (entry.type) {
      case "pages":
        return <BookOpen className="w-5 h-5 text-primary" />;
      case "minutes":
        return <Clock className="w-5 h-5 text-accent" />;
      case "note":
        return <MessageSquare className="w-5 h-5 text-secondary" />;
      case "completion":
        return <Trophy className="w-5 h-5 text-warning" />;
    }
  };

  const getDescription = () => {
    switch (entry.type) {
      case "pages":
        return `Read ${entry.pages_read} pages`;
      case "minutes":
        return `Read for ${entry.time_spent_minutes} minutes`;
      case "note":
        return "Added a note";
      case "completion":
        return "Completed the book! 🎉";
    }
  };

  return (
    <Card className="p-4 animate-fade-in hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5 p-2 rounded-full bg-muted">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="font-medium text-foreground">{getDescription()}</p>
              
              {entry.type === "note" && entry.content && (
                <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                  "{entry.content}"
                </p>
              )}
              
              {entry.type === "completion" && entry.rating && (
                <p className="text-sm text-muted-foreground">
                  Rated {entry.rating}/5 stars
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1">
              {entry.xp_earned > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium">
                  <Sparkles className="w-3 h-3" />
                  +{entry.xp_earned} XP
                </div>
              )}
              <span className="text-xs text-muted-foreground">
                {format(new Date(entry.created_at), "MMM d, h:mm a")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};