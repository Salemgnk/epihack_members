# 🔄 Configuration Route /connect sur Site Principal

## Ce qu'il faut créer sur `epihack.tech`

### Route `/connect` - Redirection Simple

**Fichier à créer** : `app/connect/page.tsx` (ou `pages/connect.tsx` si Pages Router)

```tsx
'use client';

import { useEffect } from 'react';

export default function ConnectPage() {
  useEffect(() => {
    // Redirect immédiat vers le site membres
    window.location.href = 'https://members.epihack.tech/0x2a';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-green-400 font-mono">Redirection vers le portail membres...</p>
      </div>
    </div>
  );
}
```

### Alternative : Redirection Server-Side (Plus rapide)

**Fichier** : `app/connect/route.ts`

```ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect('https://members.epihack.tech/0x2a');
}
```

---

## Flow Final

### Pour les nouveaux membres
```
1. Partager: epihack.tech/connect
2. Redirect automatique → members.epihack.tech/0x2a
3. Konami Code (↑↑↓↓←→←→BA)
4. Login Discord
5. Dashboard
```

### Pour les membres qui connaissent
```
1. Direct: members.epihack.tech/0x2a
2. Konami Code
3. Login Discord
4. Dashboard
```

---

## Configuration Supabase (Simplifié)

Vu que le login se fait uniquement sur `members.epihack.tech`, la config est simple :

### Discord Developer Portal
```
Redirect URIs:
- https://asgvycffaqvkceibdrqe.supabase.co/auth/v1/callback
```

### Supabase Dashboard

**Site URL**:
```
https://members.epihack.tech
```

**Redirect URLs**:
```
https://members.epihack.tech/auth/callback
https://members.epihack.tech/*
http://localhost:3000/auth/callback
http://localhost:3000/*
```

---

## Communication aux Membres

### Message type
```
🔐 Accès au portail membres EPIHACK :

Nouvelle route publique : epihack.tech/connect
→ Redirige automatiquement vers le portail

OU

Direct (si tu connais) : members.epihack.tech/0x2a
→ Entre le code secret (Konami Code)

Une fois sur la page, utilise le code classique pour révéler le vrai login 🎮
```

---

## Résumé

**Site Principal** (`epihack.tech`) :
- Route `/connect` → Simple redirect vers `members.epihack.tech/0x2a`
- Aucune logique d'auth
- Juste un pont vers le site membres

**Site Membres** (`members.epihack.tech`) :
- Déjà configuré avec `/0x2a` + Konami Code
- Gère toute l'authentification
- Dashboard, profils, etc.

✅ **Simple, propre, sécurisé !**
