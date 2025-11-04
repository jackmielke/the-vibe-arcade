import { useQuery } from "@tanstack/react-query";

const VIBE_CONTRACT = "0x7255ecf1020a95fed5323dd4feb23a54ab1aa7d1";
const GECKO_API = "https://api.geckoterminal.com/api/v2";

interface TokenData {
  data: {
    attributes: {
      token_prices: {
        [key: string]: string;
      };
    };
  };
}

export const VibePriceCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['vibe-price'],
    queryFn: async () => {
      const response = await fetch(
        `${GECKO_API}/simple/networks/base/token_price/${VIBE_CONTRACT}`
      );
      if (!response.ok) throw new Error('Failed to fetch price');
      return response.json() as Promise<TokenData>;
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000,
  });

  const price = data?.data?.attributes?.token_prices?.[VIBE_CONTRACT];
  const displayPrice = price ? parseFloat(price).toFixed(4) : "-.----";

  return (
    <div className="inline-flex items-center gap-3 bg-glass/10 backdrop-blur-xl border border-glass-border/20 rounded-full px-4 py-2 shadow-[var(--glass-glow)] hover:bg-glass/20 transition-all">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">$VIBE</div>
      <div className="text-2xl font-bold text-primary">
        {isLoading ? "..." : `$${displayPrice}`}
      </div>
    </div>
  );
};
