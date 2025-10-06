import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ethers } from "https://esm.sh/ethers@6.13.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wallet_address, message, signature } = await req.json();

    console.log('MetaMask auth request for wallet:', wallet_address);

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== wallet_address.toLowerCase()) {
      console.error('Signature verification failed');
      throw new Error('Invalid signature');
    }

    console.log('Signature verified successfully');

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user exists with this wallet address
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    let userId;

    if (existingProfile) {
      // User exists, get their auth user
      userId = existingProfile.id;
      console.log('Existing user found:', userId);
    } else {
      // Create new user with wallet address as email
      const email = `${wallet_address.toLowerCase()}@metamask.local`;
      const password = crypto.randomUUID(); // Random password (won't be used)

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          wallet_address: wallet_address.toLowerCase(),
          username: `${wallet_address.substring(0, 6)}...${wallet_address.substring(38)}`,
        }
      });

      if (authError) {
        console.error('Error creating user:', authError);
        throw authError;
      }

      userId = authData.user.id;
      console.log('New user created:', userId);
    }

    // Generate session token
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${wallet_address.toLowerCase()}@metamask.local`,
    });

    if (sessionError) {
      console.error('Error generating session:', sessionError);
      throw sessionError;
    }

    // Create a proper session
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: `${wallet_address.toLowerCase()}@metamask.local`,
      password: wallet_address.toLowerCase(), // Use wallet as temp password
    });

    // If password login fails, update the user's password and try again
    if (error) {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: wallet_address.toLowerCase(),
      });

      const { data: retryData, error: retryError } = await supabaseAdmin.auth.signInWithPassword({
        email: `${wallet_address.toLowerCase()}@metamask.local`,
        password: wallet_address.toLowerCase(),
      });

      if (retryError) {
        console.error('Retry login failed:', retryError);
        throw retryError;
      }

      return new Response(
        JSON.stringify({ session: retryData.session }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ session: data.session }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in metamask-auth function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
