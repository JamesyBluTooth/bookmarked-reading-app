import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { profileSchema } from "@/lib/validation";
import { AvatarCustomizer } from "@/components/profile/AvatarCustomizer";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
    avatar_seed: string | null;
    avatar_type: string | null;
    bio: string | null;
  };
  onProfileUpdate: () => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
  profile,
  onProfileUpdate,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [avatarSeed, setAvatarSeed] = useState(profile.avatar_seed);
  const [avatarType, setAvatarType] = useState<'upload' | 'generated'>(
    (profile.avatar_type as 'upload' | 'generated') || 'generated'
  );
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setDisplayName(profile.display_name || "");
    setBio(profile.bio || "");
    setAvatarUrl(profile.avatar_url);
    setAvatarSeed(profile.avatar_seed);
    setAvatarType((profile.avatar_type as 'upload' | 'generated') || 'generated');
  }, [profile]);

  const handleAvatarChange = (data: {
    avatarType: 'upload' | 'generated';
    avatarUrl: string | null;
    avatarSeed: string | null;
  }) => {
    setAvatarType(data.avatarType);
    setAvatarUrl(data.avatarUrl);
    setAvatarSeed(data.avatarSeed);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate profile data
      const result = profileSchema.safeParse({
        display_name: displayName,
        bio: bio || undefined
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
        .update({
          display_name: result.data.display_name,
          bio: result.data.bio || null,
          avatar_url: avatarUrl,
          avatar_seed: avatarSeed,
          avatar_type: avatarType,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      onProfileUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and picture
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <AvatarCustomizer
            avatarType={avatarType}
            avatarUrl={avatarUrl}
            avatarSeed={avatarSeed}
            onAvatarChange={handleAvatarChange}
          />

          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground text-right">
              {displayName.length}/50 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              placeholder="Tell us a bit about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/500 characters
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
