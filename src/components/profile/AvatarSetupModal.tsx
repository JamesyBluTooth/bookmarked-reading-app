import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AvatarSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AvatarSetupModal = ({ open, onOpenChange }: AvatarSetupModalProps) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    onOpenChange(false);
    navigate("/customize-avatar");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Time to Create Your Avatar!</DialogTitle>
          <DialogDescription className="text-center text-base">
            Make your profile stand out with a unique avatar. Choose from hundreds of customization options to create something that represents you.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleContinue} size="lg" className="w-full sm:w-auto">
            Let's Create!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
