import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarUrl } from "@/lib/avatarGenerator";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface AvatarDisplayProps {
  avatarType?: string | null;
  avatarUrl?: string | null;
  avatarSeed?: string | null;
  displayName?: string | null;
  className?: string;
  fallbackClassName?: string;
  userId?: string;
}

export const AvatarDisplay = ({
  avatarType,
  avatarUrl,
  avatarSeed,
  displayName,
  className,
  fallbackClassName,
  userId,
}: AvatarDisplayProps) => {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadAvatar = async () => {
      if (avatarType === 'generated' && userId) {
        const { data: customization } = await supabase
          .from("avatar_customizations")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (customization) {
          const generatedUrl = generateAvatarUrl(avatarSeed || 'default', {
            backgroundColor: customization.background_color,
            skinColor: customization.skin_color,
            eyes: customization.eyes,
            hair: customization.hair,
            hairColor: customization.hair_color,
            facialHair: customization.facial_hair,
            body: customization.body,
            clothingColor: customization.clothing_color,
            mouth: customization.mouth,
            nose: customization.nose,
          });
          setDisplayUrl(generatedUrl);
          return;
        }
      }
      
      if (avatarType === 'generated' && avatarSeed) {
        setDisplayUrl(generateAvatarUrl(avatarSeed));
      } else {
        setDisplayUrl(avatarUrl || null);
      }
    };

    loadAvatar();
  }, [avatarType, avatarUrl, avatarSeed, userId]);

  return (
    <Avatar className={className}>
      <AvatarImage src={displayUrl || undefined} />
      <AvatarFallback className={fallbackClassName}>
        {displayName?.[0]?.toUpperCase() || <User className="w-1/2 h-1/2" />}
      </AvatarFallback>
    </Avatar>
  );
};
