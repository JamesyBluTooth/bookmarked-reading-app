import { BookMarked, Home, Library, User, Settings, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: "dashboard" | "books" | "profile" | "clubs" | "social" | "settings";
  onTabChange: (tab: "dashboard" | "books" | "profile" | "clubs" | "social" | "settings") => void;
  onSignOut: () => void;
}

export const Sidebar = ({ activeTab, onTabChange, onSignOut }: SidebarProps) => {
  return (
    <aside className="hidden lg:flex flex-col w-[220px] h-screen bg-card border-r border-border p-4 justify-between overflow-hidden">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <BookMarked className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Bookmarked</h1>
      </div>

      <nav className="flex flex-col gap-1">
        <button
          onClick={() => onTabChange("dashboard")}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            activeTab === "dashboard"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => onTabChange("books")}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            activeTab === "books"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Library className="w-5 h-5" />
          <span className="font-medium">Books</span>
        </button>

        <button
          onClick={() => onTabChange("clubs")}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            activeTab === "clubs"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">Clubs</span>
        </button>

        <button
          onClick={() => onTabChange("social")}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            activeTab === "social"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">Friends</span>
        </button>

        <button
          onClick={() => onTabChange("profile")}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            activeTab === "profile"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <User className="w-5 h-5" />
          <span className="font-medium">Profile</span>
        </button>

        <button
          onClick={() => onTabChange("settings")}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            activeTab === "settings"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </nav>

      <button
        onClick={onSignOut}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all mt-4"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Log Out</span>
      </button>
    </aside>
  );
};
