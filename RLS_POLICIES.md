# 🔐 Row Level Security (RLS) Policies Required

## Tables et Policies Nécessaires pour le Dashboard

### 1. Table `profiles`

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read profiles
CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT
USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

### 2. Table `htb_profiles`

```sql
-- Enable RLS
ALTER TABLE htb_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read HTB profiles
CREATE POLICY "htb_profiles_select_all"
ON htb_profiles FOR SELECT
USING (true);

-- Policy: Users can insert/update their own HTB profile
CREATE POLICY "htb_profiles_update_own"
ON htb_profiles FOR UPDATE
USING (auth.uid() = member_id);

CREATE POLICY "htb_profiles_insert_own"
ON htb_profiles FOR INSERT
WITH CHECK (auth.uid() = member_id);
```

### 3. Table `htb_stats_cache`

```sql
-- Enable RLS
ALTER TABLE htb_stats_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read stats
CREATE POLICY "htb_stats_select_all"
ON htb_stats_cache FOR SELECT
USING (true);

-- Policy: Only service role can update stats (for sync jobs)
CREATE POLICY "htb_stats_update_service"
ON htb_stats_cache FOR UPDATE
USING (false); -- Only service role bypasses RLS

CREATE POLICY "htb_stats_insert_service"
ON htb_stats_cache FOR INSERT
WITH CHECK (false); -- Only service role bypasses RLS
```

### 4. Table `points_transactions`

```sql
-- Enable RLS
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own transactions
CREATE POLICY "points_select_own"
ON points_transactions FOR SELECT
USING (auth.uid() = member_id);

-- Policy: Admins can read all transactions
CREATE POLICY "points_select_admin"
ON points_transactions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- Policy: Only service role can create transactions
CREATE POLICY "points_insert_service"
ON points_transactions FOR INSERT
WITH CHECK (false); -- Only service role bypasses RLS
```

## Script Complet d'Application

```sql
-- Apply all RLS policies at once
BEGIN;

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- HTB Profiles
ALTER TABLE htb_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "htb_profiles_select_all" ON htb_profiles;
DROP POLICY IF EXISTS "htb_profiles_update_own" ON htb_profiles;
DROP POLICY IF EXISTS "htb_profiles_insert_own" ON htb_profiles;

CREATE POLICY "htb_profiles_select_all"
ON htb_profiles FOR SELECT USING (true);

CREATE POLICY "htb_profiles_update_own"
ON htb_profiles FOR UPDATE USING (auth.uid() = member_id);

CREATE POLICY "htb_profiles_insert_own"
ON htb_profiles FOR INSERT WITH CHECK (auth.uid() = member_id);

-- HTB Stats Cache
ALTER TABLE htb_stats_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "htb_stats_select_all" ON htb_stats_cache;

CREATE POLICY "htb_stats_select_all"
ON htb_stats_cache FOR SELECT USING (true);

-- Points Transactions
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "points_select_own" ON points_transactions;
DROP POLICY IF EXISTS "points_select_admin" ON points_transactions;

CREATE POLICY "points_select_own"
ON points_transactions FOR SELECT
USING (auth.uid() = member_id);

CREATE POLICY "points_select_admin"
ON points_transactions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

COMMIT;
```

## Vérifier les Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'htb_profiles', 'htb_stats_cache', 'points_transactions');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'htb_profiles', 'htb_stats_cache', 'points_transactions')
ORDER BY tablename, policyname;
```

## Tester les Permissions

```sql
-- En tant qu'utilisateur authentifié
SET SESSION AUTHORIZATION authenticated;

-- Devrait fonctionner
SELECT * FROM profiles WHERE id = auth.uid();
SELECT * FROM htb_profiles WHERE member_id = auth.uid();
SELECT * FROM points_transactions WHERE member_id = auth.uid();

-- Devrait retourner toutes les stats (lecture publique)
SELECT * FROM htb_stats_cache;
```

## Important

- Les policies `SELECT` avec `USING (true)` permettent la lecture publique
- Les policies `UPDATE`/`INSERT` avec `USING (auth.uid() = ...)` limitent aux propriétaires
- Les transactions de points ne peuvent être créées que via service role (backend jobs)
- Les admins ont accès étendu via la policy spéciale avec EXISTS
