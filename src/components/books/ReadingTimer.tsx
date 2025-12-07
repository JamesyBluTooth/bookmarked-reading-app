import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Timer, Sparkles } from "lucide-react";

interface ReadingTimerProps {
  onStop: (minutes: number) => void;
  disabled?: boolean;
}

export const ReadingTimer = ({ onStop, disabled }: ReadingTimerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  
  const handleStop = () => {
    setIsRunning(false);
    const minutes = Math.max(1, Math.round(seconds / 60));
    onStop(minutes);
    setSeconds(0);
  };

  const currentMinutes = Math.floor(seconds / 60);
  const projectedXP = currentMinutes * 2;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Reading Timer</h3>
      </div>

      <div className="text-center space-y-4">
        <div className="font-mono text-5xl font-bold text-foreground tracking-wider">
          {formatTime(seconds)}
        </div>

        {seconds > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-warning" />
            <span>
              {currentMinutes} min = <span className="font-semibold text-warning">+{projectedXP} XP</span> projected
            </span>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <Button 
              onClick={handleStart} 
              className="gap-2"
              disabled={disabled}
            >
              <Play className="w-4 h-4" />
              {seconds === 0 ? "Start" : "Resume"}
            </Button>
          ) : (
            <Button onClick={handlePause} variant="secondary" className="gap-2">
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}

          {seconds > 0 && (
            <Button 
              onClick={handleStop} 
              variant="default"
              className="gap-2 bg-success hover:bg-success/90"
            >
              <Square className="w-4 h-4" />
              Stop & Log
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Earn 2 XP for every minute you read
        </p>
      </div>
    </Card>
  );
};