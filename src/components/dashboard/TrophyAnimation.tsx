import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

interface TrophyAnimationProps {
  success: boolean;
  onComplete: () => void;
}

export const TrophyAnimation = ({ success, onComplete }: TrophyAnimationProps) => {
  const [stage, setStage] = useState<"rising" | "splitting" | "done">("rising");

  useEffect(() => {
    // Rising animation
    const risingTimer = setTimeout(() => {
      if (!success) {
        setStage("splitting");
      }
    }, 1500);

    // Complete animation
    const completeTimer = setTimeout(() => {
      setStage("done");
      onComplete();
    }, success ? 2000 : 3000);

    return () => {
      clearTimeout(risingTimer);
      clearTimeout(completeTimer);
    };
  }, [success, onComplete]);

  if (stage === "done") return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
      onClick={() => {
        setStage("done");
        onComplete();
      }}
    >
      <div className="relative">
        {stage === "rising" && (
          <div className="animate-[scale-in_0.5s_ease-out,fade-in_0.5s_ease-out] flex flex-col items-center">
            <Trophy
              className={`w-32 h-32 ${
                success ? "text-warning" : "text-warning"
              } drop-shadow-2xl animate-[bounce_1s_ease-in-out_infinite]`}
              strokeWidth={1.5}
            />
            <p className="mt-4 text-2xl font-bold text-foreground">
              {success ? "Challenge Complete!" : "Challenge Expired"}
            </p>
          </div>
        )}

        {stage === "splitting" && (
          <div className="relative flex items-center justify-center">
            {/* Left half */}
            <div className="animate-[slide-out-left_0.8s_ease-in] absolute">
              <div className="overflow-hidden w-16">
                <Trophy
                  className="w-32 h-32 text-warning drop-shadow-2xl"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Right half */}
            <div className="animate-[slide-out-right_0.8s_ease-in] absolute">
              <div className="overflow-hidden w-16 ml-16">
                <Trophy
                  className="w-32 h-32 text-warning drop-shadow-2xl -ml-16"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <p className="mt-48 text-2xl font-bold text-muted-foreground animate-fade-in">
              Better luck tomorrow!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
