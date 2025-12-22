# Debug HTB Points

## Test rapide

Pour vérifier si les points sont attribués, faites ceci :

1. **Déliez votre compte HTB** d'abord
   - Allez dans Supabase Dashboard
   - Table `profiles`
   - Trouvez votre ligne
   - Mettez `htb_username` et `htb_user_id` à `NULL`

2. **Re-link votre compte**
   - Allez sur `/settings/htb`
   - Entrez User ID: `1761582`
   - Cliquez INITIATE LINK

3. **Vérifiez les logs**
   - Dans le terminal `npm run dev`
   - Vous devriez voir :
   ```
   Awarded 50 points for HTB linking
   ```

4. **Vérifiez la DB**
   - Table `points_transactions` : doit avoir 1 ligne
   - Table `member_points_balance` : doit montrer 50 points

Si ça ne marche pas, il y a un problème avec le code points-service.
