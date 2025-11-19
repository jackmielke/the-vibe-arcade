import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { SubmitGameDialog } from "@/components/SubmitGameDialog";

const Secret = () => {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const queryClient = useQueryClient();

  const { data: games = [], isLoading } = useQuery({
    queryKey: ['secret-games-list'],
    queryFn: async () => {
      // Get all games with their like counts, play_url, and arcade status
      const { data, error } = await supabase
        .from('games')
        .select('id, title, play_url, arcade, likes(count)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Sort by like count
      const gamesWithLikes = data.map(game => ({
        id: game.id,
        title: game.title,
        play_url: game.play_url,
        arcade: game.arcade,
        likeCount: game.likes?.[0]?.count || 0
      }));
      
      return gamesWithLikes.sort((a, b) => b.likeCount - a.likeCount);
    },
    enabled: isUnlocked,
  });

  const handleEdit = (gameId: string, currentUrl: string) => {
    setEditingId(gameId);
    setEditUrl(currentUrl);
  };

  const handleSave = async (gameId: string) => {
    const { error } = await supabase
      .from('games')
      .update({ play_url: editUrl })
      .eq('id', gameId);

    if (error) {
      toast.error("Failed to update link");
      return;
    }

    toast.success("Link updated");
    setEditingId(null);
    queryClient.invalidateQueries({ queryKey: ['secret-games-list'] });
  };

  const handleToggleArcade = async (gameId: string, currentArcade: boolean) => {
    const { error } = await supabase
      .from('games')
      .update({ arcade: !currentArcade })
      .eq('id', gameId);

    if (error) {
      toast.error("Failed to update arcade status");
      return;
    }

    toast.success(currentArcade ? "Removed from arcade" : "Added to arcade");
    queryClient.invalidateQueries({ queryKey: ['secret-games-list'] });
  };

  const handleDelete = async (gameId: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', gameId);

    if (error) {
      toast.error("Failed to delete game");
      return;
    }

    toast.success("Game deleted");
    queryClient.invalidateQueries({ queryKey: ['secret-games-list'] });
  };

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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Projects by Popularity</h1>
          <SubmitGameDialog defaultArcade={false}>
            <Button variant="default" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Game
            </Button>
          </SubmitGameDialog>
        </div>
        <div className="space-y-3">
          {games.map((game, index) => (
            <div key={game.id} className="flex items-center gap-3 text-sm border border-border rounded-lg p-3">
              <span className="text-muted-foreground w-8">#{index + 1}</span>
              <span className="text-muted-foreground w-12">{game.likeCount} ❤️</span>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={game.arcade}
                  onCheckedChange={() => handleToggleArcade(game.id, game.arcade)}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {game.arcade ? "Arcade" : "Portfolio"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium mb-1">{game.title}</div>
                {editingId === game.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="text-xs h-8"
                      placeholder="Game URL"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSave(game.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <a 
                    href={game.play_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary underline truncate block"
                  >
                    {game.play_url}
                  </a>
                )}
              </div>
              {editingId !== game.id && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(game.id, game.play_url)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(game.id, game.title)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Secret;
