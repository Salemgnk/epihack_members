# HTB Link Debug Info

## Problème
Username "Scorpi777" non trouvé par l'API HTB

## Cause probable
L'endpoint `/search/users` ne fonctionne probablement pas avec un App Token, ou nécessite des permissions spéciales.

## Solution temporaire
Utiliser l'ID HTB au lieu du username

### Comment trouver votre ID HTB
1. Allez sur votre profil HTB : https://app.hackthebox.com/profile
2. Regardez l'URL, elle sera : `https://app.hackthebox.com/profile/VOTRE_ID`
3. Copiez ce numéro (ex: 123456)

## Alternative à implémenter
Modifier le formulaire pour accepter soit:
- Username (fallback)
- User ID (méthode fiable)
