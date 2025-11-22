import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Shuffle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  generateAvatarUrl, 
  generateRandomSeed, 
  BACKGROUND_COLORS,
  AvatarOptions 
} from "@/lib/avatarGenerator";

interface AvatarCustomizerProps {
  avatarType: 'upload' | 'generated';
  avatarUrl: string | null;
  avatarSeed: string | null;
  onAvatarChange: (data: {
    avatarType: 'upload' | 'generated';
    avatarUrl: string | null;
    avatarSeed: string | null;
  }) => void;
}

export const AvatarCustomizer = ({
  avatarType,
  avatarUrl,
  avatarSeed,
  onAvatarChange,
}: AvatarCustomizerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedBgColor, setSelectedBgColor] = useState(BACKGROUND_COLORS[0].value);

  const currentSeed = avatarSeed || generateRandomSeed();

  const handleRandomize = () => {
    const newSeed = generateRandomSeed();
    onAvatarChange({
      avatarType: 'generated',
      avatarUrl: null,
      avatarSeed: newSeed,
    });
  };

  const handleBgColorChange = (color: string) => {
    setSelectedBgColor(color);
    if (avatarType === 'generated' && currentSeed) {
      onAvatarChange({
        avatarType: 'generated',
        avatarUrl: null,
        avatarSeed: currentSeed,
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
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

      const avatarUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      
      onAvatarChange({
        avatarType: 'upload',
        avatarUrl: avatarUrlWithTimestamp,
        avatarSeed: null,
      });

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
    } finally {
      setUploading(false);
    }
  };

  const handleSwitchToGenerated = () => {
    const newSeed = generateRandomSeed();
    onAvatarChange({
      avatarType: 'generated',
      avatarUrl: null,
      avatarSeed: newSeed,
    });
  };

  const displayAvatarUrl = avatarType === 'generated' && currentSeed
    ? generateAvatarUrl(currentSeed, { backgroundColor: selectedBgColor })
    : avatarUrl;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <Avatar className="w-32 h-32 border-4 border-primary/20 transition-all group-hover:border-primary/40">
            <AvatarImage src={displayAvatarUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl">
              <User className="w-16 h-16" />
            </AvatarFallback>
          </Avatar>
        </div>

        {avatarType === 'generated' ? (
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {BACKGROUND_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleBgColorChange(color.value)}
                    className={`h-10 rounded-lg border-2 transition-all ${
                      selectedBgColor === color.value
                        ? 'border-primary scale-110'
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: `#${color.value}` }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleRandomize}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Randomize Avatar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Photo"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleSwitchToGenerated}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Use Generated Avatar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Change Photo"}
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
      </div>
    </div>
  );
};
