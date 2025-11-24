import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateClubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateClubModal({ open, onOpenChange, onSuccess }: CreateClubModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate invite code
      const { data: inviteCode } = await supabase.rpc("generate_club_invite_code");

      // Create club
      const { data: club, error: clubError } = await supabase
        .from("book_clubs")
        .insert({
          name,
          description: description || null,
          is_private: isPrivate,
          created_by: user.id,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (clubError) throw clubError;

      // Add creator as member
      await supabase.from("club_members").insert({
        club_id: club.id,
        user_id: user.id,
      });

      // Add creator as owner
      await supabase.from("club_roles").insert({
        club_id: club.id,
        user_id: user.id,
        role: "owner",
      });

      // Award founder achievement
      await supabase.from("club_achievements").insert({
        club_id: club.id,
        user_id: user.id,
        achievement_type: "club_founder",
      });

      toast.success("Club created successfully!");
      setName("");
      setDescription("");
      setIsPrivate(true);
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to create club");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Book Club</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Club Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter club name"
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
              placeholder="What's your club about?"
              maxLength={1000}
              rows={4}
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
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create Club"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
