# FICHE TECHNIQUE: EPIHACK-MEMBERS

**Version**: 1.0  
**Date**: 2025-12-10  
**Repository**: epihack_members  
**URL Production**: https://members.epihack.tech  
**URL Dev**: http://localhost:3000

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Technique](#architecture-technique)
3. [Schéma de Base de Données](#schéma-de-base-de-données)
4. [Design System](#design-system)
5. [API Routes](#api-routes)
6. [Fonctionnalités](#fonctionnalités)
7. [Intégrations Externes](#intégrations-externes)
8. [Communication Inter-Applications](#communication-inter-applications)
9. [Déploiement](#déploiement)
10. [Variables d'Environnement](#variables-denvironnement)

---

## 🎯 VUE D'ENSEMBLE

### Description
Application Next.js dédiée aux membres de l'association EpiHack. Plateforme de gamification complète intégrant HackTheBox, Discord, GitHub, avec système de points, badges, duels et classements.

### Stack Technique
- **Framework**: Next.js 15.5.7 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (Discord OAuth)
- **Real-time**: Supabase Realtime
- **API Externes**: HackTheBox, Discord, GitHub

### Dépendances Principales
```json
{
  "@supabase/auth-helpers-nextjs": "^0.10.0",
  "@supabase/ssr": "^0.7.0",
  "@supabase/supabase-js": "^2.80.0",
  "next": "15.5.7",
  "react": "19.1.2",
  "tailwindcss": "^4",
  "lucide-react": "^0.544.0",
  "swr": "^2.3.6",
  "axios": "^1.12.2"
}
```

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Structure du Projet
```
epihack_members/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── layout.tsx         # Root layout avec providers
│   │   ├── page.tsx           # Redirect → /dashboard
│   │   ├── globals.css        # Design system
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── profile/           # Profil utilisateur
│   │   ├── members/           # Liste membres
│   │   │   ├── page.tsx      # Vue liste
│   │   │   ├── badges/       # Badges système
│   │   │   ├── compare/      # Comparaison profils
│   │   │   ├── duels/        # Duels HTB
│   │   │   ├── leaderboard/  # Classement
│   │   │   ├── profile/[id]/ # Profil public
│   │   │   └── settings/     # Paramètres
│   │   ├── scoreboard/        # Scoreboard global
│   │   ├── administration/    # Admin panel
│   │   │   ├── page.tsx      # Admin home
│   │   │   └── members/      # Gestion membres
│   │   ├── auth/             # Auth callbacks
│   │   └── api/              # API Routes
│   │       ├── admin/
│   │       │   └── delete-member/
│   │       └── secret-members/ # API membres secrets
│   ├── components/
│   │   ├── ui/               # Composants UI (sidebar, toast, etc.)
│   │   ├── members/          # Composants membres
│   │   │   ├── CreateDuelModal.tsx
│   │   │   └── LinkHTBAccount.tsx
│   │   ├── profile/          # Composants profil
│   │   ├── admin/            # Composants admin
│   │   ├── auth/             # Composants auth
│   │   ├── ctf/              # Composants CTF
│   │   ├── layout/           # Composants layout
│   │   └── providers/        # Context providers
│   │       └── SessionProvider.tsx
│   ├── lib/                  # Utilitaires et services
│   │   ├── supabase.ts      # Client Supabase SSR
│   │   ├── supabase-client.ts # Client browser
│   │   ├── supabase-admin.ts  # Client admin
│   │   ├── auth.ts          # Helpers auth
│   │   ├── htb-client.ts    # Client HackTheBox
│   │   ├── storage-service.ts
│   │   ├── likes-service.ts
│   │   ├── profile-check.ts
│   │   └── types/           # Types TypeScript
│   └── middleware.ts         # Auth middleware
├── supabase/
│   └── migrations/          # Migrations SQL
│       ├── 20241108_fix_project_members_policies.sql
│       ├── 20250109_create_bureau_members.sql
│       └── 20250109_create_members_subdomain.sql
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── .env.local

```

### Middleware d'Authentification
Toutes les routes nécessitent une authentification Discord OAuth via Supabase.

**Flux d'authentification**:
1. Site principal: `epihack.tech/secret-login` (Discord OAuth)
2. Callback: `epihack.tech/auth/callback?redirect=members.epihack.tech`
3. Redirection: `members.epihack.tech`

---

## 🗄️ SCHÉMA DE BASE DE DONNÉES

### Tables Principales

#### 1. `profiles`
**Profils utilisateurs** (table héritée du monorepo)
```sql
- id: UUID (PK, auth.uid())
- username: TEXT
- avatar_url: TEXT
- is_member: BOOLEAN
- is_admin: BOOLEAN
- total_points: INTEGER (calculé)
- profile_completed: BOOLEAN
- year: TEXT (ex: "L1", "L2", "L3")
- skills: TEXT[]
- github_username: TEXT
- discord_id: TEXT
- created_at: TIMESTAMPTZ
```

#### 2. `htb_profiles`
**Liaison HackTheBox**
```sql
- id: UUID (PK)
- member_id: UUID (FK → profiles.id, UNIQUE)
- htb_user_id: INTEGER (UNIQUE)
- htb_username: TEXT
- last_sync: TIMESTAMPTZ
- sync_enabled: BOOLEAN
- created_at: TIMESTAMPTZ
```

#### 3. `htb_stats_cache`
**Cache des stats HTB** (optimisation performance)
```sql
- id: UUID (PK)
- htb_profile_id: UUID (FK → htb_profiles.id, UNIQUE)
- rank: TEXT
- points: INTEGER
- user_bloods: INTEGER
- system_bloods: INTEGER
- machines_owned: INTEGER
- challenges_owned: INTEGER
- cached_at: TIMESTAMPTZ
```

#### 4. `htb_activity_log`
**Historique activité HTB**
```sql
- id: UUID (PK)
- htb_profile_id: UUID (FK → htb_profiles.id)
- activity_type: TEXT ('machine_pwn', 'challenge_solve', 'user_blood', 'system_blood')
- activity_data: JSONB
- occurred_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
```

#### 5. `points_transactions`
**Système de points multi-sources**
```sql
- id: UUID (PK)
- member_id: UUID (FK → profiles.id)
- points: INTEGER (peut être négatif)
- source: TEXT ('htb', 'discord', 'github', 'project', 'admin', 'ctf', 'picoctf', 'duel', 'bet')
- description: TEXT
- metadata: JSONB
- awarded_by: UUID (FK → profiles.id, NULL si auto)
- created_at: TIMESTAMPTZ
```

**Vue matérialisée** `member_points_balance`:
```sql
SELECT 
  member_id,
  SUM(points) as total_points,
  COUNT(*) as transaction_count,
  MAX(created_at) as last_transaction
FROM points_transactions
GROUP BY member_id
```

#### 6. `gamification_badges`
**Badges du système**
```sql
- id: UUID (PK)
- name: TEXT (UNIQUE)
- description: TEXT
- icon_emoji: TEXT (ex: '🏆', '🔥')
- icon_url: TEXT
- criteria: JSONB ({ type: 'htb_machines', threshold: 10 })
- points_reward: INTEGER
- rarity: TEXT ('common', 'rare', 'epic', 'legendary')
- created_at: TIMESTAMPTZ
```

#### 7. `member_badges`
**Badges obtenus**
```sql
- id: UUID (PK)
- member_id: UUID (FK → profiles.id)
- badge_id: UUID (FK → gamification_badges.id)
- earned_at: TIMESTAMPTZ
- UNIQUE(member_id, badge_id)
```

#### 8. `duels`
**Système de duels HTB 1v1**
```sql
- id: UUID (PK)
- challenger_id: UUID (FK → profiles.id)
- challenged_id: UUID (FK → profiles.id)
- htb_machine_id: INTEGER
- htb_machine_name: TEXT
- htb_machine_difficulty: TEXT ('easy', 'medium', 'hard', 'insane')
- status: TEXT ('pending', 'active', 'completed', 'cancelled', 'expired')
- duration_hours: INTEGER (default: 48h)
- challenger_stake: INTEGER (points en jeu)
- challenged_stake: INTEGER
- winner_id: UUID (FK → profiles.id)
- challenger_pwned: BOOLEAN
- challenged_pwned: BOOLEAN
- challenger_pwned_at: TIMESTAMPTZ
- challenged_pwned_at: TIMESTAMPTZ
- started_at: TIMESTAMPTZ
- ends_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
```

#### 9. `duel_bets`
**Paris sur les duels**
```sql
- id: UUID (PK)
- duel_id: UUID (FK → duels.id)
- bettor_id: UUID (FK → profiles.id)
- bet_on_id: UUID (FK → profiles.id) -- sur qui on parie
- amount: INTEGER (CHECK: 10-100)
- odds: DECIMAL(4,2) -- cotes au moment du pari
- payout: INTEGER (NULL si en cours)
- status: TEXT ('pending', 'won', 'lost', 'refunded')
- created_at: TIMESTAMPTZ
```

#### 10. `discord_activity`
**Activité Discord**
```sql
- id: UUID (PK)
- member_id: UUID (FK → profiles.id, UNIQUE)
- discord_user_id: TEXT
- message_count: INTEGER
- voice_minutes: INTEGER
- reactions_given: INTEGER
- reactions_received: INTEGER
- last_active: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 11. `github_contributions`
**Contributions GitHub**
```sql
- id: UUID (PK)
- member_id: UUID (FK → profiles.id)
- github_username: TEXT
- repo_name: TEXT
- contribution_type: TEXT ('commit', 'pr', 'issue', 'review')
- contribution_data: JSONB
- occurred_at: TIMESTAMPTZ
- points_awarded: INTEGER
- created_at: TIMESTAMPTZ
```

#### 12. `picoctf_profiles`
**Intégration picoCTF**
```sql
- id: UUID (PK)
- member_id: UUID (FK → profiles.id, UNIQUE)
- picoctf_username: TEXT
- score: INTEGER
- last_sync: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
```

### Row Level Security (RLS)
Toutes les tables ont RLS activé avec politiques:
- ✅ Lecture publique pour les membres authentifiés
- ✅ Insertion/Modification restreinte au propriétaire
- ✅ Actions admin via fonctions avec vérification `is_admin`

---

## 🎨 DESIGN SYSTEM

### Palette de Couleurs

#### Couleurs Primaires
```css
--background: #020202        /* Noir profond */
--foreground: #e5e5e5        /* Blanc cassé */
--system-bg: #050510         /* Arrière-plan système */
--system-panel: rgba(10, 15, 30, 0.85) /* Panels glassmorphism */
```

#### Couleurs d'Accent
```css
--system-blue: #00F0FF       /* Bleu néon */
--system-green: #00FF9D      /* Vert néon */
--system-red: #FF2A2A        /* Rouge néon */
--primary: #00e573           /* Vert legacy */
```

#### Couleurs Secondaires
```css
--card: #0a0a0a
--border: #1f1f1f
--input: #1f1f1f
--muted: #1a1a1a
--muted-foreground: #737373
```

### Typographie

#### Polices Web (Google Fonts)
L'application utilise des polices Google Fonts pour un rendu moderne et cyberpunk :

**Imports requis** (dans `layout.tsx` ou `<head>`) :
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
```

#### Variables CSS de Fonts
```css
/* Polices système par défaut (Geist) */
--font-sans: var(--font-geist-sans)  /* Next.js default - Corps de texte */
--font-mono: var(--font-geist-mono)  /* Next.js default - Code/Nombres */

/* Polices spécifiques EpiHack */
--font-rajdhani: 'Rajdhani', sans-serif    /* Headings, Titres, UI system */
--font-tech: 'Share Tech Mono', monospace   /* Terminal, Tech, Monospace alt */
```

#### Usages Recommandés

| Police | Utilisation | Poids | Exemple |
|--------|-------------|-------|---------|
| **Rajdhani** | Titres, Headers, System UI | 300-700 | `<h1 className="font-rajdhani font-bold">` |
| **Share Tech Mono** | Terminal, Console, Code inline | 400 | `<code className="font-tech">` |
| **Geist Sans** | Paragraphes, Corps de texte | 400-700 | `<p className="font-sans">` |
| **Geist Mono** | Blocs de code, Chiffres | 400-700 | `<pre className="font-mono">` |

#### Hiérarchie Typographique
```css
/* Headings */
h1: font-rajdhani, font-bold (700), 2xl-4xl
h2: font-rajdhani, font-semibold (600), xl-2xl  
h3: font-rajdhani, font-medium (500), lg-xl
h4: font-sans, font-semibold (600), base-lg

/* Body */
p: font-sans, font-normal (400), sm-base
small: font-sans, font-normal (400), xs-sm

/* Special */
.terminal: font-tech, font-normal (400), sm
.stats: font-mono, font-medium (500), base
.badge: font-rajdhani, font-bold (700), xs
```

### Animations

#### Keyframes Disponibles
```css
@keyframes fadeInUp       /* Entrée douce */
@keyframes float          /* Flottement */
@keyframes glow           /* Effet glow (system-green) */
@keyframes glitch         /* Effet glitch */
@keyframes scanline       /* Scanline animée */
```

#### Variables d'Animation
```css
--animate-pulse-slow: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite
--animate-fade-in-up: fadeInUp 0.5s ease-out forwards
--animate-glitch: glitch 1s linear infinite
--animate-scanline: scanline 8s linear infinite
--animate-float: float 3s ease-in-out infinite
--animate-glow: glow 2s ease-in-out infinite
```

### Classes Utilitaires

#### Glass Effect
```css
.glass {
  background: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

#### System Window
```css
.system-window {
  background: rgba(5, 5, 20, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
}
/* + Lignes néon top/bottom-right */
```

#### Backgrounds
```css
.bg-grid  /* Grille cyan subtile */
.bg-dot   /* Points verts dispersés */
```

### Scrollbar Personnalisée
```css
::-webkit-scrollbar-thumb:hover { background: var(--system-green); }
```

---

## 🔌 API ROUTES

### 1. `/api/admin/delete-member` [DELETE]
**Admin uniquement** - Suppression de membre
```typescript
Request: { memberId: string }
Response: { success: boolean, message: string }
```

### 2. `/api/secret-members` [GET]
**Membres uniquement** - API cachée pour data sensible
```typescript
Response: { members: Profile[], stats: Stats }
```

### APIs Héritées (CTF)
- `/api/ctf/challenges` - Liste challenges
- `/api/ctf/submit` - Soumission flag
- `/api/ctf/verify-flag` - Vérification flag
- `/api/duels` - Gestion duels
- `/api/duels/[id]/respond` - Réponse duel
- `/api/htb/link` - Liaison compte HTB
- `/api/scoreboard` - Scoreboard global

---

## ⚡ FONCTIONNALITÉS

### 🏠 Dashboard
**Route**: `/dashboard`

**Features**:
- Vue d'ensemble personnalisée
- Statistiques de points (total)
- Challenges assignés (CTF internes)
- Badge admin avec accès rapide panel
- Modal Setup profil (si incomplete)

**Stats Admin** (si `is_admin: true`):
- Total membres
- Total challenges
- Total assignations
- Assignations en cours
- Soumissions 7 derniers jours

**Actions Rapides Admin**:
- Gérer admins
- Voir membres
- CTF Challenges (créer/assigner)
- Gérer assignations

### 👤 Profile
**Route**: `/profile`

**Features**:
- Avatar (Discord auto)
- Username, year, skills
- Points totaux (toutes sources)
- Badges obtenus
- Historique transactions
- Liaison HTB Account
- Statistiques HTB (si lié)

### 📊 Members / Leaderboard
**Route**: `/members`

**Sub-routes**:
- `/members/leaderboard` - Classement général (points)
- `/members/badges` - Système de badges
- `/members/compare` - Comparaison 2 profils
- `/members/duels` - Liste duels actifs
- `/members/profile/[id]` - Profil public
- `/members/settings` - Paramètres membre

**Leaderboard Columns**:
- Rank
- Username
- Points totaux
- HTB rank (si lié)
- Badges count
- Activity streak

### 🎯 Scoreboard
**Route**: `/scoreboard`

**Tabs**:
- HTB Scoreboard (points HTB)
- Discord Activity (messages, voice)
- GitHub Contributions
- picoCTF Scoreboard
- Overall EpiHack Points

### ⚔️ Duels System
**Route**: `/members/duels`

**Features**:
- Créer un duel (sélection machine HTB)
- Défier un membre
- Accepter/Refuser un duel
- Parier sur un duel (10-100 pts)
- Calcul automatique winner (premier à pwn)
- Distribution gains (stake + bets)
- Expiration auto (48h default)

**Statuts**:
- `pending` - En attente d'acceptation
- `active` - Duel en cours
- `completed` - Terminé (winner)
- `cancelled` - Annulé par challenger
- `expired` - Expiré sans acceptation

### 🏆 Badges & Achievements
**Route**: `/members/badges`

**Types de badges**:
- HTB Machines (10, 50, 100 owned)
- HTB Bloods (first, user, system)
- Duels (5, 20, 50 wins)
- Discord Activity (messages, voice)
- GitHub Contributions
- Points Milestones (1000, 5000, 10000)

**Rareté**:
- `common` - Gris
- `rare` - Bleu
- `epic` - Violet
- `legendary` - Or

### 🛡️ Administration
**Route**: `/administration` (Admins uniquement)

**Sections**:
- **Dashboard Admin** - Stats générales
- **Gestion Membres** - Promouvoir/Rétrograder, Supprimer
- **Gestion CTF** - Créer challenges, Assigner
- **Gestion Assignations** - Voir toutes les assignations

---

## 🔗 INTÉGRATIONS EXTERNES

### 1. HackTheBox API

**Endpoint**: https://labs.hackthebox.com/api/v4/

**Features**:
- Liaison compte HTB
- Sync auto stats (rank, points, machines, challenges)
- Détection activité (machines pwn, flags)
- Attribution points auto
- Activity log

**Tables**:
- `htb_profiles`
- `htb_stats_cache`
- `htb_activity_log`
- `points_transactions` (source: 'htb')

**Points Awards**:
- Machine Easy: +50 pts
- Machine Medium: +100 pts
- Machine Hard: +150 pts
- Machine Insane: +200 pts
- User Blood: +500 pts
- System Blood: +1000 pts
- Challenge Solve: +points du challenge

### 2. Discord Bot Integration

**Features**:
- Sync messages count
- Sync voice minutes
- Sync reactions
- Attribution points activité

**Table**: `discord_activity`

**Points Awards**:
- 100 messages: +10 pts
- 60 min voice: +5 pts
- Event participation: +20 pts

### 3. GitHub API

**Features**:
- Détection commits sur repos EpiHack
- Détection PRs acceptées
- Review code
- Issues

**Table**: `github_contributions`

**Points Awards**:
- Commit: +5 pts
- PR merged: +20 pts
- Review: +10 pts
- Issue solved: +15 pts

### 4. picoCTF

**Features**:
- Liaison compte picoCTF
- Sync score
- Attribution points

**Table**: `picoctf_profiles`

**Points Awards**:
- Par points picoCTF: ratio 1:1

---

## 🔄 COMMUNICATION INTER-APPLICATIONS

### Vue d'ensemble
```
epihack (site principal)
    ↕️ Base de données Supabase (partagée)
epihack_members (app membres)
```

### Base de Données Partagée

**Connexion Supabase**:
- URL: Même projet Supabase
- Tables communes: `profiles`, `challenge_assignments`, `ctf_challenges`
- Tables spécifiques members: `htb_profiles`, `duels`, `points_transactions`, etc.

### Flux d'Authentification Cross-App

**1. Connexion Site Principal → Members**
```
1. User visite: epihack.tech/secret-login
2. Discord OAuth via Supabase
3. Callback: epihack.tech/auth/callback?redirect=https://members.epihack.tech
4. Création/Update profil dans `profiles`
5. Redirect: members.epihack.tech (session Supabase valide)
```

**2. Session Partagée**
- Cookies Supabase partagés entre domaines (même projet)
- User authentifié sur les 2 apps simultanément
- Logout sur une app = logout sur l'autre

### Endpoints de Communication

#### Site Principal → Members
**API publique** (pas d'endpoint direct, mais via BDD):
- Lecture `profiles` pour afficher membres
- Lecture `member_points_balance` pour scoreboard

#### Members → Site Principal
- Aucune dépendance directe
- Communication via BDD partagée uniquement

### Synchronisation Données

**Real-time via Supabase**:
```typescript
// Écouter changements profil
supabase
  .channel('profiles-changes')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'profiles' },
    (payload) => console.log(payload)
  )
  .subscribe()
```

### Variables Environnement Communes
```env
# Identiques sur les 2 apps
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Spécifiques
NEXT_PUBLIC_SITE_URL=https://members.epihack.tech (members)
NEXT_PUBLIC_SITE_URL=https://epihack.tech (principal)
```

---

## 🚀 DÉPLOIEMENT

### Architecture Production

```
┌─────────────────────┐
│  epihack.tech       │  Site Principal
│  (Vercel)           │
│  /secret-login      │  Auth gateway
└──────────┬──────────┘
           │
           │ Redirect après auth
           ↓
┌─────────────────────┐
│ members.epihack.tech│  App Members
│ (Vercel)            │
└──────────┬──────────┘
           │
           │ Supabase Client
           ↓
┌─────────────────────┐
│  Supabase           │
│  - Auth (Discord)   │
│  - Database (Postgres)│
│  - Storage          │
│  - Realtime         │
└─────────────────────┘
           │
           │ Webhooks / API
           ↓
┌─────────────────────┐
│  APIs Externes      │
│  - HackTheBox       │
│  - Discord Bot      │
│  - GitHub           │
└─────────────────────┘
```

### Vercel Configuration

**Repository**: `epihack_members`

**Build Settings**:
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node Version: 20.x
```

**Environment Variables** (Production):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=admin@epihack.tech
NEXT_PUBLIC_SITE_URL=https://members.epihack.tech
HTB_API_TOKEN=xxx (optionnel)
```

**Domain**:
- Production: `members.epihack.tech`
- Preview: Auto-generated Vercel URLs

### Supabase Configuration

**Redirect URLs** (Auth settings):
```
https://members.epihack.tech/auth/callback
https://epihack.tech/auth/callback
http://localhost:3000/auth/callback (dev)
http://localhost:3001/auth/callback (dev)
```

**Discord OAuth**:
- Redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
- Scopes: `identify`, `email`

### Migrations

**Appliquer les migrations**:
```bash
cd epihack_members
npx supabase db push
```

**Migrations ordre**:
1. `20241108_fix_project_members_policies.sql`
2. `20250109_create_bureau_members.sql`
3. `20250109_create_members_subdomain.sql`

---

## 🔐 VARIABLES D'ENVIRONNEMENT

### Configuration Complète

#### `.env.local` - epihack_members (Développement)
```env
# ================================
# SUPABASE CONFIGURATION
# ================================
NEXT_PUBLIC_SUPABASE_URL=https://asgvycffaqvkceibdrqe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZ3Z5Y2ZmYXF2a2NlaWJkcnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDQyMjEsImV4cCI6MjA3NTQ4MDIyMX0.qYWtB7EWEwNzJyAKyG4iNMsUj9EqSReodNqaHPSKRa8

# ================================
# ADMIN CONFIGURATION
# ================================
# Super-admin principal (peut promouvoir/rétrograder d'autres admins)
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=gnandisalem@gmail.com

# ================================
# SITE CONFIGURATION
# ================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ================================
# HACKTHEBOX API (Optionnel)
# ================================
# Token API HackTheBox pour sync automatique
# Obtenir sur: https://www.hackthebox.com/home/settings
HTB_API_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI1IiwianRpIjoiNWJkMDkyNzViNjkzOTNhMmUxYjQzZWYzOTg1N2I0Njg0YjIyOWI5NGYzOWExYzA3MDg1NzdkOWNhOTU2OGNjMjhiMGNlZGQzYjk1ZTlhNDIiLCJpYXQiOjE3NjQxOTEzMjMuNTk4Mjg0LCJuYmYiOjE3NjQxOTEzMjMuNTk4Mjg2LCJleHAiOjE3OTU3MjczMjMuNTkzNDMzLCJzdWIiOiIxNzYxNTgyIiwic2NvcGVzIjpbXX0.xxx

# ================================
# DISCORD BOT (Optionnel)
# ================================
# Token bot Discord pour sync activité
DISCORD_BOT_TOKEN=xxx

# ================================  
# GITHUB API (Optionnel)
# ================================
# Token GitHub pour sync contributions
GITHUB_TOKEN=ghp_xxx
```

#### `.env.local` - epihack (Site Principal - Développement)
```env
# ================================
# SUPABASE CONFIGURATION
# ================================
NEXT_PUBLIC_SUPABASE_URL=https://asgvycffaqvkceibdrqe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZ3Z5Y2ZmYXF2a2NlaWJkcnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDQyMjEsImV4cCI6MjA3NTQ4MDIyMX0.qYWtB7EWEwNzJyAKyG4iNMsUj9EqSReodNqaHPSKRa8

# ================================
# ADMIN CONFIGURATION
# ================================
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=gnandisalem@gmail.com

# ================================
# SITE CONFIGURATION
# ================================
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# ================================
# HACKTHEBOX API
# ================================
HTB_API_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI1IiwianRpIjoiNWJkMDkyNzViNjkzOTNhMmUxYjQzZWYzOTg1N2I0Njg0YjIyOWI5NGYzOWExYzA3MDg1NzdkOWNhOTU2OGNjMjhiMGNlZGQzYjk1ZTlhNDIiLCJpYXQiOjE3NjQxOTEzMjMuNTk4Mjg0LCJuYmYiOjE3NjQxOTEzMjMuNTk4Mjg2LCJleHAiOjE3OTU3MjczMjMuNTkzNDMzLCJzdWIiOiIxNzYxNTgyIiwic2NvcGVzIjpbXX0.xxx
```

### Variables en Production

#### Vercel Environment Variables (epihack_members)
```env
# Production
NEXT_PUBLIC_SUPABASE_URL=https://asgvycffaqvkceibdrqe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx (même clé que dev)
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=gnandisalem@gmail.com
NEXT_PUBLIC_SITE_URL=https://members.epihack.tech
HTB_API_TOKEN=eyJxxx (optionnel)
DISCORD_BOT_TOKEN=xxx (optionnel)
GITHUB_TOKEN=ghp_xxx (optionnel)
```

#### Vercel Environment Variables (epihack - Site Principal)
```env
# Production
NEXT_PUBLIC_SUPABASE_URL=https://asgvycffaqvkceibdrqe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx (même clé)
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=gnandisalem@gmail.com
NEXT_PUBLIC_SITE_URL=https://epihack.tech
HTB_API_TOKEN=eyJxxx
```

### Variables Détaillées

| Variable | Type | Requis | Description | Où obtenir |
|----------|------|--------|-------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | ✅ Oui | URL du projet Supabase | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | ✅ Oui | Clé anonyme Supabase (même pour les 2 apps) | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SITE_URL` | Public | ✅ Oui | URL base de l'application | `http://localhost:3000` (dev) ou `https://members.epihack.tech` (prod) |
| `NEXT_PUBLIC_SUPER_ADMIN_EMAIL` | Public | ✅ Oui | Email du super-administrateur | Email de l'admin principal |
| `HTB_API_TOKEN` | Private | ⚠️ Optionnel | Token HackTheBox pour sync | [HTB Settings](https://www.hackthebox.com/home/settings) → Create API Token |
| `DISCORD_BOT_TOKEN` | Private | ⚠️ Optionnel | Token bot Discord pour webhooks | [Discord Developer Portal](https://discord.com/developers/applications) |
| `GITHUB_TOKEN` | Private | ⚠️ Optionnel | Token GitHub (PAT) pour contributions | [GitHub Settings](https://github.com/settings/tokens) → Personal Access Tokens |

### Notes Importantes

#### Sécurité des Clés
- ⚠️ **JAMAIS** commiter le fichier `.env.local` (dans `.gitignore`)
- ✅ Les clés `NEXT_PUBLIC_*` sont exposées au client (navigateur)
- 🔒 Les clés sans préfixe restent côté serveur uniquement

#### Ports en Développement
- **epihack_members**: Port 3000 (par défaut Next.js)
- **epihack (principal)**: Port 3001 (override avec `--port 3001`)

```bash
# Démarrer sur port 3000 (members)
cd epihack_members
npm run dev

# Démarrer sur port 3001 (principal)
cd epihack
npm run dev -- --port 3001
```

#### Même Base de Données
Les deux applications partagent :
- ✅ Même `NEXT_PUBLIC_SUPABASE_URL`
- ✅ Même `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ Sessions utilisateur synchronisées
- ⚠️ Différent `NEXT_PUBLIC_SITE_URL` (selon l'app)

### Obtenir les Tokens API

#### HackTheBox API Token
1. Se connecter sur [HackTheBox](https://www.hackthebox.com)
2. Aller dans **Settings** → **Create API Token**
3. Copier le token JWT (commence par `eyJ...`)
4. Ajouter dans `.env.local` comme `HTB_API_TOKEN`

**Permissions requises** : Lecture profil, activité, machines

#### Discord Bot Token
1. Créer une app sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Aller dans **Bot** → **Reset Token**
3. Copier le token (commence par `MTxxx` ou `ODxxx`)
4. Ajouter dans `.env.local` comme `DISCORD_BOT_TOKEN`

**Permissions requises** : Lecture messages, membres, présences

#### GitHub Personal Access Token
1. Aller dans [GitHub Settings](https://github.com/settings/tokens)
2. **Generate new token (classic)**
3. Sélectionner scopes : `repo`, `read:user`
4. Copier le token (commence par `ghp_`)
5. Ajouter dans `.env.local` comme `GITHUB_TOKEN`

### Template .env.example

Créer un fichier `.env.example` (safe pour git) :
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Admin
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=admin@example.com

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optionnel
HTB_API_TOKEN=your_htb_token_here
DISCORD_BOT_TOKEN=your_discord_token_here
GITHUB_TOKEN=your_github_token_here
```

---

## 📝 NOTES DE MIGRATION

### Si importation dans nouveau repo

1. **Copier le repo complet**
2. **Installer dépendances**: `npm install`
3. **Configurer `.env.local`** avec vos clés Supabase
4. **Appliquer migrations** dans Supabase
5. **Configurer OAuth Discord** dans Supabase
6. **Mettre à jour** `NEXT_PUBLIC_SITE_URL` selon votre domaine
7. **Déployer** sur Vercel
8. **Configurer DNS** pour pointer vers Vercel
9. **Ajouter redirect URLs** dans Supabase Auth

### Dépendances Base de Données

Tables existantes requises (créées dans app principale):
- `profiles`
- `ctf_challenges`
- `ctf_categories`
- `challenge_assignments`

Tables créées par migrations members:
- `htb_profiles`, `htb_stats_cache`, `htb_activity_log`
- `points_transactions`, `member_points_balance` (vue)
- `gamification_badges`, `member_badges`
- `duels`, `duel_bets`
- `discord_activity`
- `github_contributions`
- `picoctf_profiles`

---

## 📚 RESSOURCES ADDITIONNELLES

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

### APIs Externes
- [HackTheBox API](https://www.hackthebox.com/api)
- [Discord Developer](https://discord.com/developers/docs)
- [GitHub REST API](https://docs.github.com/en/rest)

---

**Fiche créée le**: 2025-12-10  
**Version**: 1.0.0  
**Auteur**: EpiHack Team
