import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ClubDiscussionThreadProps {
  discussion: any;
  clubId: string;
  onUpdate: () => void;
}

export function ClubDiscussionThread({ discussion, clubId, onUpdate }: ClubDiscussionThreadProps) {
  const [replies, setReplies] = useState<any[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showReplies) {
      fetchReplies();
    }
  }, [showReplies]);

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from("club_discussions")
        .select(`
          *,
          profiles!inner (
            display_name,
            avatar_url
          )
        `)
        .eq("parent_id", discussion.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("club_discussions")
        .insert({
          club_id: clubId,
          club_book_id: discussion.club_book_id,
          user_id: user.id,
          content: replyText,
          parent_id: discussion.id,
        });

      if (error) throw error;

      setReplyText("");
      fetchReplies();
      toast.success("Reply added!");
    } catch (error: any) {
      toast.error("Failed to add reply");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={discussion.profiles.avatar_url} />
            <AvatarFallback>
              {discussion.profiles.display_name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{discussion.profiles.display_name}</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
              </span>
              {discussion.is_spoiler && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Spoiler
                </Badge>
              )}
            </div>
            {discussion.club_books && (
              <Badge variant="secondary" className="text-xs mb-2">
                {discussion.club_books.book_title}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="whitespace-pre-wrap mb-4">{discussion.content}</p>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            {showReplies ? "Hide" : "Show"} Replies {replies.length > 0 && `(${replies.length})`}
          </Button>
        </div>

        {showReplies && (
          <div className="mt-4 space-y-4 pl-8 border-l-2">
            {replies.map((reply) => (
              <div key={reply.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.profiles.avatar_url} />
                  <AvatarFallback>
                    {reply.profiles.display_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{reply.profiles.display_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{reply.content}</p>
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
              />
              <Button size="sm" onClick={handleReply} disabled={loading || !replyText.trim()}>
                {loading ? "Posting..." : "Reply"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
