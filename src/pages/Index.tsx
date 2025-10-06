import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { SubmitGameDialog } from "@/components/SubmitGameDialog";
import { Button } from "@/components/ui/button";
import { VibePriceCard } from "@/components/VibePriceCard";
import { CategoryPills } from "@/components/CategoryPills";
import { GameCard } from "@/components/GameCard";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { NFTSidebar } from "@/components/NFTSidebar";
import { ChevronRight } from "lucide-react";
import galaxyBg from "@/assets/galaxy-bg.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const players = [
  { name: "Alex", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player1" },
  { name: "Jordan", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player2" },
  { name: "Casey", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player3" },
  { name: "Riley", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player4" },
];

const Index = () => {
  const navigate = useNavigate();
  const { data: games = [], isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          play_url,
          status,
          is_anonymous,
          creator_id,
          profiles(username, avatar_url)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const scrollToGames = () => {
    document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' });
  };

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
          <section className="pt-24 pb-8">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="max-w-md space-y-6">
              <div className="flex items-center justify-start mb-6">
                <VibePriceCard />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-primary mb-3 tracking-tight">
                PLAY & BUILD
              </h2>
              <p className="text-base md:text-lg text-foreground/80 mb-6">
                Powered by creators. Owned by players.
              </p>

              <SubmitGameDialog />
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8 pb-16" id="games-section">
            {/* Categories */}
            <div>
              <CategoryPills />
            </div>

            {/* Top Games Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-foreground">Top Games</h2>
                <button
                  onClick={() => navigate('/arcade')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-glass/30 backdrop-blur-md border border-glass-border/40 text-foreground/80 hover:bg-glass/50 hover:border-accent/50 hover:text-foreground transition-all"
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : games.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No games yet</div>
              ) : (
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
                  {games.slice(0, 6).map((game, index) => (
                    <div key={game.id} className="flex-shrink-0 w-80">
                      <GameCard
                        id={game.id}
                        title={game.title}
                        description={game.description || ""}
                        platforms={["Web"]}
                        image={game.thumbnail_url || `https://images.unsplash.com/photo-${['1511512578047-dfb367046420', '1538481199705-c710c4e965fc', '1579566346927-c68383817a25'][index % 3]}?w=800&auto=format&fit=crop`}
                        rank={index + 1}
                        creatorProfile={game.profiles}
                        isAnonymous={game.is_anonymous}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* NFTs Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-foreground">Featured NFTs</h2>
                <ChevronRight className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </div>
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                {[1, 2, 3, 4, 5].map((nft) => (
                  <div key={nft} className="flex-shrink-0 w-64 bg-glass/20 backdrop-blur-xl border-2 border-glass-border/20 rounded-xl p-4 hover:bg-glass/30 transition-all">
                    <div className="aspect-square bg-gradient-to-br from-accent/30 to-neon-cyan/30 rounded-lg mb-3" />
                    <h3 className="font-bold text-foreground mb-1">NFT #{nft}</h3>
                    <p className="text-sm text-muted-foreground">Collectible asset</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Players Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-foreground">Top Players</h2>
                <ChevronRight className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4">
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
