-- Debug: Vérifier si les points ont été ajoutés

-- 1. Vérifier si la table member_points_balance existe et a des données
SELECT * FROM member_points_balance LIMIT 5;

-- 2. Vérifier les transactions de points
SELECT * FROM points_transactions 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Vérifier votre profile (jointure avec auth.users pour l'email)
SELECT p.id, u.email, p.htb_username, p.htb_user_id, p.current_rank_id
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'gnandisalem@gmail.com';

-- 4. Si pas de balance, créez-en un pour votre compte
-- (Remplacez USER_ID_HERE par votre ID du SELECT ci-dessus)
INSERT INTO member_points_balance (member_id, total_points)
VALUES ('USER_ID_HERE', 0)
ON CONFLICT (member_id) DO NOTHING;

-- 5. Ajouter manuellement les 50 points si nécessaire
INSERT INTO points_transactions (member_id, points, source, description)
VALUES (
  'USER_ID_HERE',
  50,
  'quest_completion',
  'HTB Account Linked - Main Quest Completed (manual fix)'
);

-- 6. Mettre à jour le balance
UPDATE member_points_balance
SET total_points = total_points + 50
WHERE member_id = 'USER_ID_HERE';
