import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthPage } from "@/components/auth/AuthPage";
import { Dashboard } from "./Dashboard";
import { Books } from "./Books";
import Profile from "./Profile";
import { Social } from "./Social";
import Settings from "./Settings";
import Clubs from "./Clubs";
import { Sidebar } from "@/components/Sidebar";
import { RightPanel } from "@/components/RightPanel";
import { MobileNav } from "@/components/MobileNav";
import { DailyChallenge } from "@/components/dashboard/DailyChallenge";
import { FriendFeed } from "@/components/dashboard/FriendFeed";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "books" | "profile" | "clubs" | "social" | "settings">("dashboard");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setShowOnboarding(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed, theme_preference")
          .eq("user_id", session.user.id)
          .single();

        if (!cancelled) {
          setShowOnboarding(!profile?.onboarding_completed);
          
          // Apply theme preference
          if (profile?.theme_preference) {
            applyTheme(profile.theme_preference);
          }
        }
      } catch {
        if (!cancelled) {
          setShowOnboarding(false);
        }
      }
    };

    setTimeout(loadProfile, 0);

    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  // Theme application logic
  useEffect(() => {
    const applySystemTheme = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.remove('light', 'dark', 'bookish');
      document.documentElement.classList.add(isDark ? 'dark' : 'light');
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applySystemTheme);

    return () => mediaQuery.removeEventListener('change', applySystemTheme);
  }, []);

  const applyTheme = (theme: string) => {
    // Add a small delay to ensure smooth transition
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <AuthPage />;
  }

  if (showOnboarding) {
    return <OnboardingContainer onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onSignOut={handleSignOut} />

      <main className="flex-1 overflow-y-auto h-screen pb-20 lg:pb-0">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-6xl">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "books" && <Books />}
          {activeTab === "clubs" && <Clubs />}
          {activeTab === "social" && <Social />}
          {activeTab === "profile" && <Profile />}
          {activeTab === "settings" && <Settings />}
        </div>

        {/* Mobile: Show right panel content below main content */}
        <div className="lg:hidden container mx-auto px-4 pb-6 space-y-4">
          <DailyChallenge />
          {activeTab === "social" && <FriendFeed />}
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
