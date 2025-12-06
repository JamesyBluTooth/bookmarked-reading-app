import { getDataCompletenessScore } from '@/lib/hybridBookLookup';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DataCompletenessIndicatorProps {
  missingFields: string[];
  className?: string;
  showLabel?: boolean;
}

const fieldLabels: Record<string, string> = {
  title: 'Title',
  authors: 'Author',
  page_count: 'Page Count',
  cover_url: 'Cover Image',
  description: 'Description',
  categories: 'Categories/Genres',
  published_date: 'Publication Date',
};

export const DataCompletenessIndicator = ({
  missingFields,
  className,
  showLabel = true,
}: DataCompletenessIndicatorProps) => {
  const { score, label, color } = getDataCompletenessScore(missingFields);
  
  const Icon = score >= 90 ? CheckCircle : score >= 50 ? Info : AlertCircle;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-1.5 text-xs', className)}>
            <Icon className={cn('w-3.5 h-3.5', color)} />
            {showLabel && (
              <span className={cn('font-medium', color)}>
                {score}% {label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <div className="text-xs">
            {missingFields.length === 0 ? (
              <p className="text-green-600">All book data is complete!</p>
            ) : (
              <>
                <p className="font-medium mb-1">Missing information:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {missingFields.map((field) => (
                    <li key={field}>{fieldLabels[field] || field}</li>
                  ))}
                </ul>
                <p className="mt-2 text-muted-foreground">
                  Edit the book to add missing details and help the community!
                </p>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
