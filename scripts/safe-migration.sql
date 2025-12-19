-- ============================================
-- Migration Script - Safe Update (Preserves Data)
-- ============================================
-- This script adds missing tables and columns WITHOUT deleting existing data

-- ============================================
-- 1. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_member_id ON notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can view their own notifications'
    ) THEN
        CREATE POLICY "Users can view their own notifications"
            ON notifications FOR SELECT
            USING (auth.uid() = member_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can update their own notifications'
    ) THEN
        CREATE POLICY "Users can update their own notifications"
            ON notifications FOR UPDATE
            USING (auth.uid() = member_id);
    END IF;
END $$;

-- ============================================
-- 2. HTB SYNC LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS htb_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_htb_sync_log_member_id ON htb_sync_log(member_id);
CREATE INDEX IF NOT EXISTS idx_htb_sync_log_created_at ON htb_sync_log(created_at DESC);

ALTER TABLE htb_sync_log ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'htb_sync_log' 
        AND policyname = 'Users can view their own sync logs'
    ) THEN
        CREATE POLICY "Users can view their own sync logs"
            ON htb_sync_log FOR SELECT
            USING (auth.uid() = member_id);
    END IF;
END $$;

-- ============================================
-- 3. POINTS RULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS points_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_type VARCHAR(50) UNIQUE NOT NULL,
    points_value INTEGER NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_rules_rule_type ON points_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_points_rules_active ON points_rules(active);

ALTER TABLE points_rules ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'points_rules' 
        AND policyname = 'Anyone can view active points rules'
    ) THEN
        CREATE POLICY "Anyone can view active points rules"
            ON points_rules FOR SELECT
            USING (active = TRUE);
    END IF;
END $$;

-- ============================================
-- 4. QUEST CATEGORIES TABLE (Must exist before quests)
-- ============================================
CREATE TABLE IF NOT EXISTS quest_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
    icon VARCHAR(50) DEFAULT '🎯',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quest_categories ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quest_categories' 
        AND policyname = 'Anyone can view quest categories'
    ) THEN
        CREATE POLICY "Anyone can view quest categories"
            ON quest_categories FOR SELECT
            USING (true);
    END IF;
END $$;

-- ============================================
-- 5. ADD MISSING COLUMNS TO EXISTING QUESTS TABLE
-- ============================================
-- Add category_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quests' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE quests ADD COLUMN category_id UUID REFERENCES quest_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add penalty_percentage column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quests' AND column_name = 'penalty_percentage'
    ) THEN
        ALTER TABLE quests ADD COLUMN penalty_percentage INTEGER DEFAULT 20 CHECK (penalty_percentage >= 0 AND penalty_percentage <= 50);
    END IF;
END $$;

-- Add active column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quests' AND column_name = 'active'
    ) THEN
        ALTER TABLE quests ADD COLUMN active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Add created_by column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quests' AND column_name = 'created_by'
    ) THEN
        -- We can't add NOT NULL with a reference to auth.users easily
        -- So we add it as nullable first, then you can update later if needed
        ALTER TABLE quests ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add deadline column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quests' AND column_name = 'deadline'
    ) THEN
        ALTER TABLE quests ADD COLUMN deadline TIMESTAMPTZ;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_quests_category_id ON quests(category_id);
CREATE INDEX IF NOT EXISTS idx_quests_active ON quests(active);
CREATE INDEX IF NOT EXISTS idx_quests_created_by ON quests(created_by);
CREATE INDEX IF NOT EXISTS idx_quests_deadline ON quests(deadline);

-- ============================================
-- 6. CREATE OR UPDATE MEMBER QUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS member_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'failed', 'late')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    submission_data JSONB DEFAULT '{}',
    points_earned INTEGER,
    was_late BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(quest_id, member_id)
);

-- Add missing columns to member_quests if table already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'member_quests' AND column_name = 'points_earned'
    ) THEN
        ALTER TABLE member_quests ADD COLUMN points_earned INTEGER;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'member_quests' AND column_name = 'was_late'
    ) THEN
        ALTER TABLE member_quests ADD COLUMN was_late BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_member_quests_quest_id ON member_quests(quest_id);
CREATE INDEX IF NOT EXISTS idx_member_quests_member_id ON member_quests(member_id);
CREATE INDEX IF NOT EXISTS idx_member_quests_status ON member_quests(status);

ALTER TABLE member_quests ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'member_quests' 
        AND policyname = 'Users can view their own quest assignments'
    ) THEN
        CREATE POLICY "Users can view their own quest assignments"
            ON member_quests FOR SELECT
            USING (auth.uid() = member_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'member_quests' 
        AND policyname = 'Users can update their own quest assignments'
    ) THEN
        CREATE POLICY "Users can update their own quest assignments"
            ON member_quests FOR UPDATE
            USING (auth.uid() = member_id);
    END IF;
END $$;

-- ============================================
-- 7. POSTGRESQL FUNCTIONS
-- ============================================

-- Function to resolve a duel (atomic transaction)
CREATE OR REPLACE FUNCTION resolve_duel(
    p_duel_id UUID,
    p_winner_id UUID,
    p_total_stake INTEGER
) RETURNS VOID AS $$
BEGIN
    -- Update duel status
    UPDATE duels
    SET status = 'completed',
        winner_id = p_winner_id,
        completed_at = NOW()
    WHERE id = p_duel_id;

    -- Award points to winner
    INSERT INTO points_transactions (member_id, points, source, description)
    VALUES (p_winner_id, p_total_stake, 'duel_win', 'Won duel #' || p_duel_id);

    -- Update winner's balance
    UPDATE member_points_balance
    SET total_points = total_points + p_total_stake
    WHERE member_id = p_winner_id;
END;
$$ LANGUAGE plpgsql;

-- Function to complete a quest with points attribution
CREATE OR REPLACE FUNCTION complete_quest(
    p_member_quest_id UUID,
    p_points_earned INTEGER
) RETURNS VOID AS $$
DECLARE
    v_member_id UUID;
    v_quest_id UUID;
BEGIN
    -- Get member and quest IDs
    SELECT member_id, quest_id INTO v_member_id, v_quest_id
    FROM member_quests
    WHERE id = p_member_quest_id;

    -- Update member quest
    UPDATE member_quests
    SET status = 'completed',
        completed_at = NOW(),
        points_earned = p_points_earned
    WHERE id = p_member_quest_id;

    -- Award points
    INSERT INTO points_transactions (member_id, points, source, description)
    VALUES (v_member_id, p_points_earned, 'quest_completion', 'Completed quest #' || v_quest_id);

    -- Update balance
    UPDATE member_points_balance
    SET total_points = total_points + p_points_earned
    WHERE member_id = v_member_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. HELPER VIEWS
-- ============================================

-- Drop and recreate view to ensure it's up to date
DROP VIEW IF EXISTS unread_notifications_count;
CREATE VIEW unread_notifications_count AS
SELECT 
    member_id,
    COUNT(*) as unread_count
FROM notifications
WHERE read = FALSE
GROUP BY member_id;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next step: Run seed-points-rules.sql to populate initial data
