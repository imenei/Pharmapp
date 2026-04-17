# Deploiement Octanium

Ce dossier contient les fichiers utiles pour preparer l'hebergement sur Octanium.

## Fichiers

- `backend.env.example` : modele d'environnement backend
- `frontend.env.example` : modele d'environnement frontend
- `nginx.pharmapp.conf` : exemple de virtual host Nginx

## Chemins recommandes sur le serveur

- `/var/www/pharmapp/current`
- `/var/www/pharmapp/shared/config`
- `/var/www/pharmapp/shared/uploads`

## Etapes principales

1. Installer Node.js 20, PostgreSQL, Nginx et PM2.
2. Copier le projet dans `/var/www/pharmapp/current`.
3. Creer :
   - `/var/www/pharmapp/shared/config/backend.env`
   - `/var/www/pharmapp/shared/config/frontend.env`
4. Adapter les domaines dans les fichiers `.env`.
5. Lancer dans `backend/` :
   - `npm ci`
   - `npm run build`
   - `npx prisma migrate deploy`
6. Lancer dans `frontend/` :
   - `npm ci`
   - `npm run build`
7. Demarrer les apps avec PM2 depuis la racine du projet.
8. Activer Nginx puis HTTPS.

## Valeurs a remplacer avant production

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `GMAIL_USER`
- `GMAIL_PASS`

## Domaine configure

- domaine principal : `pharmaflowdz.com`
- domaine `www` : `www.pharmaflowdz.com`
- IP serveur : `87.98.160.37`

## Note importante

Le mot de passe PostgreSQL actuel fourni est `ghogho`. Tu peux t'en servir pour le premier deploiement si c'est volontaire, mais il est fortement recommande de le changer avant la mise en production publique.
