import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, AlertTriangle } from "lucide-react";
import { lookupBookByISBN, CanonicalBook } from "@/lib/hybridBookLookup";
import { getCommunityEdit, acceptCommunityEdit, BookUserEdit } from "@/lib/bookUserEdits";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataCompletenessIndicator } from "./DataCompletenessIndicator";
import { CommunityEditComparison } from "./CommunityEditComparison";

interface AddBookFormProps {
  onBookAdded: () => void;
}

export const AddBookForm = ({ onBookAdded }: AddBookFormProps) => {
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewBook, setPreviewBook] = useState<CanonicalBook | null>(null);
  const [communityEdit, setCommunityEdit] = useState<BookUserEdit | null>(null);
  const [useCommunityEdit, setUseCommunityEdit] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const handleSearch = async () => {
    if (!isbn.trim()) return;
    
    setLoading(true);
    setPreviewBook(null);
    setCommunityEdit(null);
    setUseCommunityEdit(null);

    try {
      const bookData = await lookupBookByISBN(isbn);
      
      if (!bookData) {
        toast({
          title: "Book not found",
          description: "No book found with that ISBN in Google Books or Open Library. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      setPreviewBook(bookData);

      // Check for community edits
      if (currentUserId) {
        const edit = await getCommunityEdit(isbn.replace(/[^0-9X]/gi, ''), currentUserId);
        if (edit) {
          setCommunityEdit(edit);
        }
      }
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

  const handleAcceptCommunityEdit = async () => {
    if (!communityEdit || !currentUserId) return;
    
    setLoading(true);
    try {
      await acceptCommunityEdit(communityEdit, currentUserId);
      setUseCommunityEdit(true);
      toast({
        title: "Community edit accepted",
        description: "The book will be added with the community-improved data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCommunityEdit = () => {
    setUseCommunityEdit(false);
  };

  const handleAddBook = async () => {
    if (!previewBook) return;
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Determine which data to use
      const useEdit = useCommunityEdit && communityEdit;
      
      const bookData = {
        user_id: user.id,
        isbn: previewBook.isbn,
        title: useEdit && communityEdit.title ? communityEdit.title : previewBook.title,
        author: useEdit && communityEdit.author ? communityEdit.author : previewBook.authors,
        genres: useEdit && communityEdit.genres ? communityEdit.genres : (previewBook.categories || []),
        cover_url: useEdit && communityEdit.cover_url ? communityEdit.cover_url : previewBook.cover_url,
        total_pages: useEdit && communityEdit.total_pages ? communityEdit.total_pages : previewBook.page_count,
      };

      const { error } = await supabase.from("books").insert(bookData);

      if (error) throw error;

      const hasIncompleteData = previewBook.missing_fields.length > 0 && !useEdit;

      if (hasIncompleteData) {
        toast({
          title: "Book added with incomplete data",
          description: "Some details are missing. You can edit them in the book details to help improve the data.",
        });
      } else {
        toast({
          title: "Book added!",
          description: `${bookData.title} has been added to your collection.`,
        });
      }

      setIsbn("");
      setPreviewBook(null);
      setCommunityEdit(null);
      setUseCommunityEdit(null);
      onBookAdded();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewBook) {
      await handleAddBook();
    } else {
      await handleSearch();
    }
  };

  const handleReset = () => {
    setPreviewBook(null);
    setCommunityEdit(null);
    setUseCommunityEdit(null);
    setIsbn("");
  };

  // Determine if user needs to make a choice about community edit
  const needsCommunityEditChoice = communityEdit && useCommunityEdit === null;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="isbn" className="sr-only">ISBN</Label>
          <Input
            id="isbn"
            placeholder="Enter ISBN (e.g., 9780545010221)"
            value={isbn}
            onChange={(e) => {
              setIsbn(e.target.value);
              if (previewBook) {
                setPreviewBook(null);
                setCommunityEdit(null);
                setUseCommunityEdit(null);
              }
            }}
            required
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || needsCommunityEditChoice}>
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Searching..." : previewBook ? "Add Book" : "Search"}
        </Button>
        {previewBook && (
          <Button type="button" variant="outline" onClick={handleReset}>
            Cancel
          </Button>
        )}
      </form>

      {previewBook && (
        <div className="space-y-4">
          {/* Community Edit Comparison */}
          {communityEdit && useCommunityEdit === null && (
            <CommunityEditComparison
              apiData={previewBook}
              communityEdit={communityEdit}
              onAccept={handleAcceptCommunityEdit}
              onReject={handleRejectCommunityEdit}
              loading={loading}
            />
          )}

          {/* Book Preview */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex gap-4">
              {previewBook.cover_url ? (
                <img
                  src={useCommunityEdit && communityEdit?.cover_url ? communityEdit.cover_url : previewBook.cover_url}
                  alt={previewBook.title}
                  className="w-16 h-24 object-cover rounded shadow-sm"
                />
              ) : (
                <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No cover</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">
                  {useCommunityEdit && communityEdit?.title ? communityEdit.title : previewBook.title}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {useCommunityEdit && communityEdit?.author 
                    ? communityEdit.author 
                    : (previewBook.authors || "Unknown author")}
                </p>
                {(useCommunityEdit && communityEdit?.total_pages 
                  ? communityEdit.total_pages 
                  : previewBook.page_count) && (
                  <p className="text-xs text-muted-foreground">
                    {useCommunityEdit && communityEdit?.total_pages 
                      ? communityEdit.total_pages 
                      : previewBook.page_count} pages
                  </p>
                )}
                
                <div className="mt-2 flex items-center gap-3">
                  {useCommunityEdit ? (
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">
                      Using community edit
                    </span>
                  ) : (
                    <>
                      <DataCompletenessIndicator 
                        missingFields={previewBook.missing_fields} 
                      />
                      
                      {(previewBook.source_google || previewBook.source_open_library) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>Sources:</span>
                          {previewBook.source_google && (
                            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                              Google
                            </span>
                          )}
                          {previewBook.source_open_library && (
                            <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                              Open Library
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {!useCommunityEdit && previewBook.missing_fields.length > 0 && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                      Some details missing. You can edit them after adding to help improve data quality.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
