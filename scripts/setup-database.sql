-- ============================================
-- EpiHack Members - Database Schema Extensions
-- ============================================
-- Run this script in Supabase SQL Editor to create new tables
-- for notifications, quests, HTB sync, and points management

-- ============================================
-- 1. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'DUEL_CHALLENGE', 'DUEL_ACCEPTED', 'DUEL_REFUSED', 'DUEL_WON', 'DUEL_LOST', 'HTB_ACHIEVEMENT', 'POINTS_EARNED', 'QUEST_ASSIGNED', 'QUEST_VALIDATED', 'QUEST_REJECTED'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional metadata
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_member_id ON notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = member_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = member_id);

-- ============================================
-- 2. HTB SYNC LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS htb_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL, -- 'manual', 'auto', 'cron'
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'partial'
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for queries
CREATE INDEX IF NOT EXISTS idx_htb_sync_log_member_id ON htb_sync_log(member_id);
CREATE INDEX IF NOT EXISTS idx_htb_sync_log_created_at ON htb_sync_log(created_at DESC);

-- RLS Policies
ALTER TABLE htb_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync logs"
    ON htb_sync_log FOR SELECT
    USING (auth.uid() = member_id);

-- ============================================
-- 3. POINTS RULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS points_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_type VARCHAR(50) UNIQUE NOT NULL, -- 'machine_easy', 'machine_medium', 'machine_hard', 'machine_insane', 'challenge', 'user_blood', 'system_blood'
    points_value INTEGER NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_points_rules_rule_type ON points_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_points_rules_active ON points_rules(active);

-- RLS Policies
ALTER TABLE points_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active points rules"
    ON points_rules FOR SELECT
    USING (active = TRUE);

-- ============================================
-- 4. QUEST CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quest_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#3b82f6', -- Hex color code
    icon VARCHAR(50) DEFAULT '🎯', -- Emoji or lucide icon name
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE quest_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quest categories"
    ON quest_categories FOR SELECT
    USING (true);

-- ============================================
-- 5. QUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    points_reward INTEGER NOT NULL DEFAULT 0,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard', 'insane')),
    category_id UUID REFERENCES quest_categories(id) ON DELETE SET NULL,
    quest_type VARCHAR(20) NOT NULL CHECK (quest_type IN ('manual', 'auto')),
    validation_flag VARCHAR(255), -- For auto quests: HTB machine ID or challenge ID
    deadline TIMESTAMPTZ,
    penalty_percentage INTEGER DEFAULT 20 CHECK (penalty_percentage >= 0 AND penalty_percentage <= 50),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quests_category_id ON quests(category_id);
CREATE INDEX IF NOT EXISTS idx_quests_active ON quests(active);
CREATE INDEX IF NOT EXISTS idx_quests_created_by ON quests(created_by);
CREATE INDEX IF NOT EXISTS idx_quests_deadline ON quests(deadline);

-- RLS Policies
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active quests"
    ON quests FOR SELECT
    USING (active = TRUE);

-- ============================================
-- 6. MEMBER QUESTS TABLE
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
    points_earned INTEGER, -- Actual points earned (with penalty if applicable)
    was_late BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(quest_id, member_id) -- Prevent duplicate assignments (no replay)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_member_quests_quest_id ON member_quests(quest_id);
CREATE INDEX IF NOT EXISTS idx_member_quests_member_id ON member_quests(member_id);
CREATE INDEX IF NOT EXISTS idx_member_quests_status ON member_quests(status);

-- RLS Policies
ALTER TABLE member_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quest assignments"
    ON member_quests FOR SELECT
    USING (auth.uid() = member_id);

CREATE POLICY "Users can update their own quest assignments"
    ON member_quests FOR UPDATE
    USING (auth.uid() = member_id);

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
-- 8. HELPER VIEWS (Optional)
-- ============================================

-- View for unread notifications count per user
CREATE OR REPLACE VIEW unread_notifications_count AS
SELECT 
    member_id,
    COUNT(*) as unread_count
FROM notifications
WHERE read = FALSE
GROUP BY member_id;

-- ============================================
-- SCRIPT COMPLETE
-- ============================================
-- Next step: Run seed-points-rules.sql to populate initial data
