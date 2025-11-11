import { Home, Library, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  activeTab: "dashboard" | "books";
  onTabChange: (tab: "dashboard" | "books") => void;
  onSignOut: () => void;
}

export const MobileNav = ({ activeTab, onTabChange, onSignOut }: MobileNavProps) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border shadow-lg z-50">
      <div className="flex justify-around items-center py-3">
        <button
          onClick={() => onTabChange("dashboard")}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === "dashboard" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          onClick={() => onTabChange("books")}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === "books" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Library className="w-6 h-6" />
          <span className="text-xs font-medium">Library</span>
        </button>

        <button
          className="flex flex-col items-center gap-1 text-muted-foreground transition-colors"
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Profile</span>
        </button>

        <button
          onClick={onSignOut}
          className="flex flex-col items-center gap-1 text-muted-foreground transition-colors"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};
