import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle2, XCircle, BookOpen, FileText, Timer, TrendingUp } from "lucide-react";
import { format } from "date-fns";

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

export default function ChallengeHistory() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalChallenges: 0,
    completedChallenges: 0,
    completionRate: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallengeHistory();
  }, []);

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
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Challenge History</h1>
        <p className="text-muted-foreground">
          Track your daily reading challenges and see how you've progressed
        </p>
      </div>

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
  );
}
