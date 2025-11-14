import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, CheckCircle2, Trophy, Star, Flame, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FriendActivity {
  id: string;
  friendName: string;
  type: 'book_completed' | 'challenge_completed' | 'review_left' | 'streak_milestone';
  description: string;
  timestamp: Date;
}

export const FriendFeed = () => {
  const [activities, setActivities] = useState<FriendActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriendActivities();
  }, []);

  const loadFriendActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!friendships || friendships.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const friendIds = friendships.map(f => f.following_id);
      const allActivities: FriendActivity[] = [];

      // Get friend profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', friendIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name || 'Friend']) || []);

      // Get completed books
      const { data: completedBooks } = await supabase
        .from('books')
        .select('user_id, title, completed_at, rating')
        .in('user_id', friendIds)
        .eq('is_completed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(10);

      completedBooks?.forEach(book => {
        allActivities.push({
          id: `book-${book.completed_at}`,
          friendName: profileMap.get(book.user_id) || 'Friend',
          type: book.rating ? 'review_left' : 'book_completed',
          description: book.rating 
            ? `rated '${book.title}' ${book.rating} stars`
            : `completed '${book.title}'`,
          timestamp: new Date(book.completed_at!)
        });
      });

      // Get completed challenges
      const { data: completedChallenges } = await supabase
        .from('daily_challenges')
        .select('user_id, completed_at: updated_at')
        .in('user_id', friendIds)
        .eq('completed', true)
        .order('updated_at', { ascending: false })
        .limit(10);

      completedChallenges?.forEach(challenge => {
        allActivities.push({
          id: `challenge-${challenge.completed_at}`,
          friendName: profileMap.get(challenge.user_id) || 'Friend',
          type: 'challenge_completed',
          description: 'completed a daily challenge',
          timestamp: new Date(challenge.completed_at)
        });
      });

      // Sort all activities by timestamp
      allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setActivities(allActivities.slice(0, 15));
    } catch (error) {
      console.error('Error loading friend activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: FriendActivity['type']) => {
    switch (type) {
      case 'book_completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'challenge_completed':
        return <Trophy className="w-4 h-4 text-secondary" />;
      case 'review_left':
        return <Star className="w-4 h-4 text-warning" />;
      case 'streak_milestone':
        return <Flame className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Friend Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
            <Users className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No friend activity yet</p>
            <p className="text-xs mt-1">Add friends to see their reading updates</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 animate-slide-up">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.friendName}</span>{" "}
                    <span className="text-muted-foreground">{activity.description}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
