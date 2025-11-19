import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import galaxyBg from "@/assets/galaxy-bg.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Arcade = () => {
  const [sortBy, setSortBy] = useState<'top' | 'recent'>('top');

  const { data: games = [], isLoading } = useQuery({
    queryKey: ['arcade-games', sortBy],
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
          created_at,
          profiles(username, avatar_url)
        `)
        .eq('status', 'approved')
        .eq('arcade', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch like counts and comment counts for all games in parallel
      const gamesWithCounts = await Promise.all(
        (data || []).map(async (game) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase.from('likes').select('*', { count: 'exact', head: true }).eq('game_id', game.id),
            supabase.from('comments').select('*', { count: 'exact', head: true }).eq('game_id', game.id),
          ]);
          
          return {
            ...game,
            likeCount: likesResult.count || 0,
            commentCount: commentsResult.count || 0,
          };
        })
      );

      // Sort based on selected sort type
      if (sortBy === 'top') {
        return gamesWithCounts.sort((a, b) => b.likeCount - a.likeCount);
      } else {
        // Sort by created_at (most recent first)
        return gamesWithCounts.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
      }
    },
  });

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
        <div className="absolute inset-0 bg-background/40" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-24">
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-primary mb-3 tracking-tight">
                  ALL GAMES
                </h1>
                <p className="text-lg text-foreground/80">
                  Explore our complete collection of games
                </p>
              </div>

              {/* Sort Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSortBy('top')}
                  className={`
                    px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                    ${sortBy === 'top'
                      ? 'bg-foreground/10 text-foreground' 
                      : 'bg-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                    }
                  `}
                >
                  Top Games
                </button>
                <button
                  onClick={() => setSortBy('recent')}
                  className={`
                    px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                    ${sortBy === 'recent'
                      ? 'bg-foreground/10 text-foreground' 
                      : 'bg-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                    }
                  `}
                >
                  Most Recent
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading...</div>
          ) : games.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No games yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {games.map((game, index) => (
                <GameCard
                  key={game.id}
                  id={game.id}
                  title={game.title}
                  description={game.description || ""}
                  platforms={["Web"]}
                  image={game.thumbnail_url || `https://images.unsplash.com/photo-${['1511512578047-dfb367046420', '1538481199705-c710c4e965fc', '1579566346927-c68383817a25'][index % 3]}?w=800&auto=format&fit=crop`}
                  creatorProfile={game.profiles}
                  isAnonymous={game.is_anonymous}
                  likeCount={game.likeCount}
                  commentCount={game.commentCount}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Arcade;
