import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import logo from "@/assets/logo.png";

export const SplashScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-8 px-4">
        <div className="flex justify-center">
          <img 
            src={logo} 
            alt="Bookmarked Logo" 
            className="w-32 h-32 animate-pulse"
          />
        </div>
        <div className="space-y-4 max-w-xs mx-auto">
          <h2 className="text-2xl font-bold text-foreground">Bookmarked</h2>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">Loading your reading journey...</p>
        </div>
      </div>
    </div>
  );
};
