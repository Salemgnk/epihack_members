-- Migration: Add HTB columns to profiles table
-- Run this in Supabase SQL Editor

-- Add HTB username column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS htb_username TEXT;

-- Add HTB user ID column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS htb_user_id INTEGER;

-- Add last synced timestamp
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Create index on htb_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_htb_user_id ON profiles(htb_user_id);

-- Add comment
COMMENT ON COLUMN profiles.htb_username IS 'HackTheBox username linked to this profile';
COMMENT ON COLUMN profiles.htb_user_id IS 'HackTheBox user ID for API calls';
COMMENT ON COLUMN profiles.last_synced_at IS 'Last time HTB data was synced';
