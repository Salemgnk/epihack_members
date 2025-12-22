-- Migration: Add is_admin column for multi-admin support
-- Allows promoting multiple admins instead of single hardcoded email

-- Add is_admin column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set current super admin as admin
-- Replace with your actual admin email
UPDATE profiles
SET is_admin = true
FROM auth.users
WHERE profiles.id = auth.users.id
AND auth.users.email = 'gnandisalem@gmail.com';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- RLS Policy: Only admins can update is_admin
CREATE POLICY "Only admins can promote other admins"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

COMMENT ON COLUMN profiles.is_admin IS 'Designates user as system administrator with full access';
