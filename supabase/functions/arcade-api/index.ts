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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
