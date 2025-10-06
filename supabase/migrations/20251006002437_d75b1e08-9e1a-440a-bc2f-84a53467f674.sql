-- Seed demo game data

-- Insert categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('Vibe Coding', 'vibe-coding', 'Games built with vibe coding'),
  ('Vibe Gaming', 'vibe-gaming', 'Vibe gaming experiences'),
  ('Game', 'game', 'General games'),
  ('Math', 'math', 'Math-focused games'),
  ('Science', 'science', 'Science games'),
  ('Chemistry', 'chemistry', 'Chemistry games'),
  ('AI', 'ai', 'AI-powered experiences'),
  ('Collective Intelligence', 'collective-intelligence', 'Collective intelligence projects'),
  ('Social Experiments', 'social-experiments', 'Social experiment games'),
  ('VR', 'vr', 'Virtual Reality experiences'),
  ('Web', 'web', 'Web-based games');

-- Temporarily make creator_id nullable for system games
ALTER TABLE public.games ALTER COLUMN creator_id DROP NOT NULL;

-- Temporarily disable RLS to insert system-level demo games
ALTER TABLE public.games DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_categories DISABLE ROW LEVEL SECURITY;

-- Insert demo games without a creator (system-level content)
INSERT INTO public.games (id, title, description, play_url, host_type, status, published_at) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'CheMath Lab ⭐',
    'Blending science and math for fun (by the best 6 y/o vibe coder out there 😉). Contributors: Yosemite and Jack',
    'https://chemathlab-yozjackreamix.replit.app',
    'external',
    'approved',
    now()
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Fox Adventure',
    'Go on an adventure as a fox! Contributors: Patrick, Petra',
    'https://fox-adventure.replit.app/',
    'external',
    'approved',
    now()
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '3D Monster Escape',
    'Escape the zombies!! Contributors: Kids, Patrick',
    'https://monster-escape-3d.replit.app/',
    'external',
    'approved',
    now()
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'Edge Explorer',
    'A 3D Edge Esmeralda world with many characters…. Contributors: Jack',
    'https://edge-exploring.replit.app/',
    'external',
    'approved',
    now()
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'Popcorn Clicker',
    'Like Cookie Clicker but more fun and with popcorn! See how long you can make it.... Contributors: Michael and Billy',
    'https://popcorn-clicker-michael-and-billy.replit.app/',
    'external',
    'approved',
    now()
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    'Edge Explorer (original)',
    'A 3D Edge Esmeralda game where you can choose different characters, play as Eddie, talk on a community terminal, and take your jetpack around the virtual world. Contributors: Jack Mielke',
    'https://edge-explorer.replit.app/',
    'external',
    'approved',
    now()
  ),
  (
    'a7777777-7777-7777-7777-777777777777',
    'Edge Explorer (VR version)',
    'Edge Esmeralda, but in a 3D VR world and with jetpacks ;) Contributors: Jack, Billy, and Yoz',
    'https://edge-explorer.replit.app/',
    'external',
    'approved',
    now()
  );

-- Link games to categories
INSERT INTO public.game_categories (game_id, category_id)
SELECT g.id, c.id FROM public.games g, public.categories c
WHERE g.title = 'CheMath Lab ⭐' AND c.slug IN ('vibe-coding', 'vibe-gaming', 'game', 'math', 'science', 'chemistry')
UNION ALL
SELECT g.id, c.id FROM public.games g, public.categories c
WHERE g.title = 'Fox Adventure' AND c.slug IN ('vibe-gaming', 'vibe-coding')
UNION ALL
SELECT g.id, c.id FROM public.games g, public.categories c
WHERE g.title = '3D Monster Escape' AND c.slug = 'vibe-gaming'
UNION ALL
SELECT g.id, c.id FROM public.games g, public.categories c
WHERE g.title = 'Edge Explorer' AND c.slug IN ('ai', 'collective-intelligence', 'game', 'social-experiments', 'vibe-coding', 'vr', 'web', 'vibe-gaming')
UNION ALL
SELECT g.id, c.id FROM public.games g, public.categories c
WHERE g.title = 'Popcorn Clicker' AND c.slug IN ('game', 'web')
UNION ALL
SELECT g.id, c.id FROM public.games g, public.categories c
WHERE g.title = 'Edge Explorer (original)' AND c.slug IN ('ai', 'collective-intelligence')
UNION ALL
SELECT g.id, c.id FROM public.games g, public.categories c
WHERE g.title = 'Edge Explorer (VR version)' AND c.slug IN ('ai', 'collective-intelligence');

-- Re-enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_categories ENABLE ROW LEVEL SECURITY;