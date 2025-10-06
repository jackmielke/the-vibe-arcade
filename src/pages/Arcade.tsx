import { Header } from "@/components/Header";
import { CategoryPills } from "@/components/CategoryPills";
import { GameCard } from "@/components/GameCard";
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
          status
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen pb-24">
      <Header />
      
      <main className="pt-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Arcade</h1>
            <p className="text-muted-foreground">Browse all available games</p>
          </div>

          <CategoryPills />

          <section>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : games.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No games yet</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {games.map((game, index) => (
                  <GameCard
                    key={game.id}
                    title={game.title}
                    description={game.description || ""}
                    platforms={["Web"]}
                    image={game.thumbnail_url || `https://images.unsplash.com/photo-${['1511512578047-dfb367046420', '1538481199705-c710c4e965fc', '1579566346927-c68383817a25'][index % 3]}?w=800&auto=format&fit=crop`}
                    rank={index + 1}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Arcade;
