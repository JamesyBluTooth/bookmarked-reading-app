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
  SKIN_COLORS,
  HAIR_COLORS,
  CLOTHING_COLORS,
  AVATAR_FEATURES 
} from "@/lib/avatarGenerator";

export default function AvatarCustomization() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [seed, setSeed] = useState(generateRandomSeed());
  const [backgroundColor, setBackgroundColor] = useState('b6e3f4');
  const [skinColor, setSkinColor] = useState<string | null>(null);
  const [selectedEyes, setSelectedEyes] = useState<string | null>(null);
  const [selectedHair, setSelectedHair] = useState<string | null>(null);
  const [hairColor, setHairColor] = useState<string | null>(null);
  const [selectedFacialHair, setSelectedFacialHair] = useState<string | null>(null);
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [clothingColor, setClothingColor] = useState<string | null>(null);
  const [selectedMouth, setSelectedMouth] = useState<string | null>(null);
  const [selectedNose, setSelectedNose] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentAvatar();
  }, []);

  const loadCurrentAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customization } = await supabase
        .from("avatar_customizations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (customization) {
        setBackgroundColor(customization.background_color);
        setSkinColor(customization.skin_color);
        setSelectedEyes(customization.eyes);
        setSelectedHair(customization.hair);
        setHairColor(customization.hair_color);
        setSelectedFacialHair(customization.facial_hair);
        setSelectedBody(customization.body);
        setClothingColor(customization.clothing_color);
        setSelectedMouth(customization.mouth);
        setSelectedNose(customization.nose);
      }
    } catch (error) {
      console.error("Error loading avatar:", error);
    }
  };

  const handleRandomize = () => {
    setSeed(generateRandomSeed());
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save avatar customization details
      const { error: customizationError } = await supabase
        .from("avatar_customizations")
        .upsert({
          user_id: user.id,
          background_color: backgroundColor,
          skin_color: skinColor || 'f9c9b6',
          eyes: selectedEyes || 'happy',
          hair: selectedHair || 'short01',
          hair_color: hairColor || '0e0e0e',
          facial_hair: selectedFacialHair || 'none',
          body: selectedBody || 'checkered01',
          clothing_color: clothingColor || '262e33',
          mouth: selectedMouth || 'happy01',
          nose: selectedNose || 'smallRound',
        });

      if (customizationError) throw customizationError;

      // Update profile to indicate generated avatar
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_seed: seed,
          avatar_type: 'generated',
          avatar_url: null,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

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

  const selectFeature = (
    feature: string,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setter(feature);
  };

  const selectColor = (
    color: string,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setter(color);
  };

  const displayAvatarUrl = generateAvatarUrl(seed, {
    backgroundColor,
    size: 200,
    ...(skinColor && { skinColor }),
    ...(selectedEyes && { eyes: selectedEyes }),
    ...(selectedHair && { hair: selectedHair }),
    ...(hairColor && { hairColor }),
    ...(selectedFacialHair && { facialHair: selectedFacialHair }),
    ...(selectedBody && { body: selectedBody }),
    ...(clothingColor && { clothingColor }),
    ...(selectedMouth && { mouth: selectedMouth }),
    ...(selectedNose && { nose: selectedNose }),
  });

  const FeatureSection = ({
    title,
    features,
    selectedFeature,
    onSelect,
  }: {
    title: string;
    features: string[];
    selectedFeature: string | null;
    onSelect: (feature: string) => void;
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">{title}</Label>
      <div className="flex flex-wrap gap-2">
        {features.map((feature) => (
          <Button
            key={feature}
            type="button"
            variant={selectedFeature === feature ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(feature)}
            className="capitalize"
          >
            {feature}
          </Button>
        ))}
      </div>
    </div>
  );

  const ColorSection = ({
    title,
    colors,
    selectedColor,
    onSelect,
  }: {
    title: string;
    colors: { name: string; value: string }[];
    selectedColor: string | null;
    onSelect: (color: string) => void;
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">{title}</Label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onSelect(color.value)}
            className={`w-10 h-10 rounded-full border-2 transition-all ${
              selectedColor === color.value
                ? 'border-primary scale-110 ring-2 ring-primary/20'
                : 'border-border hover:scale-105'
            }`}
            style={{ backgroundColor: `#${color.value}` }}
            title={color.name}
          />
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

              {/* Skin Tone */}
              <ColorSection
                title="Skin Tone"
                colors={SKIN_COLORS}
                selectedColor={skinColor}
                onSelect={(color) => selectColor(color, setSkinColor)}
              />

              <Separator />

              {/* Eyes */}
              <FeatureSection
                title="Eyes"
                features={AVATAR_FEATURES.eyes}
                selectedFeature={selectedEyes}
                onSelect={(feature) => selectFeature(feature, setSelectedEyes)}
              />

              <Separator />

              {/* Hair Style */}
              <FeatureSection
                title="Hair Style"
                features={AVATAR_FEATURES.hair}
                selectedFeature={selectedHair}
                onSelect={(feature) => selectFeature(feature, setSelectedHair)}
              />

              <Separator />

              {/* Hair Color */}
              <ColorSection
                title="Hair Color"
                colors={HAIR_COLORS}
                selectedColor={hairColor}
                onSelect={(color) => selectColor(color, setHairColor)}
              />

              <Separator />

              {/* Facial Hair */}
              <FeatureSection
                title="Facial Hair"
                features={AVATAR_FEATURES.facialHair}
                selectedFeature={selectedFacialHair}
                onSelect={(feature) =>
                  selectFeature(feature, setSelectedFacialHair)
                }
              />

              <Separator />

              {/* Body Type */}
              <FeatureSection
                title="Body Type"
                features={AVATAR_FEATURES.body}
                selectedFeature={selectedBody}
                onSelect={(feature) => selectFeature(feature, setSelectedBody)}
              />

              <Separator />

              {/* Clothing Color */}
              <ColorSection
                title="Clothing Color"
                colors={CLOTHING_COLORS}
                selectedColor={clothingColor}
                onSelect={(color) => selectColor(color, setClothingColor)}
              />

              <Separator />

              {/* Mouth */}
              <FeatureSection
                title="Mouth"
                features={AVATAR_FEATURES.mouth}
                selectedFeature={selectedMouth}
                onSelect={(feature) => selectFeature(feature, setSelectedMouth)}
              />

              <Separator />

              {/* Nose */}
              <FeatureSection
                title="Nose"
                features={AVATAR_FEATURES.nose}
                selectedFeature={selectedNose}
                onSelect={(feature) => selectFeature(feature, setSelectedNose)}
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
