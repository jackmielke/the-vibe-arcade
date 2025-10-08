import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { SubmitGameDialog } from "@/components/SubmitGameDialog";
import { Button } from "@/components/ui/button";
import { VibePriceCard } from "@/components/VibePriceCard";
import { CategoryPills } from "@/components/CategoryPills";
import { GameCard } from "@/components/GameCard";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { CreateCharacterDialog } from "@/components/CreateCharacterDialog";
import { NFTDetailDialog } from "@/components/NFTDetailDialog";
import { ChevronRight } from "lucide-react";
import galaxyBg from "@/assets/galaxy-bg.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [selectedNFTId, setSelectedNFTId] = useState<string | null>(null);
  
  const { data: games = [], isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      // Fetch all approved games
      const { data: gamesData, error: gamesError } = await supabase
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
        .eq('status', 'approved');
      
      if (gamesError) throw gamesError;
      if (!gamesData) return [];

      // Fetch like counts for each game
      const gamesWithLikes = await Promise.all(
        gamesData.map(async (game) => {
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('game_id', game.id);
          
          return {
            ...game,
            likeCount: count || 0
          };
        })
      );

      // Sort by like count (descending), then by created_at
      return gamesWithLikes.sort((a, b) => b.likeCount - a.likeCount);
    },
  });

  // Fetch top players based on games created
  const { data: topPlayers = [] } = useQuery({
    queryKey: ['topPlayers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          games:games(count)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch NFTs/Characters
  const { data: nfts = [], isLoading: nftsLoading } = useQuery({
    queryKey: ['nfts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nfts')
        .select('id, name, description, image_url, minted_count, total_supply, price_usd, is_for_sale, games(id, title)')
        .order('created_at', { ascending: false })
        .limit(10);
      
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
        
        <main>
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
                <h2 className="text-3xl font-bold text-foreground">Featured Characters</h2>
                <CreateCharacterDialog />
              </div>
              {nftsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : nfts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No characters yet. Create your first one!</div>
              ) : (
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                  {nfts.map((nft) => (
                    <div 
                      key={nft.id} 
                      onClick={() => setSelectedNFTId(nft.id)}
                      className="flex-shrink-0 w-64 bg-glass/20 backdrop-blur-xl border-2 border-glass-border/20 rounded-xl overflow-hidden hover:bg-glass/30 transition-all group cursor-pointer hover:scale-[1.02]"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img 
                          src={nft.image_url} 
                          alt={nft.name}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        {nft.is_for_sale && nft.price_usd && (
                          <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <span className="text-sm text-primary-foreground font-bold">
                              ${nft.price_usd}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-foreground mb-1 truncate">{nft.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{nft.description || "Character NFT"}</p>
                        {nft.games && (
                          <p className="text-xs text-muted-foreground mt-2 truncate">
                            From: {nft.games.title}
                          </p>
                        )}
                        {nft.total_supply > 1 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {nft.minted_count}/{nft.total_supply} minted
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Top Players Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-foreground">Top Players</h2>
                <ChevronRight className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4">
                {topPlayers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground w-full">No players yet</div>
                ) : (
                  topPlayers.map((player) => (
                    <PlayerAvatar 
                      key={player.id} 
                      name={player.display_name || player.username}
                      avatar={player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        </main>

        {/* NFT Detail Dialog */}
        {selectedNFTId && (
          <NFTDetailDialog
            nftId={selectedNFTId}
            open={!!selectedNFTId}
            onOpenChange={(open) => !open && setSelectedNFTId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
