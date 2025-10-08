-- Add marketplace fields to NFTs table
ALTER TABLE public.nfts
ADD COLUMN IF NOT EXISTS price_usd NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS is_for_sale BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.nfts.price_usd IS 'Price in USD if the NFT is for sale';
COMMENT ON COLUMN public.nfts.is_for_sale IS 'Whether this NFT is currently listed for sale';