import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JoinClubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function JoinClubModal({ open, onOpenChange, onSuccess }: JoinClubModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find club by invite code
      const { data: club, error: clubError } = await supabase
        .from("book_clubs")
        .select("id")
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

      if (clubError || !club) {
        toast.error("Invalid invite code");
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("club_members")
        .select("id")
        .eq("club_id", club.id)
        .eq("user_id", user.id)
        .single();

      if (existingMember) {
        toast.error("You're already a member of this club");
        return;
      }

      // Add as member
      await supabase.from("club_members").insert({
        club_id: club.id,
        user_id: user.id,
      });

      // Add member role
      await supabase.from("club_roles").insert({
        club_id: club.id,
        user_id: user.id,
        role: "member",
      });

      toast.success("Joined club successfully!");
      setInviteCode("");
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to join club");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Book Club</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 8-character code"
              maxLength={8}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Ask a club member for the invite code
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || inviteCode.length !== 8}>
              {loading ? "Joining..." : "Join Club"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
