import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, MessageSquare, Zap, Target, Crown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ClubAchievementCardProps {
  achievement: {
    id: string;
    achievement_type: string;
    earned_at: string;
    profiles: {
      display_name: string;
    };
  };
}

export function ClubAchievementCard({ achievement }: ClubAchievementCardProps) {
  const getAchievementDetails = (type: string) => {
    switch (type) {
      case "first_book":
        return {
          icon: <BookOpen className="h-6 w-6" />,
          title: "First Book Complete",
          description: "Completed their first book in the club",
          color: "bg-blue-500",
        };
      case "five_books":
        return {
          icon: <BookOpen className="h-6 w-6" />,
          title: "Five Books Complete",
          description: "Completed five books in the club",
          color: "bg-purple-500",
        };
      case "ten_books":
        return {
          icon: <Trophy className="h-6 w-6" />,
          title: "Ten Books Complete",
          description: "Completed ten books in the club",
          color: "bg-yellow-500",
        };
      case "discussion_starter":
        return {
          icon: <MessageSquare className="h-6 w-6" />,
          title: "Discussion Starter",
          description: "Started their first discussion",
          color: "bg-green-500",
        };
      case "fast_reader":
        return {
          icon: <Zap className="h-6 w-6" />,
          title: "Fast Reader",
          description: "Completed a book before the deadline",
          color: "bg-orange-500",
        };
      case "consistent_reader":
        return {
          icon: <Target className="h-6 w-6" />,
          title: "Consistent Reader",
          description: "Read consistently for multiple weeks",
          color: "bg-pink-500",
        };
      case "club_founder":
        return {
          icon: <Crown className="h-6 w-6" />,
          title: "Club Founder",
          description: "Created this book club",
          color: "bg-amber-500",
        };
      default:
        return {
          icon: <Trophy className="h-6 w-6" />,
          title: "Achievement",
          description: "Earned an achievement",
          color: "bg-gray-500",
        };
    }
  };

  const details = getAchievementDetails(achievement.achievement_type);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${details.color} text-white`}>
            {details.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{details.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">{details.description}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{achievement.profiles.display_name}</Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
