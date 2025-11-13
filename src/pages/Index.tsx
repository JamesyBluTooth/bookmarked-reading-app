import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthPage } from "@/components/auth/AuthPage";
import { Dashboard } from "./Dashboard";
import { Books } from "./Books";
import Profile from "./Profile";
import ChallengeHistory from "./ChallengeHistory";
import { Social } from "./Social";
import { Sidebar } from "@/components/Sidebar";
import { RightPanel } from "@/components/RightPanel";
import { MobileNav } from "@/components/MobileNav";
import { DailyChallenge } from "@/components/dashboard/DailyChallenge";
import { FriendFeed } from "@/components/dashboard/FriendFeed";
import { SplashScreen } from "@/components/SplashScreen";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "books" | "profile" | "challenge-history" | "social">("dashboard");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
