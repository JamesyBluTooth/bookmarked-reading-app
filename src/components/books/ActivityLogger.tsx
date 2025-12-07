import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, Clock, MessageSquare, Sparkles } from "lucide-react";

interface ActivityLoggerProps {
  onLogPages: (pages: number) => Promise<void>;
  onLogMinutes: (minutes: number) => Promise<void>;
  onAddNote: (content: string) => Promise<void>;
  currentPage: number;
  totalPages: number;
  disabled?: boolean;
}

export const ActivityLogger = ({
  onLogPages,
  onLogMinutes,
  onAddNote,
  currentPage,
  totalPages,
  disabled,
}: ActivityLoggerProps) => {
  const [activeTab, setActiveTab] = useState<"pages" | "minutes" | "note">("pages");
  const [pages, setPages] = useState("");
  const [minutes, setMinutes] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogPages = async () => {
    const pagesNum = parseInt(pages);
    if (pagesNum <= 0) return;
    
    setLoading(true);
    await onLogPages(pagesNum);
    setPages("");
    setLoading(false);
  };

  const handleLogMinutes = async () => {
    const minutesNum = parseInt(minutes);
    if (minutesNum <= 0) return;
    
    setLoading(true);
    await onLogMinutes(minutesNum);
    setMinutes("");
    setLoading(false);
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    
    setLoading(true);
    await onAddNote(noteContent);
    setNoteContent("");
    setLoading(false);
  };

  const pagesXP = parseInt(pages) > 0 ? parseInt(pages) * 3 : 0;
  const minutesXP = parseInt(minutes) > 0 ? parseInt(minutes) * 2 : 0;

  const tabs = [
    { id: "pages" as const, icon: BookOpen, label: "Log Pages", xpRate: "3 XP/page" },
    { id: "minutes" as const, icon: Clock, label: "Log Minutes", xpRate: "2 XP/min" },
    { id: "note" as const, icon: MessageSquare, label: "Add Note", xpRate: "10 XP flat" },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Log Reading Activity</h3>

      <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "pages" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pages">Pages read</Label>
            <Input
              id="pages"
              type="number"
              min="1"
              placeholder="e.g., 25"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Currently on page {currentPage} of {totalPages}
            </p>
          </div>
          
          {pagesXP > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-warning" />
              <span className="text-muted-foreground">
                You'll earn <span className="font-semibold text-warning">+{pagesXP} XP</span>
              </span>
            </div>
          )}

          <Button 
            onClick={handleLogPages} 
            className="w-full gap-2"
            disabled={loading || disabled || !pages || parseInt(pages) <= 0}
          >
            <BookOpen className="w-4 h-4" />
            {loading ? "Logging..." : "Log Pages"}
          </Button>
        </div>
      )}

      {activeTab === "minutes" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minutes">Minutes read</Label>
            <Input
              id="minutes"
              type="number"
              min="1"
              placeholder="e.g., 30"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              disabled={disabled}
            />
          </div>
          
          {minutesXP > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-warning" />
              <span className="text-muted-foreground">
                You'll earn <span className="font-semibold text-warning">+{minutesXP} XP</span>
              </span>
            </div>
          )}

          <Button 
            onClick={handleLogMinutes} 
            className="w-full gap-2"
            disabled={loading || disabled || !minutes || parseInt(minutes) <= 0}
          >
            <Clock className="w-4 h-4" />
            {loading ? "Logging..." : "Log Minutes"}
          </Button>
        </div>
      )}

      {activeTab === "note" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note">Your thoughts, quotes, or reflections</Label>
            <Textarea
              id="note"
              placeholder="Write your note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              disabled={disabled}
            />
          </div>
          
          {noteContent.trim() && (
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-warning" />
              <span className="text-muted-foreground">
                You'll earn <span className="font-semibold text-warning">+10 XP</span>
              </span>
            </div>
          )}

          <Button 
            onClick={handleAddNote} 
            className="w-full gap-2"
            disabled={loading || disabled || !noteContent.trim()}
          >
            <MessageSquare className="w-4 h-4" />
            {loading ? "Adding..." : "Add Note"}
          </Button>
        </div>
      )}
    </Card>
  );
};