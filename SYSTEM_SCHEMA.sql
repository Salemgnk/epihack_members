-- 🎮 SYSTEM UPDATE: SCHEMA MIGRATION 🎮
-- Run this in Supabase SQL Editor

-- 1. Update PROFILES table with RPG stats
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{"STR": 10, "AGI": 10, "INT": 10, "VIT": 10, "SENSE": 10}',
ADD COLUMN IF NOT EXISTS job_class TEXT DEFAULT 'Novice',
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'The Awakened One',
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mana INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS max_mana INTEGER DEFAULT 100;

-- 2. Create SKILLS table
CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    rank TEXT CHECK (rank IN ('S', 'A', 'B', 'C', 'D', 'E', 'F')),
    type TEXT CHECK (type IN ('ACTIVE', 'PASSIVE')),
    icon TEXT, -- Lucide icon name or image URL
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create USER_SKILLS (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    proficiency INTEGER DEFAULT 0, -- 0-100% to next level
    equipped BOOLEAN DEFAULT false,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- 4. Create QUESTS (Scenarios) table
CREATE TABLE IF NOT EXISTS quests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('MAIN', 'SUB', 'HIDDEN', 'Daily')),
    rank TEXT,
    rewards JSONB, -- {"points": 100, "items": [], "exp": 500}
    requirements JSONB, -- {"level": 5, "skills": []}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create USER_QUESTS
CREATE TABLE IF NOT EXISTS user_quests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('ACTIVE', 'COMPLETED', 'FAILED')) DEFAULT 'ACTIVE',
    progress JSONB DEFAULT '{}', -- Custom progress data
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 🛡️ RLS POLICIES 🛡️

-- SKILLS: Read Public, Write Admin Only
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Admin write skills" ON skills FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- USER_SKILLS: Read Public, Write Admin/Service Only (for now)
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read user_skills" ON user_skills FOR SELECT USING (true);
CREATE POLICY "User equip user_skills" ON user_skills FOR UPDATE USING (auth.uid() = user_id);

-- QUESTS: Read Public
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read quests" ON quests FOR SELECT USING (true);
-- Write Admin Only
CREATE POLICY "Admin write quests" ON quests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- USER_QUESTS: Read Own, Write Service/Own
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own quests" ON user_quests FOR SELECT USING (auth.uid() = user_id);
