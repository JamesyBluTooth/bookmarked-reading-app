import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Book, Lock, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClubCardProps {
  club: {
    id: string;
    name: string;
    description: string | null;
    cover_image_url: string | null;
    is_private: boolean;
    member_count: number;
    current_book?: {
      title: string;
      author: string | null;
    };
  };
  onJoin?: () => void;
}

export function ClubCard({ club, onJoin }: ClubCardProps) {
  const navigate = useNavigate();

  const handleJoinPublicClub = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("club_members").insert({
        club_id: club.id,
        user_id: user.id,
      });

      await supabase.from("club_roles").insert({
        club_id: club.id,
        user_id: user.id,
        role: "member",
      });

      toast.success("Joined club successfully!");
      onJoin?.();
    } catch (error: any) {
      toast.error("Failed to join club");
      console.error(error);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader onClick={() => navigate(`/clubs/${club.id}`)}>
        {club.cover_image_url && (
          <img
            src={club.cover_image_url}
            alt={club.name}
            className="w-full h-40 object-cover rounded-md mb-4"
          />
        )}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">{club.name}</h3>
            {club.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {club.description}
              </p>
            )}
          </div>
          <Badge variant="secondary">
            {club.is_private ? (
              <Lock className="h-3 w-3 mr-1" />
            ) : (
              <Globe className="h-3 w-3 mr-1" />
            )}
            {club.is_private ? "Private" : "Public"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent onClick={() => navigate(`/clubs/${club.id}`)}>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{club.member_count} members</span>
          </div>
        </div>

        {club.current_book && (
          <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
            <Book className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{club.current_book.title}</p>
              {club.current_book.author && (
                <p className="text-xs text-muted-foreground truncate">
                  by {club.current_book.author}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {onJoin ? (
          <Button className="w-full" onClick={handleJoinPublicClub}>
            Join Club
          </Button>
        ) : (
          <Button className="w-full" onClick={() => navigate(`/clubs/${club.id}`)}>
            View Club
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
