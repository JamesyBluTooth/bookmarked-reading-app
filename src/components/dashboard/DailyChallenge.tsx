import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, FileText, Timer } from "lucide-react";
import { TrophyAnimation } from "./TrophyAnimation";
import { useAppStore, type DailyChallenge as DailyChallengeType } from "@/store/useAppStore";
import { SyncManager } from "@/lib/syncManager";

export const DailyChallenge = () => {
  const challenge = useAppStore((state) => state.getCurrentChallenge());
  const setDailyChallenge = useAppStore((state) => state.setDailyChallenge);
  const updateChallengeProgress = useAppStore((state) => state.updateChallengeProgress);
  const books = useAppStore((state) => state.books);
  const progressEntries = useAppStore((state) => state.progressEntries);
  
  const [timeRemaining, setTimeRemaining] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationSuccess, setAnimationSuccess] = useState(false);
  const [previousChallengeChecked, setPreviousChallengeChecked] = useState(false);

  useEffect(() => {
    loadChallenge();
    const interval = setInterval(() => {
      updateTimer();
      if (challenge) {
        updateProgress(challenge);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [challenge?.id, progressEntries, books]);

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
    const dailyChallenges = useAppStore.getState().dailyChallenges;
    
    // Check for yesterday's challenge first
    if (!previousChallengeChecked) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const previousChallenge = dailyChallenges.find(c => c.challenge_date === yesterdayStr);

      if (previousChallenge && !hasShownAnimation(previousChallenge.id)) {
        setPreviousChallengeChecked(true);
        setAnimationSuccess(previousChallenge.is_completed);
        setShowAnimation(true);
        markAnimationAsShown(previousChallenge.id);
      } else {
        setPreviousChallengeChecked(true);
      }
    }

    // Get today's challenge
    const today = new Date().toISOString().split('T')[0];
    const existingChallenge = dailyChallenges.find(c => c.challenge_date === today);

    if (existingChallenge) {
      updateProgress(existingChallenge);
    } else {
      // Generate new challenge
      generateChallenge();
    }
  };

  const generateChallenge = () => {
    const random = Math.random();
    let challengeType: "pages" | "time" | "book";
    let targetValue: number;

    if (random < 0.33) {
      challengeType = "pages";
      targetValue = 10 + Math.floor(Math.random() * 41); // 10-50 pages
    } else if (random < 0.66) {
      challengeType = "time";
      targetValue = 15 + Math.floor(Math.random() * 46); // 15-60 minutes
    } else {
      challengeType = "book";
      targetValue = 1;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newChallenge: DailyChallengeType = {
      id: crypto.randomUUID(),
      challenge_type: challengeType,
      target_value: targetValue,
      current_progress: 0,
      is_completed: false,
      challenge_date: today.toISOString().split('T')[0],
      expires_at: tomorrow.toISOString(),
      created_at: new Date().toISOString(),
    };

    setDailyChallenge(newChallenge);
    SyncManager.uploadSnapshot();
  };

  const updateProgress = (currentChallenge: DailyChallengeType) => {
    let progress = 0;
    const today = new Date().toISOString().split('T')[0];

    if (currentChallenge.challenge_type === "pages") {
      // Sum pages read today
      progress = progressEntries
        .filter(entry => entry.created_at.startsWith(today))
        .reduce((sum, entry) => sum + entry.pages_read, 0);
    } else if (currentChallenge.challenge_type === "time") {
      // Sum time spent today
      progress = progressEntries
        .filter(entry => entry.created_at.startsWith(today))
        .reduce((sum, entry) => sum + entry.time_spent_minutes, 0);
    } else if (currentChallenge.challenge_type === "book") {
      // Check if any book was completed today
      const completedToday = books.some(book => 
        book.is_completed && book.updated_at.startsWith(today)
      );
      progress = completedToday ? 1 : 0;
    }

    if (progress !== currentChallenge.current_progress) {
      updateChallengeProgress(currentChallenge.id, progress);
      SyncManager.uploadSnapshot();
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
