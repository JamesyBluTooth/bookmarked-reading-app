import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus, Trophy, Settings } from "lucide-react";
import { FriendShelf } from "@/components/social/FriendShelf";
import { AddFriendModal } from "@/components/social/AddFriendModal";
import { FriendProfileModal } from "@/components/social/FriendProfileModal";
import { LeaderboardView } from "@/components/social/LeaderboardView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Social = () => {
  const [myFriendCode, setMyFriendCode] = useState("");
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadMyFriendCode();
  }, []);

  const loadMyFriendCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("friend_code")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setMyFriendCode(profile.friend_code);
      }
    } catch (error) {
      console.error("Error loading friend code:", error);
    }
  };

  const handleFriendClick = (userId: string) => {
    setSelectedFriendId(userId);
    setProfileModalOpen(true);
  };

  const handleFriendAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleUnfollow = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    // Swap primary and secondary colors for this tab
    <div className="[--primary:hsl(var(--secondary))] [--secondary:hsl(var(--primary))]">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Friends</h1>
            <p className="text-muted-foreground">Connect with fellow readers</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAddFriendOpen(true)}
            >
              <UserPlus className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends">Friend Shelf</TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-6 mt-6">
            <FriendShelf 
              key={refreshKey}
              onFriendClick={handleFriendClick} 
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <LeaderboardView key={refreshKey} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddFriendModal
        open={addFriendOpen}
        onOpenChange={setAddFriendOpen}
        myFriendCode={myFriendCode}
        onFriendAdded={handleFriendAdded}
      />

      <FriendProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        userId={selectedFriendId}
        onUnfollow={handleUnfollow}
      />
    </div>
  );
};
