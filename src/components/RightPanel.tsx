import { DailyChallenge } from "./dashboard/DailyChallenge";
import { FriendFeed } from "./dashboard/FriendFeed";

export const RightPanel = () => {
  return (
    <aside className="hidden lg:flex lg:flex-col w-[340px] bg-card border-l border-border p-4 overflow-y-auto">
      <div className="space-y-4">
        <DailyChallenge />
        <FriendFeed />
      </div>
    </aside>
  );
};
