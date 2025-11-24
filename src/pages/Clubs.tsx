import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClubCard } from "@/components/clubs/ClubCard";
import { CreateClubModal } from "@/components/clubs/CreateClubModal";
import { JoinClubModal } from "@/components/clubs/JoinClubModal";
import { toast } from "sonner";

interface Club {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_private: boolean;
  invite_code: string;
  member_count: number;
  current_book?: {
    title: string;
    author: string | null;
  };
}

export default function Clubs() {
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [publicClubs, setPublicClubs] = useState<Club[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch my clubs
      const { data: myClubsData, error: myClubsError } = await supabase
        .from("club_members")
        .select(`
          club_id,
          book_clubs (
            id,
            name,
            description,
            cover_image_url,
            is_private,
            invite_code
          )
        `)
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (myClubsError) throw myClubsError;

      // Get member counts and current books for my clubs
      const myClubsWithDetails = await Promise.all(
        (myClubsData || []).map(async (item: any) => {
          const club = item.book_clubs;
          
          const { count } = await supabase
            .from("club_members")
            .select("*", { count: "exact", head: true })
            .eq("club_id", club.id)
            .eq("is_active", true);

          const { data: currentBook } = await supabase
            .from("club_books")
            .select("book_title, book_author")
            .eq("club_id", club.id)
            .eq("status", "active")
            .single();

          return {
            ...club,
            member_count: count || 0,
            current_book: currentBook ? {
              title: currentBook.book_title,
              author: currentBook.book_author,
            } : undefined,
          };
        })
      );

      setMyClubs(myClubsWithDetails);

      // Fetch public clubs
      const { data: publicClubsData, error: publicClubsError } = await supabase
        .from("book_clubs")
        .select("*")
        .eq("is_private", false)
        .limit(20);

      if (publicClubsError) throw publicClubsError;

      const publicClubsWithDetails = await Promise.all(
        (publicClubsData || []).map(async (club) => {
          const { count } = await supabase
            .from("club_members")
            .select("*", { count: "exact", head: true })
            .eq("club_id", club.id)
            .eq("is_active", true);

          return {
            ...club,
            member_count: count || 0,
          };
        })
      );

      setPublicClubs(publicClubsWithDetails);

      // Fetch pending invites
      const { data: invitesData, error: invitesError } = await supabase
        .from("club_invites")
        .select(`
          *,
          book_clubs (name, cover_image_url),
          profiles!club_invites_invited_by_fkey (display_name)
        `)
        .eq("invited_user_id", user.id)
        .eq("status", "pending");

      if (!invitesError) {
        setPendingInvites(invitesData || []);
      }
    } catch (error: any) {
      toast.error("Failed to load clubs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClubCreated = () => {
    fetchData();
    setCreateModalOpen(false);
  };

  const handleClubJoined = () => {
    fetchData();
    setJoinModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Book Clubs</h1>
            <p className="text-muted-foreground">
              Join clubs, read together, and discuss your favorite books
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setJoinModalOpen(true)} variant="outline">
              Join Club
            </Button>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Club
            </Button>
          </div>
        </div>

        <Tabs defaultValue="my-clubs" className="w-full">
          <TabsList>
            <TabsTrigger value="my-clubs">My Clubs ({myClubs.length})</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="invites">
              Invites {pendingInvites.length > 0 && `(${pendingInvites.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-clubs" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : myClubs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't joined any clubs yet</p>
                <Button onClick={() => setCreateModalOpen(true)}>Create Your First Club</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClubs.map((club) => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : publicClubs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No public clubs available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicClubs.map((club) => (
                  <ClubCard key={club.id} club={club} onJoin={fetchData} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invites" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : pendingInvites.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pending invites</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{invite.book_clubs.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Invited by {invite.profiles.display_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await supabase
                            .from("club_invites")
                            .update({ status: "declined", responded_at: new Date().toISOString() })
                            .eq("id", invite.id);
                          fetchData();
                        }}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          const { data: { user } } = await supabase.auth.getUser();
                          if (!user) return;

                          await supabase.from("club_members").insert({
                            club_id: invite.club_id,
                            user_id: user.id,
                          });

                          await supabase
                            .from("club_invites")
                            .update({ status: "accepted", responded_at: new Date().toISOString() })
                            .eq("id", invite.id);

                          toast.success("Joined club successfully!");
                          fetchData();
                        }}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateClubModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleClubCreated}
      />

      <JoinClubModal
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
        onSuccess={handleClubJoined}
      />
    </div>
  );
}
