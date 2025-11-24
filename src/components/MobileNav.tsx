import { Home, Library, User, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  activeTab: "dashboard" | "books" | "profile" | "clubs" | "social" | "settings";
  onTabChange: (tab: "dashboard" | "books" | "profile" | "clubs" | "social" | "settings") => void;
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
          onClick={() => onTabChange("clubs")}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === "clubs" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Clubs</span>
        </button>

        <button
          onClick={() => onTabChange("social")}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === "social" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Friends</span>
        </button>

        <button
          onClick={() => onTabChange("profile")}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === "profile" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Profile</span>
        </button>

        <button
          onClick={onSignOut}
          className="flex flex-col items-center gap-1 transition-colors text-destructive"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};
