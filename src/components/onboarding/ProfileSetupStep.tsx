import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { profileSchema } from "@/lib/validation";
import { useState, useEffect } from "react";

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
  const [errors, setErrors] = useState<{ displayName?: string; bio?: string }>({});

  useEffect(() => {
    // Real-time validation as user types
    const result = profileSchema.safeParse({
      display_name: data.displayName,
      bio: data.bio || undefined
    });

    if (!result.success) {
      const newErrors: { displayName?: string; bio?: string } = {};
      result.error.errors.forEach((error) => {
        if (error.path[0] === 'display_name') {
          newErrors.displayName = error.message;
        } else if (error.path[0] === 'bio') {
          newErrors.bio = error.message;
        }
      });
      setErrors(newErrors);
    } else {
      setErrors({});
    }
  }, [data.displayName, data.bio]);

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
            className={`transition-all focus:scale-[1.02] ${errors.displayName ? 'border-destructive' : ''}`}
          />
          {errors.displayName && (
            <p className="text-xs text-destructive">{errors.displayName}</p>
          )}
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
            className={`resize-none transition-all focus:scale-[1.02] ${errors.bio ? 'border-destructive' : ''}`}
            rows={3}
          />
          {errors.bio && (
            <p className="text-xs text-destructive">{errors.bio}</p>
          )}
          <p className="text-xs text-muted-foreground text-right">
            {data.bio.length}/500 characters
          </p>
        </div>
      </div>
    </div>
  );
};
