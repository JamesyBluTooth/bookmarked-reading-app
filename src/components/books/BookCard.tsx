import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Check } from "lucide-react";

interface BookCardProps {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  currentPage: number;
  totalPages: number;
  isCompleted: boolean;
  onClick: () => void;
}

export const BookCard = ({
  title,
  author,
  coverUrl,
  currentPage,
  totalPages,
  isCompleted,
  onClick,
}: BookCardProps) => {
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <Card 
      className="cursor-pointer hover:shadow-[var(--shadow-hover)] transition-all duration-300 group overflow-hidden animate-scale-in"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-24 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0 shadow-md">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-1">
              {title}
            </h3>
            {author && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                {author}
              </p>
            )}
            
            <div className="space-y-2">
              {isCompleted ? (
                <Badge className="bg-success text-success-foreground">
                  <Check className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {currentPage} / {totalPages} pages
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(progress)}% complete
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
