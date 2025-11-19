import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Secret = () => {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  const { data: games = [], isLoading } = useQuery({
    queryKey: ['secret-games-list'],
    queryFn: async () => {
      // Get all games with their like counts
      const { data, error } = await supabase
        .from('games')
        .select('id, title, likes(count)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Sort by like count
      const gamesWithLikes = data.map(game => ({
        id: game.id,
        title: game.title,
        likeCount: game.likes?.[0]?.count || 0
      }));
      
      return gamesWithLikes.sort((a, b) => b.likeCount - a.likeCount);
    },
    enabled: isUnlocked,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === "fun") {
      setIsUnlocked(true);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
          <h1 className="text-2xl font-black text-center">🔒</h1>
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-center"
          />
          <Button type="submit" className="w-full">
            Unlock
          </Button>
        </form>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black mb-6">Games by Popularity</h1>
        <div className="space-y-2">
          {games.map((game, index) => (
            <div key={game.id} className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground w-8">#{index + 1}</span>
              <span className="text-muted-foreground w-12">{game.likeCount} ❤️</span>
              <a 
                href={`/game/${game.id}`}
                className="hover:text-primary underline"
              >
                {game.title}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Secret;
