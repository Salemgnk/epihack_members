-- Migration: Create Ranks System
-- Ranks: Bronze → Argent → Or → Platine → Diamant → Orichalque

-- Create ranks table
CREATE TABLE IF NOT EXISTS ranks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add rank to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_rank_id UUID REFERENCES ranks(id);

-- Insert default ranks
INSERT INTO ranks (name, display_name, points_required, color, order_index) VALUES
('bronze', 'Bronze', 0, '#CD7F32', 1),
('argent', 'Argent', 100, '#C0C0C0', 2),
('or', 'Or', 250, '#FFD700', 3),
('platine', 'Platine', 500, '#E5E4E2', 4),
('diamant', 'Diamant', 1000, '#B9F2FF', 5),
('orichalque', 'Orichalque', 2000, '#9FEF00', 6);

-- Set all existing users to Bronze rank
UPDATE profiles 
SET current_rank_id = (SELECT id FROM ranks WHERE name = 'bronze')
WHERE current_rank_id IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_ranks_points ON ranks(points_required DESC);

-- Create titles table for special bonuses
CREATE TABLE IF NOT EXISTS titles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#9FEF00',
  icon TEXT,
  is_special BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link titles to users (many-to-many)
CREATE TABLE IF NOT EXISTS user_titles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, title_id)
);

-- Insert some special titles
INSERT INTO titles (name, display_name, description, color) VALUES
('first_blood', 'First Blood', 'First to pwn a new HTB machine', '#FF0000'),
('speed_demon', 'Speed Demon', 'Completed 10 challenges in 24h', '#FF6B00'),
('night_owl', 'Night Owl', 'Most active between 00:00-06:00', '#4B0082'),
('helping_hand', 'Helping Hand', 'Helped 5+ members in forum', '#00CED1'),
('perfect_week', 'Perfect Week', '7 days login streak', '#FFD700');

-- RLS Policies
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_titles ENABLE ROW LEVEL SECURITY;

-- Everyone can read ranks
CREATE POLICY "Anyone can view ranks"
ON ranks FOR SELECT
USING (true);

-- Everyone can read titles
CREATE POLICY "Anyone can view titles"
ON titles FOR SELECT
USING (true);

-- Users can view their own titles
CREATE POLICY "Users can view their titles"
ON user_titles FOR SELECT
USING (auth.uid() = user_id);

-- TODO: Add admin policies once is_super_admin column exists
-- For now, admins can manage via Supabase Dashboard

-- Comment
COMMENT ON TABLE ranks IS 'Progressive ranking system based on points: Bronze → Argent → Or → Platine → Diamant → Orichalque';
COMMENT ON TABLE titles IS 'Special achievement titles that users can earn (bonus rewards)';
COMMENT ON TABLE user_titles IS 'Links users to their earned special titles';
