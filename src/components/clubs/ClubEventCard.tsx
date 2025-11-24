import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ClubEventCardProps {
  clubId: string;
}

export function ClubEventCard({ clubId }: ClubEventCardProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [clubId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("club_events")
        .select(`
          *,
          club_books (book_title),
          profiles!club_events_created_by_fkey (display_name)
        `)
        .eq("club_id", clubId)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast.error("Failed to load events");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "discussion":
        return "bg-blue-500";
      case "deadline":
        return "bg-red-500";
      case "meetup":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <Badge className={getEventTypeColor(event.event_type)}>
                    {event.event_type}
                  </Badge>
                </div>
                {event.description && (
                  <p className="text-muted-foreground text-sm mb-3">{event.description}</p>
                )}
                {event.club_books && (
                  <Badge variant="secondary" className="mb-3">
                    {event.club_books.book_title}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(event.event_date), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(event.event_date), "h:mm a")}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-2">
              Created by {event.profiles.display_name}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
