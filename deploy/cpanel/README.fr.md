# Deploiement cPanel mutualise

Cette procedure est adaptee a un hebergement mutualise cPanel avec :

- `Setup Node.js App`
- `PostgreSQL Databases`
- acces SSH utilisateur cPanel

## Architecture recommandee

Pour eviter les limites du mutualise, on separe les deux applications :

- frontend Next.js : `https://pharmaflowdz.com`
- backend NestJS : `https://api.pharmaflowdz.com`

Cette separation est une inference technique recommandee pour cPanel mutualise. Elle evite d'avoir a faire du reverse proxy par chemin `/api`, ce qui n'est generalement pas configurable sans acces root.

## Pre-requis

1. Dans cPanel, creer le sous-domaine `api.pharmaflowdz.com`.
2. Dans `Setup Node.js App`, verifier que Node.js `20` est disponible.
3. Dans `PostgreSQL Databases`, creer :
   - une base PostgreSQL
   - un utilisateur PostgreSQL
   - puis l'associer a la base

## Important sur PostgreSQL Octenium

Selon Octenium, si tu importes des donnees PostgreSQL, il faut faire l'import initial avec l'utilisateur principal cPanel, car les permissions standards peuvent poser probleme dans phpPgAdmin.

## Variables d'environnement

Backend : voir `backend.env.example`

Frontend : voir `frontend.env.example`

Attention :

- cPanel prefixe souvent les noms PostgreSQL, par exemple `gkuxpybs_pharmaflow`
- adapte donc `DATABASE_URL` avec les vrais noms affiches dans cPanel

## Arborescence recommandee dans ton compte

```text
/home/gkuxpybs/
  apps/
    pharmaflow-backend/
    pharmaflow-frontend/
```

## 1. Deployment du backend

### Upload

Charge le contenu du dossier `backend/` dans :

```text
/home/gkuxpybs/apps/pharmaflow-backend
```

Puis ajoute dans ce dossier :

- un fichier `.env` base sur `deploy/cpanel/backend.env.example`
- un fichier `app.js` avec le contenu de `deploy/cpanel/backend.app.js`

### Installation SSH

Depuis SSH :

```bash
cd ~/apps/pharmaflow-backend
npm ci
npx prisma generate
npm run build
npx prisma migrate deploy
```

Si tu veux injecter les donnees initiales :

```bash
npm run prisma:seed:prod
```

### Setup Node.js App

Dans cPanel > `Setup Node.js App` :

- Node.js version : `20`
- Application mode : `Production`
- Application root : `apps/pharmaflow-backend`
- Application URL : `api` sur le sous-domaine `api.pharmaflowdz.com` si l'interface le propose, sinon directement la racine du sous-domaine
- Application startup file : `app.js`

Ensuite :

- clique `Run NPM Install` si necessaire
- clique `Restart`

## 2. Deployment du frontend

### Upload

Charge le contenu du dossier `frontend/` dans :

```text
/home/gkuxpybs/apps/pharmaflow-frontend
```

Puis ajoute dans ce dossier :

- un fichier `.env.production` base sur `deploy/cpanel/frontend.env.example`

### Build SSH

Depuis SSH :

```bash
cd ~/apps/pharmaflow-frontend
npm ci
npm run build
```

Apres le build, prepare le dossier runtime Passenger :

```bash
mkdir -p ~/apps/pharmaflow-frontend-runtime
cp -r .next/standalone/* ~/apps/pharmaflow-frontend-runtime/
mkdir -p ~/apps/pharmaflow-frontend-runtime/.next
cp -r .next/static ~/apps/pharmaflow-frontend-runtime/.next/
cp -r public ~/apps/pharmaflow-frontend-runtime/
```

Puis cree dans `~/apps/pharmaflow-frontend-runtime/app.js` le contenu de `deploy/cpanel/frontend.app.js`.

### Setup Node.js App

Dans cPanel > `Setup Node.js App` :

- Node.js version : `20`
- Application mode : `Production`
- Application root : `apps/pharmaflow-frontend-runtime`
- Application URL : racine de `pharmaflowdz.com`
- Application startup file : `app.js`

Ensuite clique `Restart`.

## 3. Redemarrage apres modification

Pour le backend :

```bash
cd ~/apps/pharmaflow-backend
mkdir -p tmp
touch tmp/restart.txt
```

Pour le frontend runtime :

```bash
cd ~/apps/pharmaflow-frontend-runtime
mkdir -p tmp
touch tmp/restart.txt
```

## 4. Verification

Frontend :

- `https://pharmaflowdz.com`

Backend :

- `https://api.pharmaflowdz.com/api/health`

Tu dois obtenir un JSON du type :

```json
{"status":"ok"}
```

## 5. Points sensibles

- Si Node 20 n'est pas disponible, Next 14 peut ne pas fonctionner correctement.
- Le frontend doit etre rebuild si `NEXT_PUBLIC_API_URL` change.
- Le backend stocke les uploads sur disque local avec `UPLOAD_DIR=./uploads`, donc assure-toi que le dossier existe et est accessible en ecriture.
- Si l'interface cPanel n'accepte pas la racine du domaine pour l'app frontend, utilise temporairement `www.pharmaflowdz.com` ou un sous-domaine `app.pharmaflowdz.com`.
