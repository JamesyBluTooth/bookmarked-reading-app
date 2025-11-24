import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, UserPlus } from "lucide-react";
import { ClubFeed } from "@/components/clubs/ClubFeed";
import { ClubBookCard } from "@/components/clubs/ClubBookCard";
import { ClubMembersList } from "@/components/clubs/ClubMembersList";
import { ClubEventCard } from "@/components/clubs/ClubEventCard";
import { ClubLeaderboard } from "@/components/clubs/ClubLeaderboard";
import { ClubSettings } from "@/components/clubs/ClubSettings";
import { ClubInviteModal } from "@/components/clubs/ClubInviteModal";
import { AssignBookModal } from "@/components/clubs/AssignBookModal";
import { CreateEventModal } from "@/components/clubs/CreateEventModal";
import { toast } from "sonner";

export default function ClubDetail() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [assignBookOpen, setAssignBookOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);

  useEffect(() => {
    if (clubId) {
      fetchClubData();
    }
  }, [clubId]);

  const fetchClubData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clubData, error: clubError } = await supabase
        .from("book_clubs")
        .select("*")
        .eq("id", clubId)
        .single();

      if (clubError) throw clubError;

      const { data: roleData } = await supabase
        .from("club_roles")
        .select("role")
        .eq("club_id", clubId)
        .eq("user_id", user.id)
        .single();

      setUserRole(roleData?.role || "member");
      setClub(clubData);
    } catch (error: any) {
      toast.error("Failed to load club");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userRole === "owner" || userRole === "admin";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Club not found</p>
          <Button onClick={() => navigate("/clubs")}>Back to Clubs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/clubs")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clubs
          </Button>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            {club.cover_image_url && (
              <img
                src={club.cover_image_url}
                alt={club.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
              <p className="text-muted-foreground mb-2">{club.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  {club.is_private ? "Private" : "Public"} Club
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">Code: {club.invite_code}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setInviteModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-6">
            <ClubFeed clubId={clubId!} />
          </TabsContent>

          <TabsContent value="books" className="mt-6">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Club Books</h2>
              {isAdmin && (
                <Button onClick={() => setAssignBookOpen(true)}>Assign Book</Button>
              )}
            </div>
            <ClubBookCard clubId={clubId!} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <ClubMembersList clubId={clubId!} userRole={userRole} />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Upcoming Events</h2>
              {isAdmin && (
                <Button onClick={() => setCreateEventOpen(true)}>Create Event</Button>
              )}
            </div>
            <ClubEventCard clubId={clubId!} />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <ClubLeaderboard clubId={clubId!} />
          </TabsContent>
        </Tabs>
      </div>

      <ClubInviteModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        clubId={clubId!}
        inviteCode={club.invite_code}
      />

      {settingsOpen && (
        <ClubSettings
          club={club}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          onUpdate={fetchClubData}
        />
      )}

      <AssignBookModal
        open={assignBookOpen}
        onOpenChange={setAssignBookOpen}
        clubId={clubId!}
        onSuccess={() => {
          setAssignBookOpen(false);
          fetchClubData();
        }}
      />

      <CreateEventModal
        open={createEventOpen}
        onOpenChange={setCreateEventOpen}
        clubId={clubId!}
        onSuccess={() => {
          setCreateEventOpen(false);
        }}
      />
    </div>
  );
}
