-- ============================================
-- EpiHack Members - Seed Points Rules
-- ============================================
-- This script populates the points_rules table with initial values
-- Run this AFTER setup-database.sql

INSERT INTO points_rules (rule_type, points_value, description) VALUES
    ('machine_easy', 10, 'Points awarded for completing an Easy difficulty machine'),
    ('machine_medium', 20, 'Points awarded for completing a Medium difficulty machine'),
    ('machine_hard', 40, 'Points awarded for completing a Hard difficulty machine'),
    ('machine_insane', 80, 'Points awarded for completing an Insane difficulty machine'),
    ('challenge', 15, 'Points awarded for completing a challenge'),
    ('user_blood', 50, 'Bonus points for getting user blood on a machine'),
    ('system_blood', 50, 'Bonus points for getting system blood on a machine'),
    ('daily_login', 5, 'Points for daily login'),
    ('duel_participation', 5, 'Participation bonus for accepting a duel')
ON CONFLICT (rule_type) DO UPDATE
SET 
    points_value = EXCLUDED.points_value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Seed default quest categories
INSERT INTO quest_categories (name, description, color, icon) VALUES
    ('Web Exploitation', 'Web application security challenges', '#ef4444', '🌐'),
    ('Binary Exploitation', 'Buffer overflows, reverse engineering', '#f97316', '💾'),
    ('Cryptography', 'Encryption, hashing, crypto challenges', '#8b5cf6', '🔐'),
    ('Forensics', 'Digital forensics and data recovery', '#06b6d4', '🔍'),
    ('OSINT', 'Open Source Intelligence gathering', '#10b981', '👁️'),
    ('Privilege Escalation', 'Linux/Windows privilege escalation', '#eab308', '⬆️'),
    ('General', 'Miscellaneous challenges', '#6366f1', '🎯')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED COMPLETE
-- ============================================
