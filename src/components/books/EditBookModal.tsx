import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveUserEdit, getUserEdit, BookUserEdit } from "@/lib/bookUserEdits";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditBookModalProps {
  bookId: string;
  isbn?: string;
  currentData: {
    title: string;
    author?: string;
    total_pages?: number;
    genres?: string[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const EditBookModal = ({
  bookId,
  isbn,
  currentData,
  open,
  onOpenChange,
  onSave,
}: EditBookModalProps) => {
  const [formData, setFormData] = useState({
    title: currentData.title,
    author: currentData.author || "",
    total_pages: currentData.total_pages?.toString() || "",
    genres: currentData.genres?.join(", ") || "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && isbn) {
      loadExistingEdit();
    } else if (open) {
      resetForm();
    }
  }, [open, isbn, currentData]);

  const loadExistingEdit = async () => {
    if (!isbn) {
      resetForm();
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      resetForm();
      return;
    }

    const existingEdit = await getUserEdit(isbn, user.id);
    if (existingEdit) {
      setFormData({
        title: existingEdit.title || currentData.title,
        author: existingEdit.author || currentData.author || "",
        total_pages: existingEdit.total_pages?.toString() || currentData.total_pages?.toString() || "",
        genres: existingEdit.genres?.join(", ") || currentData.genres?.join(", ") || "",
      });
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: currentData.title,
      author: currentData.author || "",
      total_pages: currentData.total_pages?.toString() || "",
      genres: currentData.genres?.join(", ") || "",
    });
  };

  const handleSave = async () => {
    if (!isbn) {
      toast({
        title: "Cannot save edit",
        description: "This book doesn't have an ISBN, so edits cannot be shared with the community.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const genresArray = formData.genres.split(",").map(g => g.trim()).filter(g => g);

      const edit: Omit<BookUserEdit, 'id' | 'created_at' | 'updated_at'> = {
        isbn,
        user_id: user.id,
        title: formData.title !== currentData.title ? formData.title : undefined,
        author: formData.author !== (currentData.author || "") ? formData.author : undefined,
        total_pages: formData.total_pages && parseInt(formData.total_pages) !== (currentData.total_pages || 0) 
          ? parseInt(formData.total_pages) 
          : undefined,
        genres: JSON.stringify(genresArray) !== JSON.stringify(currentData.genres || []) 
          ? genresArray 
          : undefined,
      };

      // Only save if there are actual changes
      const hasChanges = edit.title || edit.author || edit.total_pages || edit.genres;
      
      if (hasChanges) {
        const result = await saveUserEdit(edit);
        if (!result) {
          throw new Error("Failed to save edit");
        }
        
        toast({
          title: "Changes saved",
          description: "Your edits have been saved and will be available for other users adding this book.",
        });
      }

      onSave();
      onOpenChange(false);
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Book Details</DialogTitle>
          <DialogDescription>
            Improve book data for the community
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-primary/30 bg-primary/5">
          <Users className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs">
            Your edits will be saved and offered to other users who add this book, helping improve data quality across the community.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Book title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Author name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pages">Total Pages</Label>
            <Input
              id="pages"
              type="number"
              value={formData.total_pages}
              onChange={(e) => setFormData({ ...formData, total_pages: e.target.value })}
              placeholder="Number of pages"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genres">Genres (comma-separated)</Label>
            <Input
              id="genres"
              value={formData.genres}
              onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
              placeholder="Fiction, Mystery, Thriller"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
