import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shuffle } from "lucide-react";
import { 
  generateAvatarUrl, 
  generateRandomSeed, 
  BACKGROUND_COLORS,
  AVATAR_FEATURES 
} from "@/lib/avatarGenerator";

export default function AvatarCustomization() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [avatarSeed, setAvatarSeed] = useState(generateRandomSeed());
  const [backgroundColor, setBackgroundColor] = useState('b6e3f4');
  const [selectedEyes, setSelectedEyes] = useState<string[]>([]);
  const [selectedFace, setSelectedFace] = useState<string[]>([]);
  const [selectedHair, setSelectedHair] = useState<string[]>([]);
  const [selectedMouth, setSelectedMouth] = useState<string[]>([]);
  const [selectedNose, setSelectedNose] = useState<string[]>([]);

  useEffect(() => {
    loadCurrentAvatar();
  }, []);

  const loadCurrentAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_seed, avatar_type")
        .eq("user_id", user.id)
        .single();

      if (profile?.avatar_seed && profile?.avatar_type === 'generated') {
        setAvatarSeed(profile.avatar_seed);
      }
    } catch (error) {
      console.error("Error loading avatar:", error);
    }
  };

  const handleRandomize = () => {
    setAvatarSeed(generateRandomSeed());
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_seed: avatarSeed,
          avatar_type: 'generated',
          avatar_url: null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Avatar saved!",
        description: "Your avatar has been updated successfully.",
      });

      navigate(-1);
    } catch (error) {
      console.error("Error saving avatar:", error);
      toast({
        title: "Error",
        description: "Failed to save avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (feature: string, category: 'eyes' | 'face' | 'hair' | 'mouth' | 'nose') => {
    const setters = {
      eyes: setSelectedEyes,
      face: setSelectedFace,
      hair: setSelectedHair,
      mouth: setSelectedMouth,
      nose: setSelectedNose,
    };
    
    const getters = {
      eyes: selectedEyes,
      face: selectedFace,
      hair: selectedHair,
      mouth: selectedMouth,
      nose: selectedNose,
    };

    const setter = setters[category];
    const current = getters[category];

    if (current.includes(feature)) {
      setter(current.filter(f => f !== feature));
    } else {
      setter([...current, feature]);
    }
  };

  const displayAvatarUrl = generateAvatarUrl(avatarSeed, {
    backgroundColor,
    size: 200,
    eyes: selectedEyes.length > 0 ? selectedEyes : undefined,
    face: selectedFace.length > 0 ? selectedFace : undefined,
    hair: selectedHair.length > 0 ? selectedHair : undefined,
    mouth: selectedMouth.length > 0 ? selectedMouth : undefined,
    nose: selectedNose.length > 0 ? selectedNose : undefined,
  });

  const FeatureSection = ({ 
    title, 
    features, 
    selected, 
    category 
  }: { 
    title: string; 
    features: string[]; 
    selected: string[]; 
    category: 'eyes' | 'face' | 'hair' | 'mouth' | 'nose';
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">{title}</Label>
      <div className="flex flex-wrap gap-2">
        {features.map((feature) => (
          <Button
            key={feature}
            type="button"
            variant={selected.includes(feature) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFeature(feature, category)}
            className="capitalize"
          >
            {feature}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Customize Your Avatar</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="w-48 h-48">
                <AvatarImage src={displayAvatarUrl} />
              </Avatar>
              <Button
                onClick={handleRandomize}
                variant="outline"
                className="w-full"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Randomize
              </Button>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card>
            <CardHeader>
              <CardTitle>Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
              {/* Background Color */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Background Color</Label>
                <div className="flex flex-wrap gap-2">
                  {BACKGROUND_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setBackgroundColor(color.value)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        backgroundColor === color.value
                          ? 'border-primary scale-110 ring-2 ring-primary/20'
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: `#${color.value}` }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Feature Selectors */}
              <FeatureSection
                title="Eyes"
                features={AVATAR_FEATURES.eyes}
                selected={selectedEyes}
                category="eyes"
              />

              <Separator />

              <FeatureSection
                title="Face Shape"
                features={AVATAR_FEATURES.face}
                selected={selectedFace}
                category="face"
              />

              <Separator />

              <FeatureSection
                title="Hair Style"
                features={AVATAR_FEATURES.hair}
                selected={selectedHair}
                category="hair"
              />

              <Separator />

              <FeatureSection
                title="Mouth"
                features={AVATAR_FEATURES.mouth}
                selected={selectedMouth}
                category="mouth"
              />

              <Separator />

              <FeatureSection
                title="Nose"
                features={AVATAR_FEATURES.nose}
                selected={selectedNose}
                category="nose"
              />
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Avatar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
