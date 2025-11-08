import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LONG_API_KEY = "7N1MiAaBNZ0cgEnJjtRHrON4dPC0Evrr";
const AUCTION_TEMPLATE_ID = "fecbd0f1-7a92-4671-9be6-30d5a14571e5";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, title, description, ticker, walletAddress } = await req.json();

    console.log('Starting token launch process for:', ticker);

    // Step 1: Fetch image from URL and upload to IPFS
    console.log('Step 1: Fetching image from URL...');
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();
    
    console.log('Step 1b: Uploading image to IPFS...');
    const imageFormData = new FormData();
    imageFormData.append('image', imageBlob, 'image.png');

    const ipfsImageResponse = await fetch('https://api.long.xyz/v1/ipfs/upload-image', {
      method: 'POST',
      headers: {
        'X-API-KEY': LONG_API_KEY,
      },
      body: imageFormData,
    });

    if (!ipfsImageResponse.ok) {
      const errorText = await ipfsImageResponse.text();
      console.error('Image upload failed:', errorText);
      throw new Error(`Failed to upload image: ${errorText}`);
    }

    const imageData = await ipfsImageResponse.json();
    const imageHash = imageData.result;
    console.log('Image uploaded, hash:', imageHash);

    // Step 2: Upload metadata to IPFS
    console.log('Step 2: Uploading metadata to IPFS...');
    const metadataResponse = await fetch('https://api.long.xyz/v1/ipfs/upload-metadata', {
      method: 'POST',
      headers: {
        'X-API-KEY': LONG_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: title,
        description: description || `Token for ${title}`,
        image_hash: imageHash,
        social_links: [],
        vesting_recipients: [
          {
            address: walletAddress,
            amount: 350000000
          }
        ],
        fee_receiver: walletAddress,
      }),
    });

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error('Metadata upload failed:', errorText);
      throw new Error(`Failed to upload metadata: ${errorText}`);
    }

    const metadataData = await metadataResponse.json();
    const metadataHash = metadataData.result;
    console.log('Metadata uploaded, hash:', metadataHash);

    // Step 3: Encode auction using template
    console.log('Step 3: Encoding auction with template...');
    const auctionResponse = await fetch('https://api.long.xyz/v1/auction-templates?chainId=8453', {
      method: 'POST',
      headers: {
        'X-API-KEY': LONG_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: AUCTION_TEMPLATE_ID,
        metadata: {
          token_name: title,
          token_symbol: ticker,
          token_uri: `ipfs://${metadataHash}`,
          user_address: walletAddress,
          beneficiaries: [
            {
              beneficiary: walletAddress,
              shares: "350000000000000000" // 35% in WAD format
            }
          ]
        }
      }),
    });

    if (!auctionResponse.ok) {
      const errorText = await auctionResponse.text();
      console.error('Auction creation failed:', errorText);
      throw new Error(`Failed to create auction: ${errorText}`);
    }

    const auctionData = await auctionResponse.json();
    console.log('Auction encoded:', auctionData);

    // Extract token address and encoded payload from response
    const tokenAddress = auctionData.result?.token_address;
    const hookAddress = auctionData.result?.hook_address;
    const encodedPayload = auctionData.result?.encoded_payload;

    // Step 4: Deploy the auction to Base blockchain
    console.log('Step 4: Deploying auction to blockchain...');
    const deployResponse = await fetch('https://api.long.xyz/v1/auctions/deploy', {
      method: 'POST',
      headers: {
        'X-API-KEY': LONG_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chain_id: 8453,
        encoded_payload: encodedPayload,
      }),
    });

    if (!deployResponse.ok) {
      const errorText = await deployResponse.text();
      console.error('Deployment failed:', errorText);
      throw new Error(`Failed to deploy auction: ${errorText}`);
    }

    const deployData = await deployResponse.json();
    const txHash = deployData.result?.tx_hash || deployData.result?.transaction_hash;
    console.log('Token deployed, tx hash:', txHash);

    return new Response(
      JSON.stringify({
        success: true,
        token_address: tokenAddress,
        tx_hash: txHash,
        image_hash: imageHash,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in launch-token:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});