import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { profileSchema } from "@/lib/validation";

interface ProfileSetupStepProps {
  data: {
    displayName: string;
    avatarUrl: string | null;
    bio: string;
  };
  onChange: (data: { displayName: string; avatarUrl: string | null; bio: string }) => void;
}

export const ProfileSetupStep = ({ data, onChange }: ProfileSetupStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed.");
      }

      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size must be less than 5MB.");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const fileExt = file.type.split("/")[1] || "jpg";
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add cache-busting timestamp to force image reload
      const avatarUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      onChange({ ...data, avatarUrl: avatarUrlWithTimestamp });

      toast({
        title: "Avatar uploaded!",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-scale-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome! 👋</h1>
        <p className="text-muted-foreground">Let's set up your profile</p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <Avatar className="w-32 h-32 border-4 border-primary/20 transition-all group-hover:border-primary/40">
            <AvatarImage src={data.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl">
              <User className="w-16 h-16" />
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            className="absolute bottom-0 right-0 rounded-full shadow-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        <div className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={data.displayName}
              onChange={(e) => onChange({ ...data, displayName: e.target.value })}
              maxLength={50}
              className="transition-all focus:scale-[1.02]"
            />
            <p className="text-xs text-muted-foreground text-right">
              {data.displayName.length}/50 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={data.bio}
              onChange={(e) => onChange({ ...data, bio: e.target.value })}
              maxLength={500}
              className="resize-none transition-all focus:scale-[1.02]"
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {data.bio.length}/500 characters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
