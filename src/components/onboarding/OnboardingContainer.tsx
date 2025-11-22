import { useState, useRef, useEffect } from "react";
import { ProfileSetupStep } from "./ProfileSetupStep";
import { GoalSetupStep } from "./GoalSetupStep";
import { BookSetupStep } from "./BookSetupStep";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profileSchema } from "@/lib/validation";

interface OnboardingContainerProps {
  onComplete: () => void;
}

export const OnboardingContainer = ({ onComplete }: OnboardingContainerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<{
    displayName: string;
    avatarUrl: string | null;
    bio: string;
  }>({
    displayName: "",
    avatarUrl: null,
    bio: "",
  });

  const [goalData, setGoalData] = useState<{
    type: "pages" | "minutes";
    value: number;
  }>({
    type: "pages",
    value: 30,
  });

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < -50 && !isTransitioning) {
        handleNextStep();
      } else if (e.deltaY > 50 && !isTransitioning && currentStep > 0) {
        handlePreviousStep();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel);
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [currentStep, isTransitioning]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (diff < -100 && !isTransitioning) {
      handleNextStep();
    } else if (diff > 100 && !isTransitioning && currentStep > 0) {
      handlePreviousStep();
    }
  };

  const handlePreviousStep = () => {
    if (isTransitioning || currentStep === 0) return;
    
    setIsTransitioning(true);
    setCurrentStep((prev) => prev - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNextStep = async () => {
    if (isTransitioning) return;

    if (currentStep === 0 && !profileData.displayName.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to continue.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 0) {
      try {
        // Validate profile data
        const result = profileSchema.safeParse({
          display_name: profileData.displayName,
          bio: profileData.bio || undefined
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
          .update({
            display_name: result.data.display_name,
            avatar_url: profileData.avatarUrl,
            bio: result.data.bio || null,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error saving profile:", error);
        toast({
          title: "Error",
          description: "Failed to save profile. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 1) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from("profiles")
          .update({
            daily_goal_type: goalData.type,
            daily_goal_value: goalData.value,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error saving goal:", error);
        toast({
          title: "Error",
          description: "Failed to save goal. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep < 2) {
      setIsTransitioning(true);
      setCurrentStep((prev) => prev + 1);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const handleBookAdded = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Welcome aboard! 📚",
        description: "Your reading journey begins now.",
      });

      onComplete();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  const steps = [
    <ProfileSetupStep
      key="profile"
      data={profileData}
      onChange={setProfileData}
    />,
    <GoalSetupStep
      key="goal"
      data={goalData}
      onChange={setGoalData}
    />,
    <BookSetupStep
      key="book"
      onBookAdded={handleBookAdded}
    />,
  ];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-background overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative h-full transition-transform duration-500 ease-out"
        style={{
          transform: `translateY(-${currentStep * 100}%)`,
        }}
      >
        {steps.map((step, index) => (
          <div
            key={index}
            className="h-screen w-full flex items-center justify-center p-6"
          >
            <div className="w-full max-w-md animate-fade-in">
              {step}
            </div>
          </div>
        ))}
      </div>

      {/* Step indicator */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {[0, 1, 2].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === currentStep
                ? "w-8 bg-primary"
                : step < currentStep
                ? "w-1.5 bg-success"
                : "w-1.5 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Next button */}
      {currentStep < 2 && (
        <Button
          onClick={handleNextStep}
          disabled={isTransitioning}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
          size="icon"
        >
          <ChevronUp className="w-6 h-6" />
        </Button>
      )}

      {/* Swipe hint */}
      {currentStep === 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 text-muted-foreground text-sm animate-pulse">
          Swipe up or tap the button to continue
        </div>
      )}
    </div>
  );
};
