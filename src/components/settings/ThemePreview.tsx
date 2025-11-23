import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";

interface ThemePreviewProps {
  value: string;
  label: string;
  description?: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    card: string;
  };
}

export function ThemePreview({ value, label, description, colors }: ThemePreviewProps) {
  return (
    <div className="flex items-start space-x-3 group cursor-pointer">
      <RadioGroupItem value={value} id={value} className="mt-1" />
      <label htmlFor={value} className="flex-1 cursor-pointer">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={value} className="cursor-pointer font-medium">
              {label}
            </Label>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <Card 
            className="overflow-hidden transition-transform duration-200 group-hover:scale-105"
            style={{
              background: colors.background,
              borderColor: colors.primary
            }}
          >
            <div className="h-20 p-3 space-y-2">
              <div 
                className="h-3 w-3/4 rounded"
                style={{ background: colors.foreground }}
              />
              <div 
                className="h-3 w-1/2 rounded"
                style={{ background: colors.primary }}
              />
              <div 
                className="h-6 w-16 rounded flex items-center justify-center text-xs font-medium"
                style={{ 
                  background: colors.primary,
                  color: colors.card
                }}
              >
                Button
              </div>
            </div>
          </Card>
        </div>
      </label>
    </div>
  );
}
