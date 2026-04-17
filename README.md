# PharmaFlow / Pharmapp Production Deployment Guide

This repository contains:

- `frontend/`: Next.js 14 application
- `backend/`: NestJS API with Prisma
- PostgreSQL as the database

This guide prepares the project for a standard Linux VPS deployment on Octanium without Docker.

## 1. Repository analysis

### Application structure

- Frontend framework: Next.js 14 App Router
- Backend framework: NestJS 10
- ORM: Prisma 5
- Database: PostgreSQL
- File uploads: stored on disk in `UPLOAD_DIR`
- Auth: JWT access + refresh tokens

### Important scripts

#### Backend

```bash
cd backend
npm run build
npm run start:prod
npm run prisma:migrate
npm run prisma:seed:prod
```

#### Frontend

```bash
cd frontend
npm run build
npm run start
```

## 2. Production-ready changes already applied

The repo has been updated to be VPS-friendly:

- upload storage now uses a shared env-driven absolute path
- backend now binds on `0.0.0.0`
- backend CORS supports `CORS_ORIGINS`
- frontend API fallback now uses `/api` instead of leaking `localhost`
- frontend asset URLs use a shared runtime helper
- env templates were sanitized
- PM2 config was added in `ecosystem.config.js`
- README now documents no-Docker deployment

## 3. Required environment files

Create these files on the VPS:

- `/var/www/pharmapp/shared/config/backend.env`
- `/var/www/pharmapp/shared/config/frontend.env`

### Backend env

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://pharmaflow:STRONG_DB_PASSWORD@127.0.0.1:5432/pharmaflow?schema=public
FRONTEND_URL=https://app.example.com
CORS_ORIGINS=https://app.example.com,https://www.app.example.com
UPLOAD_DIR=/var/www/pharmapp/shared/uploads
JWT_SECRET=GENERATE_A_LONG_RANDOM_SECRET
JWT_REFRESH_SECRET=GENERATE_ANOTHER_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GMAIL_USER=
GMAIL_PASS=
```

### Frontend env

```env
NEXT_PUBLIC_API_URL=https://app.example.com/api
INTERNAL_API_URL=http://127.0.0.1:4000/api
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 4. Recommended server layout

```text
/var/www/pharmapp/
  current/
    backend/
    frontend/
    ecosystem.config.js
  shared/
    config/
      backend.env
      frontend.env
    uploads/
```

## 5. Octanium VPS setup

These commands assume Ubuntu/Debian.

### Install system packages

```bash
sudo apt update
sudo apt install -y curl git unzip build-essential nginx postgresql postgresql-contrib
```

### Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### Install PM2

```bash
sudo npm install -g pm2
pm2 -v
```

## 6. Upload the project

If you are deploying from a ZIP:

```bash
mkdir -p /var/www/pharmapp
cd /var/www/pharmapp
mkdir -p current shared/config shared/uploads
```

Upload the ZIP, then:

```bash
cd /var/www/pharmapp
unzip pharmapp.zip -d release
cp -r release/backend current/
cp -r release/frontend current/
cp release/ecosystem.config.js current/
rm -rf release
```

If the ZIP extracts into a top-level folder, adjust the `cp` source path accordingly.

## 7. PostgreSQL setup

### Create the production database

```bash
sudo -u postgres psql
```

Inside `psql`:

```sql
CREATE USER pharmaflow WITH PASSWORD 'STRONG_DB_PASSWORD';
CREATE DATABASE pharmaflow OWNER pharmaflow;
GRANT ALL PRIVILEGES ON DATABASE pharmaflow TO pharmaflow;
\q
```

## 8. Export the current pgAdmin database

From pgAdmin on your local machine:

1. Right-click the source database.
2. Choose `Backup...`
3. Format: `Plain`
4. File name: `pharmaflow.sql`
5. Click `Backup`

If you prefer `pg_dump` directly:

```bash
pg_dump -h localhost -U postgres -d pharma_db -F p -f pharmaflow.sql
```

## 9. Import the database on the VPS

Copy `pharmaflow.sql` to the server, then run:

```bash
psql "postgresql://pharmaflow:STRONG_DB_PASSWORD@127.0.0.1:5432/pharmaflow" -f pharmaflow.sql
```

After import, apply Prisma migrations so the schema matches the codebase:

```bash
cd /var/www/pharmapp/current/backend
cp /var/www/pharmapp/shared/config/backend.env .env
npm install
npx prisma migrate deploy
```

If the imported database already contains all tables and migration history is missing, use this safer sequence:

```bash
cd /var/www/pharmapp/current/backend
cp /var/www/pharmapp/shared/config/backend.env .env
npm install
npx prisma db pull
npx prisma migrate status
```

If `migrate deploy` complains because the production DB was created outside Prisma, stop there and reconcile migration history before forcing changes.

## 10. Install app dependencies

### Backend

```bash
cd /var/www/pharmapp/current/backend
cp /var/www/pharmapp/shared/config/backend.env .env
npm ci
npm run build
npx prisma migrate deploy
```

Optional seed:

```bash
npm run prisma:seed:prod
```

### Frontend

```bash
cd /var/www/pharmapp/current/frontend
cp /var/www/pharmapp/shared/config/frontend.env .env.production
npm ci
npm run build
```

## 11. Start with PM2

From the project root on the server:

```bash
cd /var/www/pharmapp/current
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

Useful PM2 commands:

```bash
pm2 status
pm2 logs pharmapp-backend
pm2 logs pharmapp-frontend
pm2 restart pharmapp-backend
pm2 restart pharmapp-frontend
pm2 reload all
```

## 12. Nginx reverse proxy

Create `/etc/nginx/sites-available/pharmapp`:

```nginx
server {
    listen 80;
    server_name app.example.com www.app.example.com;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:4000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/pharmapp /etc/nginx/sites-enabled/pharmapp
sudo nginx -t
sudo systemctl reload nginx
```

If you want HTTPS, add Certbot after HTTP is working:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com -d www.app.example.com
```

## 13. Recommended ports

- Next.js frontend: `3000`
- NestJS backend: `4000`
- PostgreSQL: `5432`

Keep PostgreSQL private to the server if possible. Prefer `127.0.0.1` instead of exposing it publicly.

## 14. Manual deployment flow from ZIP to live app

```bash
sudo apt update
sudo apt install -y curl git unzip build-essential nginx postgresql postgresql-contrib
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

mkdir -p /var/www/pharmapp/current /var/www/pharmapp/shared/config /var/www/pharmapp/shared/uploads

# upload pharmapp.zip first
cd /var/www/pharmapp
unzip pharmapp.zip -d release
cp -r release/backend current/
cp -r release/frontend current/
cp release/ecosystem.config.js current/

nano /var/www/pharmapp/shared/config/backend.env
nano /var/www/pharmapp/shared/config/frontend.env

cd /var/www/pharmapp/current/backend
cp /var/www/pharmapp/shared/config/backend.env .env
npm ci
npm run build
npx prisma migrate deploy

cd /var/www/pharmapp/current/frontend
cp /var/www/pharmapp/shared/config/frontend.env .env.production
npm ci
npm run build

cd /var/www/pharmapp/current
pm2 start ecosystem.config.js
pm2 save
```

Then configure Nginx and test:

```bash
curl http://127.0.0.1:4000/api/health
curl -I http://127.0.0.1:3000
pm2 status
```

## 15. Validation checklist

- `curl http://127.0.0.1:4000/api/health` returns `200`
- `pm2 status` shows both apps `online`
- `npm run build` succeeds in both `backend` and `frontend`
- uploads directory exists at `/var/www/pharmapp/shared/uploads`
- `NEXT_PUBLIC_API_URL` points to the public domain, not localhost
- `INTERNAL_API_URL` points to `http://127.0.0.1:4000/api`
- backend `.env` has the correct `DATABASE_URL`
- Nginx proxies `/`, `/api/`, and `/uploads/`

## 16. Common errors and fixes

### `P1001: Can't reach database server`

Cause:
- bad `DATABASE_URL`
- PostgreSQL not running
- wrong user/password

Fix:

```bash
sudo systemctl status postgresql
psql "postgresql://pharmaflow:STRONG_DB_PASSWORD@127.0.0.1:5432/pharmaflow"
```

### Prisma client errors after deploy

Cause:
- dependencies installed but Prisma client not regenerated

Fix:

```bash
cd /var/www/pharmapp/current/backend
npx prisma generate
npm run build
pm2 restart pharmapp-backend
```

### Frontend works but API calls fail

Cause:
- wrong `NEXT_PUBLIC_API_URL`
- wrong Nginx `/api/` proxy
- backend process down

Fix:

```bash
pm2 logs pharmapp-backend
curl http://127.0.0.1:4000/api/health
```

### Uploaded files return 404

Cause:
- `UPLOAD_DIR` does not exist
- Nginx `/uploads/` block missing
- files stored in a different path than configured

Fix:

```bash
mkdir -p /var/www/pharmapp/shared/uploads
ls -la /var/www/pharmapp/shared/uploads
pm2 restart pharmapp-backend
```

### CORS errors in browser

Cause:
- missing `FRONTEND_URL` or `CORS_ORIGINS`

Fix:

```env
FRONTEND_URL=https://app.example.com
CORS_ORIGINS=https://app.example.com,https://www.app.example.com
```

Then:

```bash
pm2 restart pharmapp-backend
```

## 17. Notes about the current local pgAdmin database

Because the database currently lives locally and is managed with pgAdmin:

- export it first as a plain SQL dump
- import it on the VPS PostgreSQL instance
- only then run `npx prisma migrate deploy`

That order preserves your existing data while still aligning production with Prisma migrations.
