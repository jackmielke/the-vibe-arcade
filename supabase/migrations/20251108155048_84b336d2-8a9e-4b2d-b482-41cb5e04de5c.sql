-- Add token-related fields to games table
ALTER TABLE public.games
ADD COLUMN token_address text,
ADD COLUMN token_ticker text,
ADD COLUMN token_tx_hash text,
ADD COLUMN token_launched_at timestamp with time zone;