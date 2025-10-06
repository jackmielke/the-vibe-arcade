import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Code } from "lucide-react";
import galaxyBg from "@/assets/galaxy-bg.jpg";

const Game = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          game_categories(
            categories(name, slug)
          ),
          game_tags(
            tags(name, slug)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Game not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

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
        
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-24">
          <Button 
            variant="ghost" 
            className="mb-6 gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>

          <div className="space-y-6">
            {/* Game Header */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-primary">
                {game.title}
              </h1>
              
              {game.description && (
                <p className="text-lg text-foreground/80">
                  {game.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {game.game_categories?.map((gc: any) => (
                  <Badge key={gc.categories.slug} variant="secondary">
                    {gc.categories.name}
                  </Badge>
                ))}
                {game.game_tags?.map((gt: any) => (
                  <Badge key={gt.tags.slug} variant="outline">
                    {gt.tags.name}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="arcade" 
                  size="lg"
                  className="gap-2"
                  onClick={() => window.open(game.play_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Play Game
                </Button>
                
                {game.codebase_url && (
                  <Button 
                    variant="glass" 
                    size="lg"
                    className="gap-2"
                    onClick={() => window.open(game.codebase_url, '_blank')}
                  >
                    <Code className="h-4 w-4" />
                    View Code
                  </Button>
                )}
              </div>
            </div>

            {/* Game Preview */}
            {game.thumbnail_url && (
              <div className="aspect-video bg-glass/20 backdrop-blur-xl border-2 border-glass-border/20 rounded-xl overflow-hidden">
                <img 
                  src={game.thumbnail_url} 
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Game Embed (if iframe) */}
            {game.host_type === 'iframe' && (
              <div className="aspect-video bg-glass/20 backdrop-blur-xl border-2 border-glass-border/20 rounded-xl overflow-hidden">
                <iframe
                  src={game.play_url}
                  className="w-full h-full"
                  title={game.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Game;
