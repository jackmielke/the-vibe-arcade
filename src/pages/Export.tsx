import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Export = () => {
  const { data: games = [], isLoading } = useQuery({
    queryKey: ['all-games-export'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('id, title, description, thumbnail_url, play_url, token_address, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleExport = () => {
    if (games.length === 0) {
      toast.error("No games to export");
      return;
    }

    // Create CSV content
    const headers = ['ID', 'Title', 'Description', 'Cover Image URL', 'Play URL', 'Token Address', 'Created At'];
    const csvRows = [
      headers.join(','),
      ...games.map(game => [
        game.id,
        `"${(game.title || '').replace(/"/g, '""')}"`,
        `"${(game.description || '').replace(/"/g, '""')}"`,
        game.thumbnail_url || '',
        game.play_url || '',
        game.token_address || '',
        game.created_at || ''
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `games-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${games.length} games to CSV`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-24">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-black text-primary mb-3">
              Export Games Data
            </h1>
            <p className="text-lg text-foreground/80">
              Download all games data as a CSV file
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading games...
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    {games.length} games ready to export
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Includes title, description, images, and links
                  </p>
                </div>
                <Button 
                  onClick={handleExport}
                  size="lg"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Export;
