-- Migration: Add Quest Recurrence System
-- Adds support for daily/weekly/monthly recurring quests

-- Add recurrence columns to quests table
ALTER TABLE quests 
ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20) DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS recurrence_reset_day INTEGER, -- For weekly (1-7) or monthly (1-31)
ADD COLUMN IF NOT EXISTS recurrence_enabled BOOLEAN DEFAULT false;

-- Create quest_progress table for tracking recurring quest completion
CREATE TABLE IF NOT EXISTS quest_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(quest_id, member_id, period_start)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quest_progress_member ON quest_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_quest ON quest_progress(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_period ON quest_progress(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_quest_progress_completed ON quest_progress(completed) WHERE completed = false;

-- Enable RLS
ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own progress"
ON quest_progress FOR SELECT
USING (member_id = auth.uid());

CREATE POLICY "Users can insert own progress"
ON quest_progress FOR INSERT
WITH CHECK (member_id = auth.uid());

CREATE POLICY "Users can update own progress"
ON quest_progress FOR UPDATE
USING (member_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON quest_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON quest_progress TO anon;

-- Add comments
COMMENT ON TABLE quest_progress IS 'Tracks progress for recurring quests per member per period';
COMMENT ON COLUMN quests.recurrence_type IS 'Type of recurrence: none, daily, weekly, monthly';
COMMENT ON COLUMN quests.recurrence_reset_day IS 'Day of week (1-7) for weekly or day of month (1-31) for monthly reset';
COMMENT ON COLUMN quests.recurrence_enabled IS 'Whether this quest is currently recurring';
