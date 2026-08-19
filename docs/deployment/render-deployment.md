# Render Deployment Preparation - Kanda Backend

## Render Configuration

### Service Type
Web Service

### Root Directory
backend

### Build Command
npm install && npx prisma generate && npm run build

### Start Command
npm run start:prod

### Node Version
20.x (specified via engines field in package.json)

### Environment Variables
Based on `docs/cloud-environment.md`, the following environment variables are required for the Render Web Service:

| VARIABLE | PURPOSE | REQUIRED | SECRET |
|----------|---------|----------|--------|
| DATABASE_URL | PostgreSQL connection string for Supabase | YES | YES |
| DIRECT_URL | Direct database connection (optional, for Prisma migrations) | NO | YES |
| JWT_SECRET | Secret key for signing JWT tokens | YES | YES |
| JWT_EXPIRATION | JWT token expiration time (e.g., 7d, 24h) | NO | NO |
| FIREBASE_PROJECT_ID | Firebase project ID | YES | NO |
| FIREBASE_PRIVATE_KEY | Firebase Admin SDK private key | YES | YES |
| FIREBASE_CLIENT_EMAIL | Firebase Admin SDK client email | YES | NO |
| APPYPAY_API_KEY | AppyPay API key | YES | YES |
| APPYPAY_SECRET_KEY | AppyPay secret key | YES | YES |
| SUPABASE_URL | Supabase project URL | YES | NO |
| SUPABASE_ANON_KEY | Supabase anonymous key | YES | NO |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | YES | YES |
| GEMINI_API_KEY | Gemini Flash API key | YES | YES |
| GOOGLE_VISION_API_KEY | Google Cloud Vision API key | YES | YES |
| GEMINI_SHOPPING_PROMPT | Prompt for Gemini shopping list extraction | NO | NO |
| CORS_ORIGIN | Comma-separated list of allowed origins (e.g., https://frontend.vercel.app) | YES | NO |
| NODE_ENV | Node environment (set to "production") | YES | NO |
| PORT | Port to listen on (provided by Render) | NO | NO |

### Health Check
NOT CONFIGURED YET (recommend implementing GET /health endpoint)

### Database
Supabase PostgreSQL (external service, not hosted on Render)

## Security
- No hardcoded secrets in source code
- All secrets managed via Render environment variables
- Environment variables marked as secret in Render dashboard
- CORS_ORIGIN must be set to specific Vercel frontend domains (no wildcards)
- Rate limiting via NestJS ThrottlerModule is active

## Existing Render Configuration
The file `docs/deployment/render.yaml` exists but is **NOT** suitable for use because:
1. It includes n8n and WAHA services (which are prohibited in this phase)
2. It assumes a Render-hosted PostgreSQL database (we are using Supabase)
3. It includes REDIS_URL and N8N_* variables (which we have removed)
4. It does not include prisma generate in the build command
5. It references a health check path (`/health`) that does not yet exist

This document supersedes that configuration for the backend service.

## Deployment Checklist
[ ] Create Render Web Service
[ ] Connect repository: MendeOliv/kanda-system
[ ] Select branch: master
[ ] Set root directory: backend
[ ] Configure build command: `npm install && npx prisma generate && npm run build`
[ ] Configure start command: `npm run start:prod`
[ ] Set Node version: 20.x (via engines in package.json or Render settings)
[ ] Add required environment variables (see table above)
[ ] Ensure DATABASE_URL points to Supabase PostgreSQL
[ ] Ensure CORS_ORIGIN is set to Vercel frontend URL(s) after frontend deployment
[ ] Trigger initial deployment
[ ] Verify build succeeds
[ ] Verify service starts without errors
[ ] Test API reachability (e.g., GET /api)
[ ] Test database connection (via API endpoint that queries DB)
[ ] Test Firebase authentication (login flow)
[ ] Test Gemini API (e.g., automation parse endpoint)
[ ] Test AppyPay sandbox (webhook endpoint validation)

## Risks
1. **Missing Health Check**: Without a health endpoint, Render may not detect unhealthy instances. Mitigation: Implement GET /health endpoint post-deployment.
2. **CORS Misconfiguration**: If CORS_ORIGIN is not set correctly, frontend cannot call backend. Mitigation: Set after Vercel domain is known.
3. **Environment Variable Omission**: Missing a required variable will cause startup failure. Mitigation: Use checklist to verify all variables.
4. **Prisma Client Generation**: If Prisma Client not generated, runtime errors. Mitigation: Ensure `npx prisma generate` runs in build.
5. **Supabase Connection**: Incorrect DATABASE_URL will prevent database access. Mitigation: Verify connection string from Supabase dashboard.

## Final Status
READY TO DEPLOY

The backend has been prepared for Render deployment with all necessary adjustments made. The codebase is clean, tests pass, and the configuration is cloud-native. Only the health check endpoint remains as a recommended (non-blocking) enhancement.