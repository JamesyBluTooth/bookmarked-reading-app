import { Card } from "@/components/ui/card";
import { Clock, FileText, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface TimelineItemProps {
  entry: TimelineEntry;
}

export const TimelineItem = ({ entry }: TimelineItemProps) => {
  const getIcon = () => {
    switch (entry.type) {
      case 'progress':
        return <Clock className="w-5 h-5 text-primary" />;
      case 'note':
        return <FileText className="w-5 h-5 text-secondary" />;
      case 'completion':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'incomplete':
        return <XCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTitle = () => {
    switch (entry.type) {
      case 'progress':
        return 'Progress Update';
      case 'note':
        return 'Note';
      case 'completion':
        return 'Completed';
      case 'incomplete':
        return 'Marked Incomplete';
    }
  };

  return (
    <Card className="p-4 animate-slide-up">
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-foreground">{getTitle()}</h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
            </span>
          </div>
          
          {entry.type === 'progress' && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Read {entry.pages_read} pages</p>
              <p>Time spent: {entry.time_spent_minutes} minutes</p>
            </div>
          )}
          
          {entry.type === 'note' && (
            <p className="text-sm text-foreground whitespace-pre-wrap">{entry.content}</p>
          )}
          
          {entry.type === 'completion' && (
            <div className="text-sm space-y-2">
              {entry.rating && (
                <p className="text-muted-foreground">Rating: {entry.rating}/5 stars</p>
              )}
              {entry.review && (
                <p className="text-foreground whitespace-pre-wrap">{entry.review}</p>
              )}
            </div>
          )}
          
          {entry.type === 'incomplete' && (
            <p className="text-sm text-muted-foreground">{entry.content}</p>
          )}
        </div>
      </div>
    </Card>
  );
};
