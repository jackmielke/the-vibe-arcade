import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname;

    // Handle POST requests for likes and comments
    if (req.method === 'POST') {
      const body = await req.json();
      
      if (path.endsWith('/like')) {
        const { game_id, anonymous_id } = body;
        
        if (!game_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'game_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if already liked by this anonymous_id
        if (anonymous_id) {
          const { data: existing } = await supabase
            .from('likes')
            .select('id')
            .eq('game_id', game_id)
            .eq('anonymous_id', anonymous_id)
            .maybeSingle();

          if (existing) {
            return new Response(
              JSON.stringify({ success: false, error: 'Already liked' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        const { data, error } = await supabase
          .from('likes')
          .insert({ game_id, anonymous_id })
          .select()
          .single();

        if (error) {
          console.error('Error creating like:', error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (path.endsWith('/comment')) {
        const { game_id, content, anonymous_id } = body;
        
        if (!game_id || !content) {
          return new Response(
            JSON.stringify({ success: false, error: 'game_id and content are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (content.trim().length === 0 || content.length > 1000) {
          return new Response(
            JSON.stringify({ success: false, error: 'Content must be between 1 and 1000 characters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('comments')
          .insert({ game_id, content: content.trim(), anonymous_id })
          .select()
          .single();

        if (error) {
          console.error('Error creating comment:', error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Invalid endpoint' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle GET request for fetching arcade projects
    console.log('Fetching arcade projects...');

    // Fetch all approved arcade projects
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        play_url,
        created_at,
        published_at,
        host_type,
        aspect_ratio,
        price_usd,
        arcade,
        creator_id,
        is_anonymous,
        profiles:creator_id (
          username,
          display_name,
          avatar_url,
          bio,
          website_url
        )
      `)
      .eq('status', 'approved')
      .eq('arcade', true)
      .order('created_at', { ascending: false });

    if (gamesError) {
      console.error('Error fetching games:', gamesError);
      throw gamesError;
    }

    // Fetch likes and comments counts for each game
    const gamesWithStats = await Promise.all(
      (games || []).map(async (game) => {
        const [{ count: likesCount }, { count: commentsCount }] = await Promise.all([
          supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('game_id', game.id),
          supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('game_id', game.id),
        ]);

        return {
          id: game.id,
          title: game.title,
          description: game.description,
          thumbnail_url: game.thumbnail_url,
          play_url: game.play_url,
          created_at: game.created_at,
          published_at: game.published_at,
          host_type: game.host_type,
          aspect_ratio: game.aspect_ratio,
          price_usd: game.price_usd,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          creator: game.is_anonymous ? null : game.profiles,
        };
      })
    );

    console.log(`Successfully fetched ${gamesWithStats.length} arcade projects`);

    return new Response(
      JSON.stringify({
        success: true,
        data: gamesWithStats,
        count: gamesWithStats.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in arcade-api function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
