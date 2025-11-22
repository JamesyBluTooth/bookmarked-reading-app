import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";
import { AvatarCustomizer } from "@/components/profile/AvatarCustomizer";
import { generateAvatarUrl } from "@/lib/avatarGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSchema } from "@/lib/validation";

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
  const { toast } = useToast();

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
      } else {
        setProfile(data);
        setDisplayName(data.display_name || "");
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

  const handleAvatarChange = async (data: {
    avatarType: 'upload' | 'generated';
    avatarUrl: string | null;
    avatarSeed: string | null;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: data.avatarUrl,
          avatar_seed: data.avatarSeed,
          avatar_type: data.avatarType,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? {
        ...prev,
        avatar_url: data.avatarUrl,
        avatar_seed: data.avatarSeed,
        avatar_type: data.avatarType,
      } : null);

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive",
      });
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

  const displayAvatarUrl = profile?.avatar_type === 'generated' && profile?.avatar_seed
    ? generateAvatarUrl(profile.avatar_seed)
    : profile?.avatar_url;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-md">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-32 w-32 mb-4">
            <AvatarImage src={displayAvatarUrl || undefined} />
            <AvatarFallback>
              <User className="h-16 w-16" />
            </AvatarFallback>
          </Avatar>

          <AvatarCustomizer
            avatarType={(profile?.avatar_type as 'upload' | 'generated') || 'generated'}
            avatarUrl={profile?.avatar_url || null}
            avatarSeed={profile?.avatar_seed || null}
            onAvatarChange={handleAvatarChange}
          />
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
  );
}
