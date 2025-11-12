import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, FileText, Timer } from "lucide-react";
import { TrophyAnimation } from "./TrophyAnimation";

interface DailyChallenge {
  id: string;
  challenge_type: "pages" | "book" | "time";
  target_value: number;
  current_progress: number;
  is_completed: boolean;
  expires_at: string;
  challenge_date: string;
}

export const DailyChallenge = () => {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationSuccess, setAnimationSuccess] = useState(false);
  const [previousChallengeChecked, setPreviousChallengeChecked] = useState(false);

  useEffect(() => {
    loadChallenge();
    const interval = setInterval(() => {
      updateTimer();
      if (challenge) {
        updateChallengeProgress(challenge);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [challenge?.id]);

  const hasShownAnimation = (challengeId: string): boolean => {
    try {
      const shownAnimations = JSON.parse(localStorage.getItem("shownChallengeAnimations") || "[]");
      return shownAnimations.includes(challengeId);
    } catch {
      return false;
    }
  };

  const markAnimationAsShown = (challengeId: string) => {
    try {
      const shownAnimations = JSON.parse(localStorage.getItem("shownChallengeAnimations") || "[]");
      if (!shownAnimations.includes(challengeId)) {
        shownAnimations.push(challengeId);
        localStorage.setItem("shownChallengeAnimations", JSON.stringify(shownAnimations));
      }
    } catch (error) {
      console.error("Error saving animation state:", error);
    }
  };

  const loadChallenge = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for yesterday's challenge first
      if (!previousChallengeChecked) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const { data: previousChallenge } = await supabase
          .from("daily_challenges")
          .select("*")
          .eq("user_id", user.id)
          .eq("challenge_date", yesterdayStr)
          .single();

        if (previousChallenge && !previousChallengeChecked && !hasShownAnimation(previousChallenge.id)) {
          setPreviousChallengeChecked(true);
          setAnimationSuccess(previousChallenge.is_completed);
          setShowAnimation(true);
          markAnimationAsShown(previousChallenge.id);
        } else {
          setPreviousChallengeChecked(true);
        }
      }

      // Get today's challenge
      const { data: existingChallenge } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("user_id", user.id)
        .eq("challenge_date", new Date().toISOString().split('T')[0])
        .single();

      if (existingChallenge) {
        const typedChallenge = existingChallenge as DailyChallenge;
        setChallenge(typedChallenge);
        updateChallengeProgress(typedChallenge);
      } else {
        // Generate new challenge
        const { data: newChallengeId } = await supabase.rpc(
          "generate_daily_challenge",
          { p_user_id: user.id }
        );

        if (newChallengeId) {
          const { data: newChallenge } = await supabase
            .from("daily_challenges")
            .select("*")
            .eq("id", newChallengeId)
            .single();

          if (newChallenge) {
            setChallenge(newChallenge as DailyChallenge);
          }
        }
      }
    } catch (error) {
      console.error("Error loading challenge:", error);
    }
  };

  const updateChallengeProgress = async (currentChallenge: DailyChallenge) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let progress = 0;

      if (currentChallenge.challenge_type === "pages") {
        // Sum pages read today from progress_entries
        const today = new Date().toISOString().split('T')[0];
        const { data: entries } = await supabase
          .from("progress_entries")
          .select("pages_read, created_at, book_id")
          .gte("created_at", today);

        if (entries) {
          progress = entries.reduce((sum, entry) => sum + entry.pages_read, 0);
        }
      } else if (currentChallenge.challenge_type === "time") {
        // Sum time spent today
        const today = new Date().toISOString().split('T')[0];
        const { data: entries } = await supabase
          .from("progress_entries")
          .select("time_spent_minutes, created_at")
          .gte("created_at", today);

        if (entries) {
          progress = entries.reduce((sum, entry) => sum + entry.time_spent_minutes, 0);
        }
      } else if (currentChallenge.challenge_type === "book") {
        // Check if any book was completed today
        const today = new Date().toISOString().split('T')[0];
        const { data: books } = await supabase
          .from("books")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_completed", true)
          .gte("updated_at", today);

        progress = books && books.length > 0 ? 1 : 0;
      }

      const isCompleted = progress >= currentChallenge.target_value;

      if (progress !== currentChallenge.current_progress || isCompleted !== currentChallenge.is_completed) {
        await supabase
          .from("daily_challenges")
          .update({
            current_progress: progress,
            is_completed: isCompleted
          })
          .eq("id", currentChallenge.id);

        setChallenge({
          ...currentChallenge,
          current_progress: progress,
          is_completed: isCompleted
        });
      }
    } catch (error) {
      console.error("Error updating challenge progress:", error);
    }
  };

  const updateTimer = () => {
    if (!challenge) return;

    const now = new Date().getTime();
    const expiresAt = new Date(challenge.expires_at).getTime();
    const distance = expiresAt - now;

    if (distance < 0) {
      setTimeRemaining("Expired");
      return;
    }

    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
  };

  const getChallengeIcon = () => {
    if (!challenge) return <span className="text-2xl">🏆</span>;
    
    switch (challenge.challenge_type) {
      case "pages":
        return <FileText className="w-6 h-6 text-primary" />;
      case "book":
        return <BookOpen className="w-6 h-6 text-primary" />;
      case "time":
        return <Timer className="w-6 h-6 text-primary" />;
      default:
        return <span className="text-2xl">🏆</span>;
    }
  };

  const getChallengeText = () => {
    if (!challenge) return "Loading challenge...";
    
    switch (challenge.challenge_type) {
      case "pages":
        return `Read ${challenge.target_value} pages`;
      case "book":
        return "Complete a book";
      case "time":
        return `Read for ${challenge.target_value} minutes`;
      default:
        return "Daily Challenge";
    }
  };

  const getProgressText = () => {
    if (!challenge) return "";
    
    return `${challenge.current_progress} / ${challenge.target_value} ${
      challenge.challenge_type === "time" ? "minutes" : challenge.challenge_type === "book" ? "book" : "pages"
    }`;
  };

  if (!challenge) {
    return (
      <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h3 className="text-lg font-semibold text-foreground">Daily Challenge</h3>
        </div>
        <p className="text-muted-foreground">Loading your challenge...</p>
      </div>
    );
  }

  const progressPercentage = Math.min((challenge.current_progress / challenge.target_value) * 100, 100);

  return (
    <>
      {showAnimation && (
        <TrophyAnimation
          success={animationSuccess}
          onComplete={() => setShowAnimation(false)}
        />
      )}

      <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          {getChallengeIcon()}
          <h3 className="text-lg font-semibold text-foreground">Daily Challenge</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-foreground font-medium mb-1">{getChallengeText()}</p>
            <p className="text-sm text-muted-foreground">{getProgressText()}</p>
            <Progress value={progressPercentage} className="mt-2" />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-secondary font-medium">
            <Clock className="w-4 h-4" />
            <span>{timeRemaining} remaining</span>
          </div>
        </div>
      </div>
    </>
  );
};
