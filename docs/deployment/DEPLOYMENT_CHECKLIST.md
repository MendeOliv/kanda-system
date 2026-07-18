# ==========================================
# KANDA SYSTEM - DEPLOYMENT CHECKLIST
# Complete checklist for production deployment
# ==========================================

## 🔵 Phase 1: Pre-Deployment Setup

### 1.1 Create Accounts
- [ ] Supabase account created (https://supabase.com)
- [ ] Upstash account created (https://upstash.com)
- [ ] Render account created (https://render.com)
- [ ] Vercel account created (https://vercel.com)
- [ ] GitHub/GitLab account ready with repository

### 1.2 Configure Development Environment
- [ ] Docker Desktop installed and running
- [ ] `docker-compose.dev.yml` created ✅
- [ ] `.env.example` created ✅
- [ ] Local `.env` copied from `.env.example`
- [ ] Backend `package.json` ready
- [ ] Frontend `package.json` ready with Next.js

### 1.3 Prepare Source Code
- [ ] Repository structure ready:
  - [ ] `/backend` - NestJS application
  - [ ] `/frontend` - Next.js application
  - [ ] `/docker` - Docker configuration
  - [ ] `/docs` - Documentation
- [ ] Environment variables documented
- [ ] `.gitignore` configured
- [ ] Code committed to Git

---

## 🟦 Phase 2: Database & Cache Setup

### 2.1 Supabase PostgreSQL
- [ ] Log in to Supabase dashboard
- [ ] Create new project
  - [ ] Project name: `kanda-prod`
  - [ ] Strong database password set
  - [ ] Region: Closest to target users
- [ ] Project created successfully
- [ ] Get connection string:
  - [ ] Database > Connection > URI (PostgreSQL)
  - [ ] Format: `postgresql://postgres:[REDACTED]@db.[project].supabase.co:5432/postgres`
  - [ ] Save as `DATABASE_URL`
- [ ] Run migrations locally:
  ```bash
  npx prisma db push --skip-generate
  ```
- [ ] Verify tables created in Supabase

### 2.2 Upstash Redis
- [ ] Log in to Upstash dashboard
- [ ] Create Redis database
  - [ ] Name: `kanda-prod-redis`
  - [ ] Region: Same as Render region (Ohio/EU)
  - [ ] Type: Free tier
- [ ] Database created
- [ ] Get Redis connection string:
  - [ ] Copy Redis URL from dashboard
  - [ ] Format: `redis://default:[REDACTED]@[host]:[port]`
  - [ ] Save as `REDIS_URL`
- [ ] Test connection locally:
  ```bash
  redis-cli -u "redis://..." ping
  # Should return: PONG
  ```

---

## 🟩 Phase 3: Backend Deployment (Render)

### 3.1 Prepare Backend Repository
- [ ] Backend code in `/backend` directory
- [ ] `package.json` includes build and start scripts:
  - [ ] `npm run build` compiles TypeScript
  - [ ] `npm run start:prod` runs production server
  - [ ] Or `npm start` defaults to production
- [ ] `.env` example includes all required variables
- [ ] Health check endpoint exists: `GET /health`
- [ ] Code committed to Git

### 3.2 Create Render Backend Service
- [ ] Go to Render dashboard (https://dashboard.render.com)
- [ ] Click "New +" → "Web Service"
- [ ] Connect repository:
  - [ ] Select GitHub/GitLab account
  - [ ] Select `kanda-system` repository
  - [ ] Connect
- [ ] Configure service:
  - [ ] Name: `kanda-backend`
  - [ ] Root Directory: `backend`
  - [ ] Runtime: `Node`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Start Command: `node dist/main` (or `npm run start:prod`)
  - [ ] Environment: Production
  - [ ] Region: Ohio or EU
  - [ ] Plan: Free (or Starter for always-on)

### 3.3 Set Environment Variables
In Render dashboard → Backend service → "Environment":

```
NODE_ENV=production
DATABASE_URL=postgresql://...@db.[project].supabase.co:5432/postgres
REDIS_URL=redis://default:...@[host]:[port]
JWT_SECRET=[GENERATE 40+ CHARACTER RANDOM KEY]
JWT_EXPIRATION=86400
LOG_LEVEL=info
CORS_ORIGIN=https://kanda-system.vercel.app
FIREBASE_PROJECT_ID=[YOUR_FIREBASE_ID]
FIREBASE_PRIVATE_KEY=[YOUR_FIREBASE_KEY]
FIREBASE_CLIENT_EMAIL=[YOUR_FIREBASE_EMAIL]
APPYPAY_API_KEY=[YOUR_APPYPAY_KEY]
APPYPAY_SECRET_KEY=[YOUR_APPYPAY_SECRET]
N8N_WEBHOOK_URL=[TO_BE_SET_AFTER_N8N_DEPLOYMENT]
WAHA_API_URL=[TO_BE_SET_AFTER_WAHA_DEPLOYMENT]
```

- [ ] All variables set
- [ ] Sensitive values from `.env.prod` (not in Git)

### 3.4 Configure Health Check
- [ ] Health Check Path: `/health`
- [ ] Health Check Protocol: HTTP
- [ ] Interval: 10 seconds
- [ ] Timeout: 5 seconds

### 3.5 Deploy Backend
- [ ] Click "Create Web Service"
- [ ] Build starts automatically
- [ ] Build completes (3-5 minutes)
- [ ] Service shows URL: `https://kanda-backend-xxxxx.onrender.com`
- [ ] Status shows "Live"
- [ ] Test endpoint:
  ```bash
  curl https://kanda-backend-xxxxx.onrender.com/health
  # Should return: {"status":"ok"} or similar
  ```
- [ ] Check logs for any errors
- [ ] Update `BACKEND_URL` in notes

---

## 🟨 Phase 4: n8n Workflow Engine (Render)

### 4.1 Create Render n8n Service
- [ ] Render dashboard → "New +" → "Web Service"
- [ ] Deploy existing image:
  - [ ] Image URL: `n8nio/n8n:latest`
  - [ ] Name: `kanda-n8n`
  - [ ] Port: 5678
  - [ ] Region: Same as backend
  - [ ] Plan: Free

### 4.2 Set n8n Environment Variables
```
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=db.[project].supabase.co
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=[SUPABASE_PASSWORD]
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=[STRONG_PASSWORD]
N8N_INTERNAL_KEY=[GENERATE_32_CHAR_KEY]
N8N_WEBHOOK_URL=https://n8n-xxxxx.onrender.com/
WEBHOOK_TUNNEL_URL=https://n8n-xxxxx.onrender.com/
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
```

- [ ] All variables set

### 4.3 Add Persistent Storage
- [ ] Add Disk:
  - [ ] Mount Path: `/home/node/.n8n`
  - [ ] Size: 1GB

### 4.4 Deploy n8n
- [ ] Click "Create Web Service"
- [ ] Service deploys
- [ ] Get URL: `https://n8n-xxxxx.onrender.com`
- [ ] Test access: Open in browser, enter credentials
- [ ] Update `N8N_WEBHOOK_URL` in backend environment

---

## 🟧 Phase 5: WAHA WhatsApp API (Render)

### 5.1 Create Render WAHA Service
- [ ] Render dashboard → "New +" → "Web Service"
- [ ] Deploy existing image:
  - [ ] Image URL: `devlikeapro/waha:latest`
  - [ ] Name: `kanda-waha`
  - [ ] Port: 3000
  - [ ] Region: Same as backend
  - [ ] Plan: Free

### 5.2 Set WAHA Environment Variables
```
WHATSAPP_RESTART_ALL_FAILED_SESSION=false
LOG_LEVEL=info
```

- [ ] Variables set

### 5.3 Add Persistent Storage
- [ ] Add Disk:
  - [ ] Mount Path: `/app/sessions`
  - [ ] Size: 1GB

### 5.4 Deploy WAHA
- [ ] Click "Create Web Service"
- [ ] Service deploys
- [ ] Get URL: `https://waha-xxxxx.onrender.com`
- [ ] Test status endpoint:
  ```bash
  curl https://waha-xxxxx.onrender.com/api/status
  ```
- [ ] Update `WAHA_API_URL` in backend environment

---

## 🟪 Phase 6: Update Backend URLs

### 6.1 Update Backend Environment
In Render backend service → Environment:

- [ ] `N8N_WEBHOOK_URL=https://n8n-xxxxx.onrender.com`
- [ ] `WAHA_API_URL=https://waha-xxxxx.onrender.com`
- [ ] Save changes

### 6.2 Redeploy Backend
- [ ] Backend service → "Manual Deploy"
- [ ] Wait for deployment (2-3 minutes)
- [ ] Verify health check passes

---

## 🟦 Phase 7: Frontend Deployment (Vercel)

### 7.1 Prepare Frontend
- [ ] Frontend code in `/frontend` directory
- [ ] `package.json` includes build script
- [ ] Next.js configuration ready
- [ ] Environment variables in `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=https://kanda-backend-xxxxx.onrender.com
  ```
- [ ] Code committed to Git

### 7.2 Connect to Vercel
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Select `kanda-system` repository
- [ ] Configure:
  - [ ] Framework: Next.js
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`

### 7.3 Set Frontend Environment Variables
```
NEXT_PUBLIC_API_URL=https://kanda-backend-xxxxx.onrender.com
```

- [ ] Variable set
- [ ] Deploy

### 7.4 Verify Frontend
- [ ] Build completes
- [ ] Vercel URL: `https://kanda-system.vercel.app`
- [ ] Open in browser
- [ ] Test API connectivity
- [ ] Check console for errors

---

## 🟪 Phase 8: Update Backend CORS

### 8.1 Add Vercel URL to Backend
In Render backend service → Environment:

- [ ] `CORS_ORIGIN=https://kanda-system.vercel.app`
- [ ] Save

### 8.2 Redeploy Backend
- [ ] Manual Deploy
- [ ] Wait for completion
- [ ] Verify CORS works from frontend

---

## ✅ Phase 9: Final Verification

### 9.1 Test All Services

**Backend API**:
- [ ] `curl https://kanda-backend-xxxxx.onrender.com/health`
- [ ] Should return 200 OK

**Frontend**:
- [ ] Open `https://kanda-system.vercel.app`
- [ ] Should load without CORS errors
- [ ] Test API calls from browser

**Database**:
- [ ] Connect with psql/DBeaver to Supabase
- [ ] Verify tables exist
- [ ] Run test queries

**Redis**:
- [ ] Test with redis-cli
- [ ] Store/retrieve test values

**n8n**:
- [ ] Open `https://n8n-xxxxx.onrender.com`
- [ ] Login with credentials
- [ ] Create test workflow

**WAHA**:
- [ ] `curl https://waha-xxxxx.onrender.com/api/status`
- [ ] Should return status information

### 9.2 Check Logs
- [ ] Render Backend logs: No errors
- [ ] Render n8n logs: No errors
- [ ] Render WAHA logs: No errors
- [ ] Vercel Frontend logs: No build errors

### 9.3 Monitor Services
- [ ] Set up monitoring alerts (optional)
- [ ] Test error handling
- [ ] Document incident response

---

## 🔐 Phase 10: Security Hardening

### 10.1 Secrets Management
- [ ] All secrets in environment variables (not in code)
- [ ] `.env` and `.env.prod` added to `.gitignore`
- [ ] No credentials in Git history
- [ ] Rotate secrets periodically

### 10.2 Database Security
- [ ] Strong database password (40+ chars)
- [ ] Supabase firewall configured (if needed)
- [ ] IP whitelisting enabled (if available)
- [ ] Regular backups enabled (Supabase)

### 10.3 API Security
- [ ] JWT secrets strong (40+ chars)
- [ ] CORS origins restricted to your domain
- [ ] Rate limiting enabled (if available)
- [ ] Input validation implemented

### 10.4 Service Security
- [ ] n8n basic auth enabled with strong password
- [ ] Webhook URLs validated
- [ ] SSL/TLS enabled (automatic on Render/Vercel)
- [ ] HTTPS enforced

---

## 📊 Phase 11: Documentation

### 11.1 Update README
- [ ] Document production URLs
- [ ] Document how to view logs
- [ ] Document emergency procedures

### 11.2 Create Runbook
- [ ] How to restart services
- [ ] How to rollback deployment
- [ ] How to scale services
- [ ] Contact information

### 11.3 Update Deployment Guide
- [ ] Add actual service URLs
- [ ] Add environment variable values (safe to share)
- [ ] Document any custom configurations

---

## 🎯 Post-Deployment

### 11.1 Monitor
- [ ] Check service status daily for first week
- [ ] Monitor error logs
- [ ] Monitor resource usage (CPU, memory, storage)

### 11.2 Backup
- [ ] Enable automated backups (Supabase)
- [ ] Test restore process
- [ ] Document backup schedule

### 11.3 Updates
- [ ] Plan security updates
- [ ] Plan dependency updates
- [ ] Document update process

### 11.4 Scaling
- [ ] Monitor usage metrics
- [ ] Plan for scaling if needed
- [ ] Upgrade to paid plans if necessary

---

## 📞 Troubleshooting

### Service Won't Deploy
- [ ] Check build logs in dashboard
- [ ] Verify environment variables are set
- [ ] Check for syntax errors in code
- [ ] Ensure correct runtime selected

### CORS Errors
- [ ] Verify `CORS_ORIGIN` includes your Vercel URL
- [ ] Redeploy backend after changing
- [ ] Check browser console for exact URL

### Database Connection Failed
- [ ] Verify `DATABASE_URL` is correct
- [ ] Test connection locally with psql
- [ ] Check Supabase dashboard for issues
- [ ] Verify firewall rules (if applicable)

### Cold Starts (Free Plan)
- [ ] Services go to sleep after 15 minutes inactivity
- [ ] Upgrade to paid tier for always-on services
- [ ] Or use application-level health checks

---

**Status**: Ready for Deployment  
**Last Updated**: $(date)  
**Deployment Owner**: [Your Name]
