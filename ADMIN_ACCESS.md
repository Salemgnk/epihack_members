# Accès Admin - Guide Temporaire

## État Actuel

❌ **Pas encore de page admin web**  
✅ **Gestion via Supabase Dashboard**

---

## Comment gérer les Rangs et Points (pour l'instant)

### 1. Modifier les Plafonds de Rangs

**Via Supabase Dashboard** :
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Table Editor** → **ranks**
4. Cliquez sur n'importe quel rang pour éditer
5. Modifiez :
   - `points_required` : Seuil de points
   - `color` : Couleur du rang
   - `display_name` : Nom affiché

**Exemple** : Changer Argent à 150 points au lieu de 100
- Ligne "Argent" → Éditer
- `points_required` : `150`
- Save

### 2. Ajuster les Points d'un Membre

**Via SQL Editor** :
```sql
-- Ajouter 100 points à un membre
INSERT INTO points_transactions (member_id, points, source, description)
VALUES (
  'USER_ID_HERE',
  100,
  'manual_adjustment',
  'Bonus admin'
);

-- Mettre à jour le balance
UPDATE member_points_balance
SET total_points = total_points + 100
WHERE member_id = 'USER_ID_HERE';
```

**Pour trouver le USER_ID** :
```sql
SELECT id, email FROM auth.users WHERE email = 'user@example.com';
```

### 3. Assigner un Titre Spécial

**Via SQL Editor** :
```sql
-- Donner le titre "First Blood" à un membre
INSERT INTO user_titles (user_id, title_id)
VALUES (
  'USER_ID_HERE',
  (SELECT id FROM titles WHERE name = 'first_blood')
);
```

---

## Prochaine Étape : Interface Admin Web

**Fonctionnalités prévues** :
- `/admin/dashboard` : Vue d'ensemble
- `/admin/members` : Liste membres avec ajustement points
- `/admin/ranks` : Gestion rangs (CRUD)
- `/admin/titles` : Gestion titres spéciaux
- `/admin/quests` : Gestion quêtes

**Voulez-vous que je crée cette interface maintenant ?**
