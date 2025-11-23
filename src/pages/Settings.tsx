import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Lock, BookOpen, Palette, Bell, Users, 
  Database, FileText, LogOut, Copy, Check, Shield,
  Settings as SettingsIcon
} from "lucide-react";
import { EditProfileModal } from "@/components/settings/EditProfileModal";
import { ChangePasswordModal } from "@/components/settings/ChangePasswordModal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { AvatarDisplay } from "@/components/profile/AvatarDisplay";
import { ThemePreview } from "@/components/settings/ThemePreview";

interface UserProfile {
  display_name: string | null;
  avatar_url: string | null;
  avatar_seed: string | null;
  avatar_type: string | null;
  friend_code: string;
  bio: string | null;
  reading_unit_preference: string;
  progress_update_style: string;
  show_spoiler_warnings: boolean;
  theme_preference: string;
  text_size_preference: number;
  notifications_reading_reminders: boolean;
  notifications_friend_activity: boolean;
  notifications_achievements: boolean;
  notifications_weekly_summary: boolean;
  discoverable_by_friend_code: boolean;
}

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    }
  };

  const updatePreference = async (field: string, value: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, [field]: value } : null);
      
      // Apply theme immediately if theme_preference was updated
      if (field === "theme_preference") {
        applyTheme(value);
      }
    } catch (error) {
      console.error("Error updating preference:", error);
      toast({
        title: "Error",
        description: "Failed to update preference",
        variant: "destructive",
      });
    }
  };

  const applyTheme = (theme: string) => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('light', 'dark', 'bookish');
      
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(isDark ? 'dark' : 'light');
      } else {
        document.documentElement.classList.add(theme);
      }
    });
  };

  const copyFriendCode = () => {
    if (profile?.friend_code) {
      navigator.clipboard.writeText(profile.friend_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Friend code copied to clipboard",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const downloadData = () => {
    toast({
      title: "Data Export",
      description: "Your data export will begin shortly. This feature is coming soon!",
    });
  };

  const clearCache = () => {
    localStorage.clear();
    toast({
      title: "Cache Cleared",
      description: "Local cache has been cleared successfully",
    });
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold">Settings</h1>
      </div>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>Manage your profile and friend code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <AvatarDisplay
              avatarType={profile.avatar_type}
              avatarUrl={profile.avatar_url}
              avatarSeed={profile.avatar_seed}
              displayName={profile.display_name}
              className="h-20 w-20"
              fallbackClassName="text-2xl"
            />
            <div className="flex-1">
              <p className="text-xl font-semibold">{profile.display_name || "Anonymous Reader"}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <Button onClick={() => setEditProfileOpen(true)}>
              Edit Profile
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-base font-semibold">Your Friend Code</Label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 bg-muted rounded-lg font-mono text-2xl tracking-wider text-center">
                {profile.friend_code}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-auto w-12"
                onClick={copyFriendCode}
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this code with friends so they can find you
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Keep your account safe and secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <div className="px-4 py-2 bg-muted rounded-lg text-muted-foreground">
              {email}
            </div>
          </div>

          <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label>Two-Step Verification</Label>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>

      {/* Reading Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Reading Preferences</CardTitle>
          </div>
          <CardDescription>Customise your reading experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Preferred Reading Units</Label>
            <RadioGroup
              value={profile.reading_unit_preference}
              onValueChange={(value) => updatePreference("reading_unit_preference", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pages" id="pages" />
                <Label htmlFor="pages">Pages per session</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="books" id="books" />
                <Label htmlFor="books">Books per week</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hours" id="hours" />
                <Label htmlFor="hours">Hours per day</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base font-semibold">Progress Update Style</Label>
            <RadioGroup
              value={profile.progress_update_style}
              onValueChange={(value) => updatePreference("progress_update_style", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quick" id="quick" />
                <Label htmlFor="quick">Quick mode (just page number)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full">Full mode (page + timer + optional note)</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Spoiler Warnings</Label>
              <p className="text-sm text-muted-foreground">Because we are civilised people</p>
            </div>
            <Switch
              checked={profile.show_spoiler_warnings}
              onCheckedChange={(checked) => updatePreference("show_spoiler_warnings", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customise how Bookmarked looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Theme</Label>
            <RadioGroup
              value={profile.theme_preference}
              onValueChange={(value) => updatePreference("theme_preference", value)}
              className="grid gap-4"
            >
              <ThemePreview
                value="system"
                label="System Default"
                description="Automatically match your device's theme"
                colors={{
                  background: "hsl(0 0% 100%)",
                  foreground: "hsl(240 10% 3.9%)",
                  primary: "hsl(243 75% 59%)",
                  card: "hsl(0 0% 100%)"
                }}
              />
              <ThemePreview
                value="light"
                label="Light"
                description="Bright and clean"
                colors={{
                  background: "hsl(0 0% 100%)",
                  foreground: "hsl(240 10% 3.9%)",
                  primary: "hsl(243 75% 59%)",
                  card: "hsl(0 0% 100%)"
                }}
              />
              <ThemePreview
                value="dark"
                label="Dark"
                description="Easy on the eyes"
                colors={{
                  background: "hsl(240 10% 3.9%)",
                  foreground: "hsl(0 0% 98%)",
                  primary: "hsl(243 75% 59%)",
                  card: "hsl(240 3.7% 15.9%)"
                }}
              />
              <ThemePreview
                value="bookish"
                label="Bookish"
                description="Cosy sepia tones for long reading sessions"
                colors={{
                  background: "hsl(45 30% 92%)",
                  foreground: "hsl(30 25% 20%)",
                  primary: "hsl(25 75% 47%)",
                  card: "hsl(40 35% 96%)"
                }}
              />
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Text Size</Label>
              <span className="text-sm text-muted-foreground">{profile.text_size_preference}px</span>
            </div>
            <Slider
              value={[profile.text_size_preference]}
              onValueChange={([value]) => updatePreference("text_size_preference", value)}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              For when your eyes aren't what they were
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Reading Reminders</Label>
            <Switch
              checked={profile.notifications_reading_reminders}
              onCheckedChange={(checked) => updatePreference("notifications_reading_reminders", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Friend Activity Alerts</Label>
            <Switch
              checked={profile.notifications_friend_activity}
              onCheckedChange={(checked) => updatePreference("notifications_friend_activity", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Achievement Notifications</Label>
            <Switch
              checked={profile.notifications_achievements}
              onCheckedChange={(checked) => updatePreference("notifications_achievements", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Weekly Reading Summary</Label>
            <Switch
              checked={profile.notifications_weekly_summary}
              onCheckedChange={(checked) => updatePreference("notifications_weekly_summary", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Social</CardTitle>
          </div>
          <CardDescription>Manage your social settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Users className="h-4 w-4 mr-2" />
            Manage Friends
          </Button>

          <Button variant="outline" className="w-full justify-start">
            <BookOpen className="h-4 w-4 mr-2" />
            Group Memberships
          </Button>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Others to Find Me by Friend Code</Label>
              <p className="text-sm text-muted-foreground">You're popular enough, dear</p>
            </div>
            <Switch
              checked={profile.discoverable_by_friend_code}
              onCheckedChange={(checked) => updatePreference("discoverable_by_friend_code", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Storage */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Data & Storage</CardTitle>
          </div>
          <CardDescription>Manage your data and storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start" onClick={downloadData}>
            <FileText className="h-4 w-4 mr-2" />
            Download My Data
          </Button>

          <Button variant="outline" className="w-full justify-start" onClick={clearCache}>
            <Database className="h-4 w-4 mr-2" />
            Clear Local Cache
          </Button>

          <div className="flex items-center gap-2 px-4 py-3 bg-success/10 rounded-lg">
            <Check className="h-5 w-5 text-success" />
            <span className="text-sm font-medium">Sync Status: Connected</span>
          </div>
        </CardContent>
      </Card>

      {/* Legal & About */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Legal & About</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            Terms of Service
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Privacy Policy
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Attributions
          </Button>
          <Separator />
          <p className="text-sm text-muted-foreground px-4 py-2">
            Version 1.0.0
          </p>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <Button
            variant="destructive"
            className="w-full"
            size="lg"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <EditProfileModal
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        profile={profile}
        onProfileUpdate={loadProfile}
      />

      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </div>
  );
}