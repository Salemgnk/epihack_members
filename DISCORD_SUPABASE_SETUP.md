# 🔐 Configuration Discord OAuth + Supabase

## Ce que tu dois configurer

### 1️⃣ Discord Developer Portal

#### A. Créer/Configurer l'Application Discord

1. Va sur https://discord.com/developers/applications
2. Clique sur ton application (ou "New Application" si pas encore créée)
3. Note l'**Application ID** et le **Client Secret**

#### B. Configurer OAuth2

**Section OAuth2 → General**:

**Client ID**: (déjà affiché)
**Client Secret**: Clique sur "Reset Secret" si besoin, copie-le

**Redirects**:
Ajoute ces URLs exactes:
```
https://asgvycffaqvkceibdrqe.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

> ⚠️ Remplace `asgvycffaqvkceibdrqe` par ton propre project-ref Supabase

**OAuth2 URL Generator** (optionnel pour tester):
- Scopes: `identify`, `email`
- Redirect URL: celle de Supabase

---

### 2️⃣ Supabase Dashboard

#### A. Activer Discord dans Authentication

1. Va sur ton projet Supabase: https://supabase.com/dashboard/project/asgvycffaqvkceibdrqe
2. **Authentication** (menu gauche) → **Providers**
3. Cherche **Discord** dans la liste
4. Active le toggle Discord

#### B. Configurer Discord Provider

**Discord Client ID**: 
```
<ton Application ID de Discord>
```

**Discord Client Secret**:
```
<ton Client Secret de Discord>
```

**Callback URL (à copier)**: 
```
https://asgvycffaqvkceibdrqe.supabase.co/auth/v1/callback
```
↑ C'est cette URL qu'il faut ajouter dans Discord Redirects

**Scopes (optionnel)**: `identify email`

Clique **Save**

#### C. Configurer les Redirect URLs

**Authentication** → **URL Configuration**

**Site URL**:
```
https://members.epihack.tech
```

**Redirect URLs** (ajoute ces lignes):
```
https://members.epihack.tech/auth/callback
https://members.epihack.tech/*
http://localhost:3000/auth/callback
http://localhost:3000/*
```

---

### 3️⃣ Variables d'Environnement

#### Fichier `.env.local` (local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://asgvycffaqvkceibdrqe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZ3Z5Y2ZmYXF2a2NlaWJkcnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDQyMjEsImV4cCI6MjA3NTQ4MDIyMX0.qYWtB7EWEwNzJyAKyG4iNMsUj9EqSReodNqaHPSKRa8

# Admin
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=gnandisalem@gmail.com

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Vercel (production)

Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://asgvycffaqvkceibdrqe.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGci... (ta clé anon) |
| `NEXT_PUBLIC_SUPER_ADMIN_EMAIL` | gnandisalem@gmail.com |
| `NEXT_PUBLIC_SITE_URL` | https://members.epihack.tech |

---

### 4️⃣ Vérifier que la table `profiles` existe

Dans Supabase → **SQL Editor**, vérifie:

```sql
SELECT * FROM profiles LIMIT 1;
```

Si la table n'existe pas, crée-la:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  is_member BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  total_points INTEGER DEFAULT 0,
  profile_completed BOOLEAN DEFAULT false,
  year TEXT,
  skills TEXT[],
  github_username TEXT,
  discord_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Policy: Users peuvent update leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Auto-insert au signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

### 5️⃣ Créer un Trigger pour auto-créer le profil

Quand un user se connecte via Discord, on veut auto-créer son profil:

```sql
-- Function pour créer le profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, discord_id)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'provider_id'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 🧪 Tester le Flow

### En Local

1. Lance le dev server:
```bash
npm run dev
```

2. Va sur http://localhost:3000/0x2a

3. Entre le Konami Code: `↑↑↓↓←→←→BA`

4. Clique sur le vrai bouton (vert/bleu)

5. Tu seras redirigé vers Discord pour autoriser

6. Après autorisation → Redirect vers `/auth/callback` → Redirect vers `/dashboard`

### Vérifier dans Supabase

**Authentication** → **Users**:
- Tu devrais voir ton user Discord

**Table Editor** → **profiles**:
- Ton profil devrait être créé automatiquement

---

## ⚠️ Problèmes Courants

### "Invalid redirect URL"
→ Vérifie que les URLs dans Discord et Supabase matchent **exactement**

### "User not found in profiles"
→ Le trigger ne s'est pas exécuté, crée le profil manuellement ou vérifie le trigger

### "Session not found"
→ Cookies bloqués, teste en navigation privée ou vérifie les CORS

### Redirect loop
→ Middleware redirige vers `/0x2a`, mais `/0x2a` n'est pas dans publicRoutes

---

## 📝 Résumé Checklist

- [ ] Discord App créée avec Client ID + Secret
- [ ] Discord Redirects configurés (Supabase callback URL)
- [ ] Supabase Discord provider activé avec credentials
- [ ] Supabase Redirect URLs configurées
- [ ] Variables d'environnement `.env.local` remplies
- [ ] Table `profiles` existe avec RLS
- [ ] Trigger `handle_new_user()` créé
- [ ] Test en local réussi
- [ ] Déployé sur Vercel avec env vars
- [ ] Test en production réussi

---

**Une fois tout configuré, le flow sera:**
1. User clique sur bouton Discord (après Konami Code)
2. Redirect Discord → Autorisation
3. Discord redirect vers Supabase callback
4. Supabase crée session + trigger profil
5. Redirect vers `/auth/callback` de ton app
6. Ton callback redirect vers `/dashboard`
7. ✅ User connecté !
