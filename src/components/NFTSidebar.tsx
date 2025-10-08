import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NFTItem {
  id: string;
  name: string;
  image_url: string;
  minted_count: number;
  total_supply: number;
}

export const NFTSidebar = () => {
  const { data: nfts, isLoading } = useQuery({
    queryKey: ["nfts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nfts")
        .select("id, name, image_url, minted_count, total_supply")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as NFTItem[];
    },
  });

  return (
    <aside className="hidden lg:block fixed right-6 top-32 space-y-6">
      <div className="bg-glass/10 backdrop-blur-md border border-glass-border/20 rounded-2xl p-6 shadow-glow">
        <h3 className="text-xl font-bold text-foreground mb-4 text-center">NFT Collection</h3>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground">Loading...</div>
          ) : nfts && nfts.length > 0 ? (
            nfts.map((nft) => (
              <div
                key={nft.id}
                className="relative w-24 h-24 rounded-2xl bg-glass/10 border border-glass-border/20 overflow-hidden hover:scale-110 transition-all shadow-glow cursor-pointer group"
              >
                <img 
                  src={nft.image_url} 
                  alt={nft.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-xs text-white text-center px-2">
                    <p className="font-bold truncate">{nft.name}</p>
                    <p className="text-[10px]">{nft.minted_count}/{nft.total_supply}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground">No NFTs yet</div>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">Hover to see details</p>
      </div>
    </aside>
  );
};
