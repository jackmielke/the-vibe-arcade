import { Header } from "@/components/Header";
import { PlayerAvatar } from "@/components/PlayerAvatar";

const players = [
  { name: "Alex", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player1" },
  { name: "Jordan", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player2" },
  { name: "Casey", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player3" },
  { name: "Riley", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player4" },
];

const Friends = () => {
  return (
    <div className="min-h-screen pb-24">
      <Header />
      
      <main className="pt-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Friends</h1>
            <p className="text-muted-foreground">Connect and play with friends</p>
          </div>

          <div className="bg-glass/20 backdrop-blur-xl border border-glass-border/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Top Players</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {players.map((player) => (
                <PlayerAvatar key={player.name} {...player} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Friends;
