import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface NFTDetailDialogProps {
  nftId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NFTWithRelations {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  total_supply: number;
  minted_count: number;
  price_usd: number | null;
  is_for_sale: boolean;
  games?: {
    id: string;
    title: string;
    thumbnail_url: string | null;
  } | null;
  profiles?: {
    username: string;
    avatar_url: string | null;
  } | null;
}

export const NFTDetailDialog = ({ nftId, open, onOpenChange }: NFTDetailDialogProps) => {
  const navigate = useNavigate();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const { data: nft, isLoading } = useQuery<NFTWithRelations>({
    queryKey: ["nft-detail", nftId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nfts")
        .select(`
          *,
          games(id, title, thumbnail_url)
        `)
        .eq("id", nftId)
        .single();

      if (error) throw error;
      
      // Fetch creator profile separately
      if (data?.creator_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", data.creator_id)
          .maybeSingle();
        
        return { ...data, profiles: profile };
      }
      
      return data;
    },
    enabled: open && !!nftId,
  });

  const handlePurchase = async () => {
    setIsPurchasing(true);
    // Demo purchase flow
    setTimeout(() => {
      toast.success("Purchase successful! (Demo)", {
        description: "In production, this would process payment via Stripe",
      });
      setIsPurchasing(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-glass/95 backdrop-blur-xl border-glass-border/30">
          <div className="text-center py-8">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!nft) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-glass/95 backdrop-blur-xl border-glass-border/30">
        <DialogHeader>
          <DialogTitle className="text-2xl">{nft.name}</DialogTitle>
          <DialogDescription>
            {nft.is_for_sale ? "Character NFT available for purchase" : "Character NFT - Not currently for sale"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-glass/10">
            <img
              src={nft.image_url}
              alt={nft.name}
              className="w-full h-full object-cover"
            />
            {nft.total_supply > 1 && (
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-sm text-white font-medium">
                  {nft.minted_count}/{nft.total_supply}
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Price */}
            {nft.is_for_sale && nft.price_usd && (
              <div className="bg-glass/20 backdrop-blur-xl border border-glass-border/20 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-3xl font-bold text-primary">${nft.price_usd}</p>
              </div>
            )}

            {/* Description */}
            {nft.description && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Description</p>
                <p className="text-sm text-muted-foreground">{nft.description}</p>
              </div>
            )}

            {/* Associated Game */}
            {nft.games && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Associated Game</p>
                <button
                  onClick={() => {
                    navigate(`/game/${nft.games.id}`);
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-3 p-3 bg-glass/10 hover:bg-glass/20 border border-glass-border/20 rounded-lg transition-all w-full group"
                >
                  {nft.games.thumbnail_url && (
                    <img
                      src={nft.games.thumbnail_url}
                      alt={nft.games.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{nft.games.title}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </div>
            )}

            {/* Creator */}
            {nft.profiles && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Creator</p>
                <div className="flex items-center gap-2">
                  <img
                    src={nft.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nft.profiles.username}`}
                    alt={nft.profiles.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-muted-foreground">@{nft.profiles.username}</span>
                </div>
              </div>
            )}

            {/* Status Badge */}
            <Badge variant={nft.is_for_sale ? "default" : "secondary"}>
              {nft.is_for_sale ? "For Sale" : "Not For Sale"}
            </Badge>

            {/* Buy Button */}
            {nft.is_for_sale && (
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing}
                size="lg"
                className="w-full gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {isPurchasing ? "Processing..." : `Buy for $${nft.price_usd}`}
              </Button>
            )}

            {/* Demo Note */}
            <p className="text-xs text-muted-foreground text-center">
              {nft.is_for_sale 
                ? "🎮 Demo mode - Real NFT payments coming soon via Stripe" 
                : "This character NFT is not currently listed for sale"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
