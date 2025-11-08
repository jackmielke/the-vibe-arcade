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
    imageFormData.append('file', imageBlob, 'image.png');

    const ipfsImageResponse = await fetch('https://api.long.xyz/ipfs/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LONG_API_KEY}`,
      },
      body: imageFormData,
    });

    if (!ipfsImageResponse.ok) {
      const errorText = await ipfsImageResponse.text();
      console.error('Image upload failed:', errorText);
      throw new Error(`Failed to upload image: ${errorText}`);
    }

    const imageData = await ipfsImageResponse.json();
    const imageHash = imageData.hash;
    console.log('Image uploaded, hash:', imageHash);

    // Step 2: Upload metadata to IPFS
    console.log('Step 2: Uploading metadata to IPFS...');
    const metadataResponse = await fetch('https://api.long.xyz/ipfs/upload-metadata', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LONG_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: title,
        description: description || `Token for ${title}`,
        image: imageHash,
        symbol: ticker,
      }),
    });

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error('Metadata upload failed:', errorText);
      throw new Error(`Failed to upload metadata: ${errorText}`);
    }

    const metadataData = await metadataResponse.json();
    console.log('Metadata uploaded:', metadataData);

    // Step 3: Encode auction template
    console.log('Step 3: Encoding auction template...');
    const encodeResponse = await fetch('https://api.long.xyz/auction-templates/encode', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LONG_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auction_template_id: AUCTION_TEMPLATE_ID,
        token_name: title,
        token_symbol: ticker,
        token_uri: metadataData.hash,
        beneficiaries: [
          {
            shares: "350000000000000000",
            beneficiary: walletAddress
          }
        ],
        debug: true,
      }),
    });

    if (!encodeResponse.ok) {
      const errorText = await encodeResponse.text();
      console.error('Encode failed:', errorText);
      throw new Error(`Failed to encode template: ${errorText}`);
    }

    const encodeData = await encodeResponse.json();
    const tokenAddress = encodeData.token_address;
    console.log('Template encoded, token address:', tokenAddress);

    // Step 4: Broadcast transaction
    console.log('Step 4: Broadcasting transaction...');
    const broadcastResponse = await fetch('https://api.long.xyz/auction-templates/broadcast', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LONG_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encoded_payload: encodeData.encoded_payload,
      }),
    });

    if (!broadcastResponse.ok) {
      const errorText = await broadcastResponse.text();
      console.error('Broadcast failed:', errorText);
      throw new Error(`Failed to broadcast transaction: ${errorText}`);
    }

    const broadcastData = await broadcastResponse.json();
    console.log('Transaction broadcasted:', broadcastData);

    return new Response(
      JSON.stringify({
        success: true,
        token_address: tokenAddress,
        tx_hash: broadcastData.tx_hash,
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