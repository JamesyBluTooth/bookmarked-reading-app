import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { ClubDiscussionThread } from "./ClubDiscussionThread";
import { AddDiscussionModal } from "./AddDiscussionModal";
import { toast } from "sonner";

interface ClubFeedProps {
  clubId: string;
}

export function ClubFeed({ clubId }: ClubFeedProps) {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [clubId]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("club_discussions")
        .select(`
          *,
          profiles!inner (
            display_name,
            avatar_url
          ),
          club_books (
            book_title
          )
        `)
        .eq("club_id", clubId)
        .is("parent_id", null)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error: any) {
      toast.error("Failed to load discussions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading discussions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Discussions</h2>
        <Button onClick={() => setAddModalOpen(true)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Start Discussion
        </Button>
      </div>

      {discussions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No discussions yet</p>
          <Button onClick={() => setAddModalOpen(true)}>Start the First Discussion</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <ClubDiscussionThread
              key={discussion.id}
              discussion={discussion}
              clubId={clubId}
              onUpdate={fetchDiscussions}
            />
          ))}
        </div>
      )}

      <AddDiscussionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        clubId={clubId}
        onSuccess={() => {
          setAddModalOpen(false);
          fetchDiscussions();
        }}
      />
    </div>
  );
}
