import { Button } from "@/components/ui/button";
import { Users, Check, X } from "lucide-react";
import { BookUserEdit } from "@/lib/bookUserEdits";
import { CanonicalBook } from "@/lib/hybridBookLookup";

interface CommunityEditComparisonProps {
  apiData: CanonicalBook;
  communityEdit: BookUserEdit;
  onAccept: () => void;
  onReject: () => void;
  loading?: boolean;
}

interface ComparisonRowProps {
  label: string;
  apiValue: string | number | null | undefined;
  editedValue: string | number | null | undefined;
  isChanged: boolean;
}

const ComparisonRow = ({ label, apiValue, editedValue, isChanged }: ComparisonRowProps) => {
  if (!isChanged) return null;
  
  const formatValue = (val: string | number | null | undefined) => {
    if (val === null || val === undefined || val === '') return <span className="text-muted-foreground italic">Not available</span>;
    return String(val);
  };

  return (
    <div className="grid grid-cols-3 gap-2 text-sm py-1.5 border-b border-border/50 last:border-b-0">
      <div className="font-medium text-muted-foreground">{label}</div>
      <div className="text-muted-foreground line-through opacity-60">{formatValue(apiValue)}</div>
      <div className="text-foreground font-medium">{formatValue(editedValue)}</div>
    </div>
  );
};

export const CommunityEditComparison = ({
  apiData,
  communityEdit,
  onAccept,
  onReject,
  loading = false,
}: CommunityEditComparisonProps) => {
  const changes = {
    title: communityEdit.title && communityEdit.title !== apiData.title,
    author: communityEdit.author && communityEdit.author !== apiData.authors,
    pages: communityEdit.total_pages && communityEdit.total_pages !== apiData.page_count,
    genres: communityEdit.genres && 
      JSON.stringify(communityEdit.genres) !== JSON.stringify(apiData.categories),
  };

  const hasChanges = Object.values(changes).some(Boolean);

  if (!hasChanges) return null;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2 text-primary">
        <Users className="w-4 h-4" />
        <span className="font-medium text-sm">Community Edit Available</span>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Another user has improved the data for this book. You can accept their changes or use the original API data.
      </p>

      <div className="bg-background rounded-md p-3">
        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b border-border mb-2">
          <div>Field</div>
          <div>API Data</div>
          <div>Edited</div>
        </div>
        
        <ComparisonRow 
          label="Title" 
          apiValue={apiData.title} 
          editedValue={communityEdit.title} 
          isChanged={changes.title || false} 
        />
        <ComparisonRow 
          label="Author" 
          apiValue={apiData.authors} 
          editedValue={communityEdit.author} 
          isChanged={changes.author || false} 
        />
        <ComparisonRow 
          label="Pages" 
          apiValue={apiData.page_count} 
          editedValue={communityEdit.total_pages} 
          isChanged={changes.pages || false} 
        />
        <ComparisonRow 
          label="Genres" 
          apiValue={apiData.categories?.join(', ')} 
          editedValue={communityEdit.genres?.join(', ')} 
          isChanged={changes.genres || false} 
        />
      </div>

      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={onAccept} 
          disabled={loading}
          className="flex-1"
        >
          <Check className="w-4 h-4 mr-1" />
          Use Edited Version
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onReject} 
          disabled={loading}
          className="flex-1"
        >
          <X className="w-4 h-4 mr-1" />
          Use API Data
        </Button>
      </div>
    </div>
  );
};
