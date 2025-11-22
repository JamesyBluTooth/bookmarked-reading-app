import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { reviewSchema } from "@/lib/validation";

interface CompleteBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  totalPages: number;
  onUpdate: () => void;
}

export const CompleteBookModal = ({
  open,
  onOpenChange,
  bookId,
  totalPages,
  onUpdate,
}: CompleteBookModalProps) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate review if provided
      if (review.trim()) {
        const result = reviewSchema.safeParse({ review: review.trim() });
        if (!result.success) {
          throw new Error(result.error.errors[0].message);
        }
      }

      const { error } = await supabase
        .from("books")
        .update({
          is_completed: true,
          current_page: totalPages,
          rating: rating > 0 ? rating : null,
          review: review.trim() || null,
        })
        .eq("id", bookId);

      if (error) throw error;

      toast({
        title: "Book completed!",
        description: "Congratulations on finishing this book!",
      });

      setRating(0);
      setReview("");
      onOpenChange(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Book</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating (optional)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="review">Review (optional)</Label>
            <Textarea
              id="review"
              placeholder="Write your review..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              maxLength={2000}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {review.length}/2000 characters
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              Skip
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Completing..." : "Complete Book"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
