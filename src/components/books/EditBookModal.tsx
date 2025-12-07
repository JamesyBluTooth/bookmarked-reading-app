import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LocalBookOverride, setLocalBookOverride, getLocalBookOverride } from "@/lib/localBookCache";

interface EditBookModalProps {
  bookId: string;
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

  useEffect(() => {
    if (open) {
      // Load any existing local overrides
      const override = getLocalBookOverride(bookId);
      if (override) {
        setFormData({
          title: override.title || currentData.title,
          author: override.author || currentData.author || "",
          total_pages: override.total_pages?.toString() || currentData.total_pages?.toString() || "",
          genres: override.genres?.join(", ") || currentData.genres?.join(", ") || "",
        });
      } else {
        setFormData({
          title: currentData.title,
          author: currentData.author || "",
          total_pages: currentData.total_pages?.toString() || "",
          genres: currentData.genres?.join(", ") || "",
        });
      }
    }
  }, [open, bookId, currentData]);

  const handleSave = () => {
    const override: LocalBookOverride = {};
    
    if (formData.title !== currentData.title) {
      override.title = formData.title;
    }
    if (formData.author !== (currentData.author || "")) {
      override.author = formData.author;
    }
    if (formData.total_pages && parseInt(formData.total_pages) !== (currentData.total_pages || 0)) {
      override.total_pages = parseInt(formData.total_pages);
    }
    const genresArray = formData.genres.split(",").map(g => g.trim()).filter(g => g);
    const currentGenres = currentData.genres || [];
    if (JSON.stringify(genresArray) !== JSON.stringify(currentGenres)) {
      override.genres = genresArray;
    }

    setLocalBookOverride(bookId, override);
    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Book Details</DialogTitle>
          <DialogDescription>
            Local corrections for incomplete data
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            These changes only affect how the book displays on your device. They won't be saved to the database and are useful when Google Books is missing information.
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
