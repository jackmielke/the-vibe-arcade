import { useQuery } from "@tanstack/react-query";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ExternalLink } from "lucide-react";

const VIBE_CONTRACT = "0x7255ecf1020a95fed5323dd4feb23a54ab1aa7d1";
const GECKO_API = "https://api.geckoterminal.com/api/v2";
const VIBE_LINK = "https://app.long.xyz/tokens/0x7255ecf1020a95fed5323dd4feb23a54ab1aa7d1?graph=graduated";

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

const formatNumber = (num: string | number | null | undefined) => {
  if (!num || num === null || num === undefined) return "-.--";
  const value = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(value)) return "-.--";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

const formatSupply = (num: string | null | undefined) => {
  if (!num) return "-.--";
  const value = parseFloat(num);
  if (isNaN(value)) return "-.--";
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
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
  const fdv = tokenData?.fdv_usd;
  const displayFdv = fdv ? formatNumber(fdv) : "-.--";

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="inline-flex items-center gap-3 bg-glass/10 backdrop-blur-xl border border-glass-border/20 rounded-full px-4 py-2 shadow-[var(--glass-glow)] hover:bg-glass/20 transition-all cursor-pointer">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">$VIBE</div>
          <div className="text-2xl font-bold text-primary">
            {isLoading ? "..." : displayFdv}
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
                  {formatNumber(tokenData.total_supply)}
                </span>
              </div>
              <div className="pt-2 border-t border-glass-border/20">
                <a
                  href={VIBE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  View on LONG
                  <ExternalLink className="h-3 w-3" />
                </a>
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
