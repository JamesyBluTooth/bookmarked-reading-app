import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarUrl } from "@/lib/avatarGenerator";
import { User } from "lucide-react";

interface AvatarDisplayProps {
  avatarType?: string | null;
  avatarUrl?: string | null;
  avatarSeed?: string | null;
  displayName?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export const AvatarDisplay = ({
  avatarType,
  avatarUrl,
  avatarSeed,
  displayName,
  className,
  fallbackClassName,
}: AvatarDisplayProps) => {
  const getAvatarUrl = () => {
    if (avatarType === 'generated' && avatarSeed) {
      return generateAvatarUrl(avatarSeed);
    }
    return avatarUrl;
  };

  const displayUrl = getAvatarUrl();

  return (
    <Avatar className={className}>
      <AvatarImage src={displayUrl || undefined} />
      <AvatarFallback className={fallbackClassName}>
        {displayName?.[0]?.toUpperCase() || <User className="w-1/2 h-1/2" />}
      </AvatarFallback>
    </Avatar>
  );
};
