-- ============================================
-- Migration Script - Add Missing Columns
-- ============================================
-- Run this INSTEAD of setup-database.sql if you have errors

-- ============================================
-- DROP EXISTING TABLES IF NEEDED
-- ============================================
-- WARNING: This will delete all data in these tables!
-- Only run this if you're starting fresh or can afford to lose the data

DROP TABLE IF EXISTS member_quests CASCADE;
DROP TABLE IF EXISTS quests CASCADE;
DROP TABLE IF EXISTS quest_categories CASCADE;
DROP TABLE IF EXISTS htb_sync_log CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP FUNCTION IF EXISTS complete_quest(UUID, INTEGER);
DROP FUNCTION IF EXISTS resolve_duel(UUID, UUID, INTEGER);
DROP VIEW IF EXISTS unread_notifications_count;

-- ============================================
-- Now run the full setup-database.sql script
-- ============================================
-- After running this, copy and paste the ENTIRE content of setup-database.sql
