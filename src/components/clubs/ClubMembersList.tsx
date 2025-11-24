import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ClubMembersListProps {
  clubId: string;
  userRole: string | null;
}

export function ClubMembersList({ clubId, userRole }: ClubMembersListProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [clubId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);

      // Get current active book
      const { data: currentBook } = await supabase
        .from("club_books")
        .select("id, book_title, total_pages")
        .eq("club_id", clubId)
        .eq("status", "active")
        .single();

      const { data: membersData, error } = await supabase
        .from("club_members")
        .select(`
          user_id,
          joined_at,
          profiles!inner (
            display_name,
            avatar_url
          ),
          club_roles!inner (
            role
          )
        `)
        .eq("club_id", clubId)
        .eq("is_active", true);

      if (error) throw error;

      // Get progress for current book
      const membersWithProgress = await Promise.all(
        (membersData || []).map(async (member) => {
          let progress = null;
          if (currentBook) {
            const { data: progressData } = await supabase
              .from("club_reading_progress")
              .select("current_page, status")
              .eq("club_book_id", currentBook.id)
              .eq("user_id", member.user_id)
              .single();

            if (progressData && currentBook.total_pages) {
              progress = {
                current_page: progressData.current_page,
                total_pages: currentBook.total_pages,
                percentage: Math.round((progressData.current_page / currentBook.total_pages) * 100),
                status: progressData.status,
              };
            }
          }

          return {
            ...member,
            progress,
          };
        })
      );

      // Sort by progress percentage
      membersWithProgress.sort((a, b) => {
        const aProgress = a.progress?.percentage || 0;
        const bProgress = b.progress?.percentage || 0;
        return bProgress - aProgress;
      });

      setMembers(membersWithProgress);
    } catch (error: any) {
      toast.error("Failed to load members");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userRole === "owner" || userRole === "admin";

  if (loading) {
    return <div className="text-center py-8">Loading members...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        {members.length} member{members.length !== 1 ? "s" : ""}
      </div>

      {members.map((member, index) => (
        <div
          key={member.user_id}
          className="flex items-center gap-4 p-4 border rounded-lg"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="text-sm text-muted-foreground w-6">
              #{index + 1}
            </div>
            <Avatar>
              <AvatarImage src={member.profiles.avatar_url} />
              <AvatarFallback>
                {member.profiles.display_name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{member.profiles.display_name}</span>
                <Badge variant="secondary" className="text-xs">
                  {member.club_roles[0]?.role}
                </Badge>
              </div>
              {member.progress && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Page {member.progress.current_page} of {member.progress.total_pages}
                    </span>
                    <span className="font-medium">{member.progress.percentage}%</span>
                  </div>
                  <Progress value={member.progress.percentage} />
                </div>
              )}
            </div>
          </div>

          {isAdmin && member.club_roles[0]?.role === "member" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (confirm("Remove this member from the club?")) {
                  await supabase
                    .from("club_members")
                    .delete()
                    .eq("club_id", clubId)
                    .eq("user_id", member.user_id);
                  
                  toast.success("Member removed");
                  fetchMembers();
                }
              }}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
