# Martin Manampisoa

## Envoi du formulaire de contact

Le formulaire envoie les messages depuis une fonction Vercel vers la boîte Gmail configurée, via l’API Gmail. Les identifiants restent côté serveur.

1. Dans Google Cloud, créez un projet, activez l’API Gmail, configurez l’écran de consentement OAuth et ajoutez l’adresse Gmail de réception comme utilisateur autorisé.
2. Créez un client OAuth de type « Application Web » avec `https://developers.google.com/oauthplayground` comme URI de redirection autorisée.
3. Dans [OAuth 2.0 Playground](https://developers.google.com/oauthplayground), activez « Use your own OAuth credentials » dans les paramètres, renseignez le client OAuth, autorisez le scope `https://www.googleapis.com/auth/gmail.send` avec la boîte de réception, puis échangez le code d’autorisation contre les jetons. Copiez le jeton de rafraîchissement.
4. Dans Google Cloud Console, ouvrez **API et services > Identifiants**, puis le client OAuth 2.0 de type **Application Web** :
   - `GMAIL_CLIENT_ID` est le champ **ID client** (il se termine par `.apps.googleusercontent.com`).
   - `GMAIL_CLIENT_SECRET` est le champ **Code secret du client** du même client OAuth.
   - Ce ne sont ni l’identifiant du projet Google Cloud, ni les clés API.
5. Dans les variables d’environnement du projet Vercel, ajoutez :
   - `CONTACT_GMAIL_ADDRESS` : adresse Gmail de réception.
   - `GMAIL_REFRESH_TOKEN` : jeton de rafraîchissement OAuth.
   - `GMAIL_CLIENT_ID` et `GMAIL_CLIENT_SECRET` : les valeurs du client OAuth décrit ci-dessus.
6. Redéployez le site après avoir ajouté les variables.

Le fichier `.env.example` donne un modèle des variables à renseigner. Pour le développement local, copiez-le vers `.env.local`, remplacez les valeurs fictives, et ne partagez ni ne commitez ce fichier. Pour mettre à jour le profil déjà en production, exécutez `supabase/update-email.sql` dans l’éditeur SQL Supabase. L’adresse de réception configurée est `martin.manampisoa42@gmail.com` : mettez également `CONTACT_GMAIL_ADDRESS` à cette adresse dans les variables Vercel et autorisez ce compte pendant la configuration OAuth Gmail.

Pour développer en local avec l’endpoint actif, utilisez `vercel dev` après avoir renseigné ces variables dans Vercel ou dans un fichier `.env.local` non commité.

Ne placez jamais ces identifiants dans une variable `VITE_*`, dans le dépôt ou dans le navigateur. Les messages ne sont archivés dans Supabase qu’après l’envoi réussi par Gmail.

`CONTACT_GMAIL_ADDRESS` doit être la même boîte que celle autorisée pendant le consentement OAuth : Gmail envoie le message depuis cette adresse, avec l’adresse du visiteur en « Répondre à ». En mode test OAuth, les jetons de rafraîchissement peuvent expirer après sept jours ; publiez/configurez l’écran de consentement pour un usage durable.