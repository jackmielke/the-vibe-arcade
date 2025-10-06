import { Header } from "@/components/Header";
import { CategoryPills } from "@/components/CategoryPills";
import { GameCard } from "@/components/GameCard";
import galaxyBg from "@/assets/galaxy-bg.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Arcade = () => {
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
        
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-24">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-primary mb-3 tracking-tight">
              ALL GAMES
            </h1>
            <p className="text-lg text-foreground/80">
              Explore our complete collection of games
            </p>
          </div>

          <CategoryPills />

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
