import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthPage } from "@/components/auth/AuthPage";
import { Dashboard } from "./Dashboard";
import { Books } from "./Books";
import Profile from "./Profile";
import ChallengeHistory from "./ChallengeHistory";
import { Social } from "./Social";
import Settings from "./Settings";
import { Sidebar } from "@/components/Sidebar";
import { RightPanel } from "@/components/RightPanel";
import { MobileNav } from "@/components/MobileNav";
import { DailyChallenge } from "@/components/dashboard/DailyChallenge";
import { FriendFeed } from "@/components/dashboard/FriendFeed";
import { SplashScreen } from "@/components/SplashScreen";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "books" | "profile" | "challenge-history" | "social" | "settings">("dashboard");
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Failed to load session. Please try again.");
          return;
        }

        setSession(session);

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Profile error:", profileError);
            // Continue anyway, default to showing onboarding
            setShowOnboarding(true);
          } else {
            setShowOnboarding(!profile?.onboarding_completed);
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError("An unexpected error occurred. Please refresh the page.");
        toast({
          title: "Error",
          description: "Failed to initialize. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        hasInitialized.current = true;
        setLoading(false);
      }
    };

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!hasInitialized.current) {
        setLoading(false);
        setError("Loading timeout. Please refresh the page.");
        toast({
          title: "Loading Timeout",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
      }
    }, 10000);

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setError(null);

      if (session?.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Profile error on auth change:", profileError);
            setShowOnboarding(true);
          } else {
            setShowOnboarding(!profile?.onboarding_completed);
          }
        } catch (err) {
          console.error("Error in auth state change:", err);
          setShowOnboarding(true);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  if (loading) {
    return <SplashScreen />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  if (showOnboarding) {
    return <OnboardingContainer onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onSignOut={handleSignOut} />

      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-6xl">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "books" && <Books />}
          {activeTab === "challenge-history" && <ChallengeHistory />}
          {activeTab === "social" && <Social />}
          {activeTab === "profile" && <Profile />}
          {activeTab === "settings" && <Settings />}
        </div>

        {/* Mobile: Show right panel content below main content */}
        <div className="lg:hidden container mx-auto px-4 pb-6 space-y-4">
          <DailyChallenge />
          <FriendFeed />
        </div>
      </main>

      <RightPanel />

      <MobileNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onSignOut={handleSignOut}
      />
    </div>
  );
};

export default Index;
