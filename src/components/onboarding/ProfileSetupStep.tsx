import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileSetupStepProps {
  data: {
    displayName: string;
    bio: string;
  };
  onChange: (data: { 
    displayName: string; 
    bio: string;
  }) => void;
}

export const ProfileSetupStep = ({ data, onChange }: ProfileSetupStepProps) => {
  return (
    <div className="space-y-6 animate-scale-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome! 👋</h1>
        <p className="text-muted-foreground">Let's set up your profile</p>
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
  );
};
