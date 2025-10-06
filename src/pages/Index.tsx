import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { VibePriceCard } from "@/components/VibePriceCard";
import { CategoryPills } from "@/components/CategoryPills";
import { GameCard } from "@/components/GameCard";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { NFTSidebar } from "@/components/NFTSidebar";
import { ChevronRight } from "lucide-react";
import galaxyBg from "@/assets/galaxy-bg.jpg";
import gameLoot from "@/assets/game-loot.png";
import gameSlice from "@/assets/game-slice.png";
import gameRun from "@/assets/game-run.png";

const games = [
  {
    title: "Loot and Hunger",
    description: "Fill your pockets with loot and snacks!",
    platforms: ["Web", "Mobile"],
    image: gameLoot,
    rank: 1,
  },
  {
    title: "Slice Master",
    description: "Cut to feed!",
    platforms: ["Web"],
    image: gameSlice,
    rank: 2,
  },
  {
    title: "Run 3",
    description: "Run, jump and defy gravity!",
    platforms: ["Web"],
    image: gameRun,
    rank: 3,
  },
];

const players = [
  { name: "Alex", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player1" },
  { name: "Jordan", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player2" },
  { name: "Casey", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player3" },
  { name: "Riley", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player4" },
];

const Index = () => {
  return (
    <div className="min-h-screen relative">
      {/* Galaxy Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${galaxyBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <NFTSidebar />
        
        <main className="lg:pr-48">
          <section className="pt-32 pb-12 px-4 md:px-6">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="flex-1">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-primary mb-4 tracking-tight">
                  THE VIBE
                  <br />
                  ARCADE
                </h1>
                <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl">
                  An open-source gaming platform where anyone can play and create their own games
                </p>
                <Button variant="arcade" size="lg" className="text-lg px-8 py-6 h-auto">
                  ENTER THE ARCADE
                </Button>
              </div>
              <div className="lg:pt-8">
                <VibePriceCard />
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12 pb-16">
            {/* Categories */}
            <div>
              <CategoryPills />
            </div>

            {/* Top Games Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-4xl font-bold text-foreground">Top Games</h2>
                <ChevronRight className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <GameCard key={game.title} {...game} />
                ))}
              </div>
            </section>

            {/* Top Players Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-4xl font-bold text-foreground">Top Players</h2>
                <ChevronRight className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </div>
              <div className="flex gap-8 overflow-x-auto pb-4">
                {players.map((player) => (
                  <PlayerAvatar key={player.name} {...player} />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
