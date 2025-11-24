import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClubSettingsProps {
  club: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ClubSettings({ club, open, onOpenChange, onUpdate }: ClubSettingsProps) {
  const [name, setName] = useState(club.name);
  const [description, setDescription] = useState(club.description || "");
  const [isPrivate, setIsPrivate] = useState(club.is_private);
  const [maxMembers, setMaxMembers] = useState(club.max_members);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const { error } = await supabase
        .from("book_clubs")
        .update({
          name,
          description: description || null,
          is_private: isPrivate,
          max_members: maxMembers,
        })
        .eq("id", club.id);

      if (error) throw error;

      toast.success("Club settings updated!");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to update club settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Club Settings</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Club Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="maxMembers">Max Members</Label>
            <Input
              id="maxMembers"
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              min={1}
              max={500}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="private">Private Club</Label>
              <p className="text-sm text-muted-foreground">
                Only members with invite code can join
              </p>
            </div>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
