# ==========================================
# KANDA SYSTEM - DEPLOYMENT GUIDE
# Production Deployment to Render + Vercel + Supabase + Upstash
# ==========================================

## 📋 Overview

This guide covers the complete production deployment of Kanda System across multiple services:

- **Backend (NestJS)** → Render
- **Frontend (Next.js)** → Vercel  
- **Database (PostgreSQL)** → Supabase
- **Cache (Redis)** → Upstash
- **Workflows (n8n)** → Render
- **WhatsApp API (WAHA)** → Render

All services are free-tier compatible with some limitations.

---

## 🔑 Prerequisites

1. **Render Account**: https://render.com (create if not exists)
2. **Vercel Account**: https://vercel.com (create if not exists)
3. **Supabase Account**: https://supabase.com (create if not exists)
4. **Upstash Account**: https://upstash.com (create if not exists)
5. **Git Repository**: Push your code to GitHub/GitLab
6. **Environment Variables**: Prepare from `docker/.env.example`

---

## 1️⃣ STEP 1: Setup Supabase (PostgreSQL Database)

### 1.1 Create Supabase Project
- Go to https://supabase.com/dashboard
- Click "New Project"
- **Project name**: kanda-prod
- **Database password**: Generate strong password (save it!)
- **Region**: Choose closest to your users
- Click "Create new project"

### 1.2 Wait for Project Creation
- Takes 2-5 minutes
- You'll receive a confirmation email

### 1.3 Get Database Connection String
- Go to **Project Settings** → **Database** → **Connection String**
- Copy the **Connection String** (PostgreSQL URL)
- Format: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`
- Save as `DATABASE_URL` in your environment

### 1.4 Run Database Migrations
In your local machine (with backend code):

```bash
# Install Prisma CLI if not installed
npm install -D prisma

# Run migrations to Supabase
DATABASE_URL="postgresql://..." npx prisma db push

# Or if using plain SQL migrations:
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" < migrations.sql
```

---

## 2️⃣ STEP 2: Setup Upstash (Redis Cache)

### 2.1 Create Upstash Redis Database
- Go to https://console.upstash.com/redis
- Click "Create Database"
- **Name**: kanda-prod-redis
- **Region**: Choose closest to Render region
- **Type**: Free (first 10,000 commands/day)
- Click "Create"

### 2.2 Get Connection String
- Copy the **Redis URL** from the dashboard
- Format: `redis://default:[password]@[host]:[port]`
- Save as `REDIS_URL` in your environment

### 2.3 Test Connection (Local)
```bash
# Install redis-cli or use this command:
redis-cli -u "redis://default:[password]@[host]:[port]" ping
# Should return: PONG
```

---

## 3️⃣ STEP 3: Deploy Backend (NestJS) to Render

### 3.1 Create Render Service
- Go to https://dashboard.render.com
- Click "New +" → "Web Service"
- Choose **GitHub** or **GitLab** connection
- Select your **kanda-system** repository
- **Name**: kanda-backend
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/main`
- **Region**: Choose closest to your users
- **Plan**: Free (limited to 0.5 CPU, 512MB RAM - suitable for low traffic)

### 3.2 Set Environment Variables in Render
In the **Environment** section, add:

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
REDIS_URL=redis://default:[password]@[host]:[port]
JWT_SECRET=[generate-random-secret]
JWT_EXPIRATION=86400
FIREBASE_PROJECT_ID=[your-firebase-id]
FIREBASE_PRIVATE_KEY=[your-firebase-key]
FIREBASE_CLIENT_EMAIL=[your-firebase-email]
APPYPAY_API_KEY=[your-appypay-key]
APPYPAY_SECRET_KEY=[your-appypay-secret]
N8N_WEBHOOK_URL=https://n8n-xxxxx.onrender.com
WAHA_API_URL=https://waha-xxxxx.onrender.com
LOG_LEVEL=info
CORS_ORIGIN=https://your-vercel-domain.vercel.app,https://your-vercel-domain.vercel.app:3000
```

### 3.3 Configure Health Check (Optional but Recommended)
- **Health Check Path**: `/health`
- **Health Check Protocol**: HTTP

### 3.4 Click "Create Web Service"
- Build starts automatically
- Takes 3-5 minutes first time
- You'll get a URL like: `https://kanda-backend-xxxxx.onrender.com`

### 3.5 Verify Deployment
```bash
curl https://kanda-backend-xxxxx.onrender.com/health
# Should return: {"status":"ok"}
```

---

## 4️⃣ STEP 4: Deploy n8n (Workflow Engine) to Render

### 4.1 Create Render Service
- Go to https://dashboard.render.com
- Click "New +" → "Web Service"
- Choose **Deploy an existing image**
- **Image URL**: `n8nio/n8n:latest`
- **Name**: kanda-n8n
- **Port**: 5678
- **Plan**: Free

### 4.2 Set Environment Variables
```
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=db.[project-ref].supabase.co
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=[your-supabase-password]
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=[strong-password]
N8N_INTERNAL_KEY=[generate-32-char-key]
N8N_WEBHOOK_URL=https://n8n-xxxxx.onrender.com/
WEBHOOK_TUNNEL_URL=https://n8n-xxxxx.onrender.com/
```

### 4.3 Add Persistent Disk (Optional - Free plan limited)
- **Mount Path**: `/home/node/.n8n`
- **Size**: 1GB (free tier)

### 4.4 Click "Create Web Service"
- Service deploys
- You'll get a URL: `https://n8n-xxxxx.onrender.com`
- **Username**: admin
- **Password**: [your-password]

---

## 5️⃣ STEP 5: Deploy WAHA (WhatsApp API) to Render

### 5.1 Create Render Service
- Go to https://dashboard.render.com
- Click "New +" → "Web Service"
- Choose **Deploy an existing image**
- **Image URL**: `devlikeapro/waha:latest`
- **Name**: kanda-waha
- **Port**: 3000
- **Plan**: Free

### 5.2 Set Environment Variables
```
WHATSAPP_RESTART_ALL_FAILED_SESSION=false
LOG_LEVEL=info
```

### 5.3 Add Persistent Disk (Required for sessions)
- **Mount Path**: `/app/sessions`
- **Size**: 1GB

### 5.4 Click "Create Web Service"
- You'll get a URL: `https://waha-xxxxx.onrender.com`

---

## 6️⃣ STEP 6: Deploy Frontend (Next.js) to Vercel

### 6.1 Push Code to GitHub
```bash
git push origin main
```

### 6.2 Import to Vercel
- Go to https://vercel.com/dashboard
- Click "Add New..." → "Project"
- Select **kanda-system** repository
- **Root Directory**: `frontend`
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 6.3 Set Environment Variables
- In Vercel dashboard → **Settings** → **Environment Variables**
- Add:

```
NEXT_PUBLIC_API_URL=https://kanda-backend-xxxxx.onrender.com
```

### 6.4 Deploy
- Click "Deploy"
- Takes 2-3 minutes
- You'll get a URL: `https://kanda-system.vercel.app`

### 6.5 Update CORS in Backend
- Go to Render backend settings
- Add Vercel URL to `CORS_ORIGIN`:

```
CORS_ORIGIN=https://kanda-system.vercel.app
```

---

## 7️⃣ STEP 7: Update Backend for Production URLs

Go back to **Render Backend** settings and update:

```
N8N_WEBHOOK_URL=https://n8n-xxxxx.onrender.com
WAHA_API_URL=https://waha-xxxxx.onrender.com
NEXT_PUBLIC_API_URL=https://kanda-system.vercel.app
```

**Redeploy** backend (manual deploy or push to trigger auto-deploy).

---

## 8️⃣ STEP 8: Verify All Services

### Test Backend API
```bash
curl https://kanda-backend-xxxxx.onrender.com/health
```

### Test Frontend
Open: `https://kanda-system.vercel.app`

### Test n8n
Open: `https://n8n-xxxxx.onrender.com` (with credentials)

### Test WAHA
```bash
curl https://waha-xxxxx.onrender.com/api/status
```

### Test Database Connection
```bash
# From backend logs (Render dashboard):
# Should see successful connection to Supabase
```

---

## 📊 Environment Variable Summary

Create a `.env.prod` file (keep safe, don't commit):

```
# .env.prod - Production Environment
NODE_ENV=production

# Supabase
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Upstash
REDIS_URL=redis://default:[password]@[host]:[port]

# Services
BACKEND_URL=https://kanda-backend-xxxxx.onrender.com
FRONTEND_URL=https://kanda-system.vercel.app
N8N_WEBHOOK_URL=https://n8n-xxxxx.onrender.com
WAHA_API_URL=https://waha-xxxxx.onrender.com

# JWT & Security
JWT_SECRET=[strong-secret]
CORS_ORIGIN=https://kanda-system.vercel.app

# Firebase, AppyPay, etc.
[... other keys ...]
```

---

## 🚨 Common Issues & Solutions

### Backend Won't Start
- **Check**: Render logs → look for database connection errors
- **Fix**: Verify `DATABASE_URL` and `REDIS_URL` are correct
- **Fix**: Ensure migrations ran successfully on Supabase

### CORS Errors
- **Check**: Browser console → check exact URL
- **Fix**: Update `CORS_ORIGIN` in backend environment variables
- **Fix**: Redeploy backend after changing variables

### n8n Can't Connect to Database
- **Check**: n8n logs in Render dashboard
- **Fix**: Verify Supabase credentials in n8n environment
- **Fix**: Whitelist Render IP in Supabase (if needed)

### Free Tier Rate Limits
- **Render**: Free tier goes to sleep after 15 minutes of inactivity
  - Solution: Use paid tier ($7/month) for always-on service, or accept cold starts
- **Upstash**: 10,000 commands/day free
  - Solution: Monitor usage, upgrade if exceeded
- **Supabase**: 500MB storage, 2GB egress/month free
  - Solution: Monitor usage, upgrade if needed

### Vercel Build Fails
- **Check**: Vercel build logs
- **Fix**: Ensure `NEXT_PUBLIC_API_URL` is set correctly
- **Fix**: Check for missing dependencies in `package.json`

---

## 🔄 Continuous Deployment Setup

### Backend Auto-Deploy (Render)
- Connected GitHub branch: Render auto-deploys on push to `main`
- **Configuration**: Render dashboard → "Auto-Deploy" enabled

### Frontend Auto-Deploy (Vercel)
- Connected GitHub branch: Vercel auto-deploys on push to `main`
- **Configuration**: Vercel dashboard → "Git" → auto-deploy enabled

### Manual Deploy if Needed

**Render (Backend)**:
- Render dashboard → Select service → "Manual Deploy" → "Deploy Latest Commit"

**Vercel (Frontend)**:
- Vercel dashboard → Select project → "Redeploy" button

---

## 📝 Monitoring & Logs

### View Render Logs
```
https://dashboard.render.com → Select service → Logs tab
```

### View Vercel Logs
```
https://vercel.com/dashboard → Select project → "Deployments" → "Logs"
```

### View Supabase Database Activity
```
https://supabase.com/dashboard → Project → "Logs" → "Postgres"
```

### View Upstash Usage
```
https://console.upstash.com/redis → Select database → Stats
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong (40+ characters, random)
- [ ] Supabase password is strong
- [ ] N8N_INTERNAL_KEY is 32+ characters
- [ ] N8N_BASIC_AUTH_PASSWORD is strong
- [ ] All secrets are in environment variables (NOT in code)
- [ ] CORS_ORIGIN is restricted to your Vercel domain
- [ ] Database URL is not committed to Git (in .env.prod, not tracked)
- [ ] Firebase keys are kept secret
- [ ] AppyPay keys are production keys (not sandbox if production payment)

---

## 📞 Support & Documentation

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Upstash Docs**: https://docs.upstash.com
- **n8n Docs**: https://docs.n8n.io
- **WAHA Docs**: https://github.com/devlikeapro/waha

---

**Version**: 1.0  
**Last Updated**: $(date)  
**Status**: Production Ready
