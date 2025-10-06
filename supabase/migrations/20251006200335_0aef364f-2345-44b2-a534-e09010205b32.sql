-- Delete the duplicate game that doesn't have a creator_id
DELETE FROM games WHERE id = 'acbd8e81-7ecc-4073-940c-3a541795e799';

-- Add Mobile category if it doesn't exist
INSERT INTO categories (name, slug)
VALUES ('Mobile', 'mobile')
ON CONFLICT (slug) DO NOTHING;