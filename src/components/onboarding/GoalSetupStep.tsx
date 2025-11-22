import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock } from "lucide-react";

interface GoalSetupStepProps {
  data: {
    type: "pages" | "minutes";
    value: number;
  };
  onChange: (data: { type: "pages" | "minutes"; value: number }) => void;
}

export const GoalSetupStep = ({ data, onChange }: GoalSetupStepProps) => {
  const maxValue = data.type === "pages" ? 100 : 120;
  const minValue = data.type === "pages" ? 5 : 10;
  const step = data.type === "pages" ? 5 : 5;

  const handleValueChange = (newValue: number) => {
    const clampedValue = Math.max(minValue, Math.min(maxValue, newValue));
    onChange({ ...data, value: clampedValue });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-scale-in max-h-screen overflow-y-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Set Your Goal 🎯</h1>
        <p className="text-muted-foreground">Choose your daily reading target</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={data.type === "pages" ? "default" : "outline"}
          className="h-24 flex flex-col gap-2 transition-all hover:scale-105"
          onClick={() => onChange({ type: "pages", value: 30 })}
        >
          <BookOpen className="w-8 h-8" />
          <span>Pages</span>
        </Button>
        <Button
          variant={data.type === "minutes" ? "default" : "outline"}
          className="h-24 flex flex-col gap-2 transition-all hover:scale-105"
          onClick={() => onChange({ type: "minutes", value: 30 })}
        >
          <Clock className="w-8 h-8" />
          <span>Minutes</span>
        </Button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <div className="inline-flex items-baseline gap-2 bg-primary/10 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl">
            <span className="text-4xl sm:text-5xl font-bold text-primary">{data.value}</span>
            <span className="text-xl sm:text-2xl text-muted-foreground">
              {data.type === "pages" ? "pages" : "minutes"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Adjust your goal</Label>
          <Slider
            value={[data.value]}
            onValueChange={(values) => handleValueChange(values[0])}
            min={minValue}
            max={maxValue}
            step={step}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{minValue}</span>
            <span>{maxValue}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-value">Or enter manually</Label>
          <Input
            id="manual-value"
            type="number"
            value={data.value}
            onChange={(e) => handleValueChange(parseInt(e.target.value) || minValue)}
            min={minValue}
            max={maxValue}
            className="text-center text-lg transition-all focus:scale-[1.02]"
          />
        </div>
      </div>
    </div>
  );
};
