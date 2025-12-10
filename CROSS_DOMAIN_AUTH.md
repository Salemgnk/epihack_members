# 🔄 Flow d'Authentification Cross-Domain

## Architecture des Sites

Tu as **2 domaines distincts** :

1. **Site Public** : `epihack.tech`
   - Accessible à tous
   - Contient la page de login publique
   - Route secrète : `/secret-login` (pour accéder au portail membres)

2. **Site Membres** : `members.epihack.tech`
   - Accessible uniquement aux membres authentifiés
   - Dashboard, profils, duels, etc.
   - Route secrète : `/0x2a` (page de login avec Konami Code)

---

## 🎯 Scénario Recommandé : Login Centralisé

### Option A : Login depuis le Site Principal (Recommandé)

**Flow complet** :

```
1. User visite: epihack.tech/secret-login
2. Clique sur "Connexion Discord"
3. Discord OAuth → Autorisation
4. Discord redirect → Supabase callback
5. Supabase créé session
6. Redirect → epihack.tech/auth/callback
7. Callback vérifie session et redirect → members.epihack.tech
8. User arrive sur members.epihack.tech (session partagée)
9. Middleware vérifie auth → Redirect vers /dashboard
```

#### ✅ Avantages
- Login centralisé sur le site principal
- URL publique connue (`/secret-login`)
- Session Supabase partagée entre les deux domaines
- Un seul endroit à maintenir pour le login

#### Configuration Nécessaire

**Discord Developer Portal** :
```
Redirect URIs:
- https://asgvycffaqvkceibdrqe.supabase.co/auth/v1/callback
```

**Supabase Dashboard** :
```
Site URL: https://epihack.tech

Redirect URLs:
- https://epihack.tech/auth/callback
- https://epihack.tech/*
- https://members.epihack.tech/auth/callback
- https://members.epihack.tech/*
- http://localhost:3000/auth/callback
- http://localhost:3001/auth/callback
```

**Site Principal (epihack.tech)** - Créer `/secret-login/page.tsx` :
```tsx
'use client';

import { supabase } from '@/lib/supabase-client';

export default function SecretLoginPage() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        // Après auth Discord, redirect vers le site membres
        redirectTo: 'https://members.epihack.tech',
      },
    });
    
    if (error) console.error(error);
  };

  return (
    <button onClick={handleLogin}>
      Se connecter avec Discord
    </button>
  );
}
```

**Site Principal - Callback `/auth/callback/route.ts`** :
```ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect vers le site membres
  return NextResponse.redirect('https://members.epihack.tech');
}
```

---

### Option B : Login Direct sur Site Membres (Actuel)

**Flow** :

```
1. User visite: members.epihack.tech/0x2a
2. Entre Konami Code
3. Clique login Discord
4. Discord OAuth → Autorisation
5. Discord redirect → Supabase callback
6. Supabase créé session
7. Redirect → members.epihack.tech/auth/callback
8. Callback redirect → /dashboard
```

#### Configuration Nécessaire

**Discord** :
```
Redirect URIs:
- https://asgvycffaqvkceibdrqe.supabase.co/auth/v1/callback
```

**Supabase** :
```
Site URL: https://members.epihack.tech

Redirect URLs:
- https://members.epihack.tech/auth/callback
- https://members.epihack.tech/*
```

**Déjà implémenté** dans ton code à `/0x2a/page.tsx` !

---

## 🔀 Solution Hybride (Meilleure !)

Avoir **les deux options** :

1. **Site public** : Route secrète `/secret-login` qui redirect vers membres
2. **Site membres** : Route `/0x2a` avec Konami Code (backup/direct)

### Pourquoi les deux ?

- Public → Membres : Pour partager facilement le lien aux nouveaux
- Direct membres : Pour les membres qui connaissent déjà

### Configuration Supabase (Hybride)

**Site URL** : `https://epihack.tech` (site principal)

**Redirect URLs** :
```
https://epihack.tech/auth/callback
https://epihack.tech/*
https://members.epihack.tech/auth/callback
https://members.epihack.tech/*
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
```

---

## 📝 Implémentation Recommandée

### 1. Site Principal (`epihack.tech`)

**Créer `/secret-login/page.tsx`** :
```tsx
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function SecretLoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=https://members.epihack.tech`,
      },
    });
    
    if (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button 
        onClick={handleLogin}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
      >
        Accès Membres → Discord Login
      </button>
    </div>
  );
}
```

**Créer `/auth/callback/route.ts`** :
```ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect where specified
  return NextResponse.redirect(next);
}
```

### 2. Site Membres (`members.epihack.tech`)

**Déjà fait !** Tu as `/0x2a` avec Konami Code.

**Optionnel** - Ajouter `/auth/callback/route.ts` si pas déjà fait :
```ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

---

## 🍪 Session Partagée entre Domaines

### Important : Les sessions Supabase sont liées au projet

Tant que les deux sites utilisent le **même projet Supabase** (même `NEXT_PUBLIC_SUPABASE_URL`), la session sera partagée !

**Comment ça marche** :
- Supabase stocke le token dans les cookies
- Les cookies sont au niveau du domaine `supabase.co`
- Les deux sites peuvent lire la même session

### Vérification

Si l'user est connecté sur `epihack.tech` et visite `members.epihack.tech` :
```ts
const { data: { session } } = await supabase.auth.getSession();
// ✅ session existe sur les deux domaines !
```

---

## 🎯 Recommandation Finale

### Configuration Optimale

1. **Supabase** :
   - Site URL: `https://epihack.tech`
   - Redirect URLs: Les deux domaines + localhost

2. **Discord** :
   - Une seule Redirect URI: `https://asgvycffaqvkceibdrqe.supabase.co/auth/v1/callback`

3. **Site Public** (epihack.tech) :
   - Route `/secret-login` → Login Discord → Redirect vers `members.epihack.tech`
   - Simple, facile à partager

4. **Site Membres** (members.epihack.tech) :
   - Garde ton `/0x2a` avec Konami Code (backup/fun)
   - Page principale `/` → Dashboard si auth, lockscreen sinon

### Flow Final

**Pour les nouveaux membres** :
```
Partager: epihack.tech/secret-login
→ Login Discord
→ Auto-redirect vers members.epihack.tech
→ Dashboard
```

**Pour les membres avancés** :
```
Direct: members.epihack.tech/0x2a
→ Konami Code
→ Login Discord
→ Dashboard
```

---

## ✅ Checklist de Configuration

**Supabase** :
- [x] Discord provider activé
- [ ] Site URL = `https://epihack.tech`
- [ ] Redirect URLs incluent les deux domaines
- [ ] Même projet Supabase pour les 2 sites

**Site Public (epihack.tech)** :
- [ ] Route `/secret-login` créée
- [ ] Route `/auth/callback` créée
- [ ] Variables env Supabase configurées

**Site Membres (members.epihack.tech)** :
- [x] Route `/0x2a` avec Konami Code
- [ ] Route `/auth/callback` existe
- [x] Variables env Supabase configurées
- [x] Middleware activé

**Discord** :
- [ ] Redirect URI Supabase ajouté
- [ ] Client ID et Secret dans Supabase

---

**Besoin d'aide pour implémenter quelque chose ?** 🚀
