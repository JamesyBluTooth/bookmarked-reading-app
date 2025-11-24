import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { profileSchema } from "@/lib/validation";
import { AvatarDisplay } from "@/components/profile/AvatarDisplay";
import { AvatarSetupModal } from "@/components/profile/AvatarSetupModal";
import { StatisticsView } from "@/components/statistics/StatisticsView";
import { useNavigate } from "react-router-dom";
import { Pencil, Settings, Trophy, CheckCircle2, XCircle, BookOpen, FileText, Timer, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  avatar_seed: string | null;
  avatar_type: string | null;
}

interface Challenge {
  id: string;
  challenge_type: "pages" | "book" | "time";
  target_value: number;
  current_progress: number;
  is_completed: boolean;
  challenge_date: string;
  expires_at: string;
}

interface Stats {
  totalChallenges: number;
  completedChallenges: number;
  completionRate: number;
  currentStreak: number;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAvatarSetup, setShowAvatarSetup] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalChallenges: 0,
    completedChallenges: 0,
    completionRate: 0,
    currentStreak: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadChallengeHistory();
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

  const loadChallengeHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all past challenges (excluding today)
      const today = new Date().toISOString().split('T')[0];
      const { data: challengeData } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("user_id", user.id)
        .lt("challenge_date", today)
        .order("challenge_date", { ascending: false });

      if (challengeData) {
        setChallenges(challengeData as Challenge[]);
        calculateStats(challengeData as Challenge[]);
      }
    } catch (error) {
      console.error("Error loading challenge history:", error);
    }
  };

  const calculateStats = (challengeData: Challenge[]) => {
    const total = challengeData.length;
    const completed = challengeData.filter(c => c.is_completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate current streak
    let streak = 0;
    const sortedChallenges = [...challengeData].sort(
      (a, b) => new Date(b.challenge_date).getTime() - new Date(a.challenge_date).getTime()
    );

    for (const challenge of sortedChallenges) {
      if (challenge.is_completed) {
        streak++;
      } else {
        break;
      }
    }

    setStats({
      totalChallenges: total,
      completedChallenges: completed,
      completionRate: rate,
      currentStreak: streak,
    });
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "pages":
        return <FileText className="w-5 h-5 text-primary" />;
      case "book":
        return <BookOpen className="w-5 h-5 text-primary" />;
      case "time":
        return <Timer className="w-5 h-5 text-primary" />;
      default:
        return <Trophy className="w-5 h-5 text-primary" />;
    }
  };

  const getChallengeDescription = (challenge: Challenge) => {
    switch (challenge.challenge_type) {
      case "pages":
        return `Read ${challenge.target_value} pages`;
      case "book":
        return "Complete a book";
      case "time":
        return `Read for ${challenge.target_value} minutes`;
      default:
        return "Challenge";
    }
  };

  const getProgressText = (challenge: Challenge) => {
    const unit = challenge.challenge_type === "time" 
      ? "minutes" 
      : challenge.challenge_type === "book" 
      ? "book" 
      : "pages";
    
    return `${challenge.current_progress} / ${challenge.target_value} ${unit}`;
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
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-md max-w-2xl mx-auto">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <AvatarDisplay 
                    avatarType={profile?.avatar_type}
                    avatarUrl={profile?.avatar_url}
                    avatarSeed={profile?.avatar_seed}
                    displayName={profile?.display_name}
                    userId={profile?.user_id}
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

                <Button 
                  variant="outline" 
                  onClick={() => navigate("/settings")}
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <StatisticsView />
          </TabsContent>

          <TabsContent value="challenges">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Challenges</p>
                        <p className="text-2xl font-bold">{stats.totalChallenges}</p>
                      </div>
                      <Trophy className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-success">{stats.completedChallenges}</p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                        <p className="text-2xl font-bold text-primary">{stats.completionRate}%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Streak</p>
                        <p className="text-2xl font-bold text-warning">{stats.currentStreak}</p>
                      </div>
                      <div className="text-2xl">🔥</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Challenge History */}
              <Card>
                <CardHeader>
                  <CardTitle>Past Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  {challenges.length === 0 ? (
                    <div className="text-center py-12">
                      <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No challenge history yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Complete daily challenges to build your history
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {challenges.map((challenge) => (
                        <div
                          key={challenge.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            {getChallengeIcon(challenge.challenge_type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{getChallengeDescription(challenge)}</p>
                                <Badge
                                  variant={challenge.is_completed ? "default" : "secondary"}
                                  className={challenge.is_completed ? "bg-success" : ""}
                                >
                                  {challenge.is_completed ? (
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                  ) : (
                                    <XCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {challenge.is_completed ? "Completed" : "Failed"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(challenge.challenge_date), "MMMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{getProgressText(challenge)}</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round((challenge.current_progress / challenge.target_value) * 100)}% complete
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
