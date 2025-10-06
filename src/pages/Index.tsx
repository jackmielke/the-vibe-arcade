import { Header } from "@/components/Header";
import { VibePriceCard } from "@/components/VibePriceCard";
import { GameCard } from "@/components/GameCard";
import { Play } from "lucide-react";
import galaxyBg from "@/assets/galaxy-bg.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
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
          status
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen relative pb-24">
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
          {/* Hero Section */}
          <section className="pt-20 pb-12 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-5xl md:text-6xl font-black text-primary tracking-tight">
                  Home
                </h1>
                <VibePriceCard />
              </div>
            </div>
          </section>

          {/* Continue Playing */}
          <section className="px-4 md:px-6 mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Play className="h-6 w-6" />
                Continue Playing
              </h2>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : games.length === 0 ? (
                <div className="bg-glass/20 backdrop-blur-xl border border-glass-border/20 rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground">No games played yet. Explore the arcade!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {games.slice(0, 3).map((game, index) => (
                    <GameCard
                      key={game.id}
                      title={game.title}
                      description={game.description || ""}
                      platforms={["Web"]}
                      image={game.thumbnail_url || `https://images.unsplash.com/photo-${['1511512578047-dfb367046420', '1538481199705-c710c4e965fc', '1579566346927-c68383817a25'][index % 3]}?w=800&auto=format&fit=crop`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Featured Games */}
          <section className="px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">Featured Games</h2>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : games.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No games yet</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {games.map((game, index) => (
                    <GameCard
                      key={game.id}
                      title={game.title}
                      description={game.description || ""}
                      platforms={["Web"]}
                      image={game.thumbnail_url || `https://images.unsplash.com/photo-${['1511512578047-dfb367046420', '1538481199705-c710c4e965fc', '1579566346927-c68383817a25'][index % 3]}?w=800&auto=format&fit=crop`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;
