import { useQuery } from "@tanstack/react-query";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const VIBE_CONTRACT = "0x7255ecf1020a95fed5323dd4feb23a54ab1aa7d1";
const GECKO_API = "https://api.geckoterminal.com/api/v2";

interface TokenData {
  data: {
    attributes: {
      name: string;
      symbol: string;
      price_usd: string;
      market_cap_usd: string;
      fdv_usd: string;
      total_supply: string;
      price_change_percentage: {
        h24: string;
      };
      volume_usd: {
        h24: string;
      };
    };
  };
}

const formatNumber = (num: string | number) => {
  const value = typeof num === 'string' ? parseFloat(num) : num;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

export const VibePriceCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['vibe-token'],
    queryFn: async () => {
      const response = await fetch(
        `${GECKO_API}/networks/base/tokens/${VIBE_CONTRACT}`
      );
      if (!response.ok) throw new Error('Failed to fetch token data');
      return response.json() as Promise<TokenData>;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const tokenData = data?.data?.attributes;
  const marketCap = tokenData?.market_cap_usd;
  const priceChange = tokenData?.price_change_percentage?.h24;
  const displayMarketCap = marketCap ? formatNumber(marketCap) : "-.--";
  const displayPriceChange = priceChange ? parseFloat(priceChange).toFixed(2) : "0.00";
  const isPositive = priceChange && parseFloat(priceChange) >= 0;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="inline-flex items-center gap-3 bg-glass/10 backdrop-blur-xl border border-glass-border/20 rounded-full px-4 py-2 shadow-[var(--glass-glow)] hover:bg-glass/20 transition-all cursor-pointer">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">$VIBE</div>
          <div className="text-2xl font-bold text-primary">
            {isLoading ? "..." : displayMarketCap}
          </div>
          <div className={`text-xs font-medium ${isPositive ? 'text-accent' : 'text-destructive'}`}>
            {isLoading ? "..." : `${isPositive ? '+' : ''}${displayPriceChange}%`}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-glass/95 backdrop-blur-xl border-glass-border/40">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Token Metrics</h4>
          </div>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : tokenData ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium text-foreground">
                  ${parseFloat(tokenData.price_usd).toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market Cap:</span>
                <span className="font-medium text-foreground">{formatNumber(tokenData.market_cap_usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">24h Volume:</span>
                <span className="font-medium text-foreground">
                  {formatNumber(tokenData.volume_usd?.h24 || "0")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">FDV:</span>
                <span className="font-medium text-foreground">{formatNumber(tokenData.fdv_usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Supply:</span>
                <span className="font-medium text-foreground">
                  {parseFloat(tokenData.total_supply).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No data available</div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
