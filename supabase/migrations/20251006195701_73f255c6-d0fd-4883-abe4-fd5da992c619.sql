-- Update all existing games to approved status
UPDATE games SET status = 'approved' WHERE status = 'pending';

-- Change the default status for new games to approved
ALTER TABLE games ALTER COLUMN status SET DEFAULT 'approved';