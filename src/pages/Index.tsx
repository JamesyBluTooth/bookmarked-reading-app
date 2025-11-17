import { useEffect, useState } from "react";
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

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "books" | "profile" | "challenge-history" | "social" | "settings">("dashboard");

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", session.user.id)
          .single();

        setShowOnboarding(!profile?.onboarding_completed);
      }

      setLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", session.user.id)
          .single();

        setShowOnboarding(!profile?.onboarding_completed);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <SplashScreen />;
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
