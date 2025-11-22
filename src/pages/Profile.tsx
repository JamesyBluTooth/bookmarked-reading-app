import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSchema } from "@/lib/validation";
import { AvatarDisplay } from "@/components/profile/AvatarDisplay";
import { AvatarSetupModal } from "@/components/profile/AvatarSetupModal";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  avatar_seed: string | null;
  avatar_type: string | null;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAvatarSetup, setShowAvatarSetup] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // Profile doesn't exist yet, create one with a friend code
        const { data: friendCode } = await supabase.rpc("generate_friend_code");
        
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({ 
            user_id: user.id,
            friend_code: friendCode || ""
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
        setDisplayName(newProfile.display_name || "");
        setShowAvatarSetup(true); // New users should set up avatar
      } else {
        setProfile(data);
        setDisplayName(data.display_name || "");
        
        // Check if this is the first time visiting profile without an avatar
        if (!data.avatar_seed && !data.avatar_url) {
          setShowAvatarSetup(true);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Validate profile data
      const result = profileSchema.safeParse({
        display_name: displayName,
        bio: undefined
      });

      if (!result.success) {
        toast({
          title: "Validation Error",
          description: result.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ display_name: result.data.display_name })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <AvatarSetupModal 
        open={showAvatarSetup} 
        onOpenChange={setShowAvatarSetup}
      />
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-md">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <AvatarDisplay 
                avatarType={profile?.avatar_type}
                avatarUrl={profile?.avatar_url}
                avatarSeed={profile?.avatar_seed}
                displayName={profile?.display_name}
                className="h-32 w-32"
              />
              <button
                onClick={() => navigate("/customize-avatar")}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                title="Edit Avatar"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground text-right">
                {displayName.length}/50 characters
              </p>
            </div>

            <Button onClick={handleUpdateProfile} className="w-full">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
