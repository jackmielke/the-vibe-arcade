-- Create NFTs table
CREATE TABLE public.nfts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  total_supply INTEGER NOT NULL DEFAULT 100,
  minted_count INTEGER NOT NULL DEFAULT 0,
  token_id TEXT,
  metadata JSONB DEFAULT '{}',
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_supply CHECK (minted_count <= total_supply AND minted_count >= 0)
);

-- Create NFT ownership table
CREATE TABLE public.nft_ownership (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nft_id UUID NOT NULL REFERENCES public.nfts(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(nft_id, owner_id)
);

-- Enable RLS
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_ownership ENABLE ROW LEVEL SECURITY;

-- RLS Policies for NFTs
CREATE POLICY "NFTs are viewable by everyone"
  ON public.nfts FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage NFTs"
  ON public.nfts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for NFT Ownership
CREATE POLICY "NFT ownership is viewable by everyone"
  ON public.nft_ownership FOR SELECT
  USING (true);

CREATE POLICY "Users can claim NFTs"
  ON public.nft_ownership FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can manage their own NFTs"
  ON public.nft_ownership FOR DELETE
  USING (auth.uid() = owner_id);

-- Update timestamp trigger for NFTs
CREATE TRIGGER update_nfts_updated_at
  BEFORE UPDATE ON public.nfts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.nfts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nft_ownership;