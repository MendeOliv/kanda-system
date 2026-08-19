# Cloud Environment Variables

This document outlines the environment variables required for deploying the Kanda backend to cloud services.

| VARIABLE | PURPOSE | REQUIRED IN PRODUCTION | SOURCE | SENSITIVE |
|----------|---------|------------------------|--------|-----------|
| DATABASE_URL | PostgreSQL connection string for Supabase | Yes | Supabase Dashboard → Settings → Database → Connection URI | Yes |
| DIRECT_URL | Direct database connection (optional, for Prisma migrations) | No | Supabase Dashboard → Settings → Database → Connection URI (may include ?pgbouncer=true) | Yes |
| JWT_SECRET | Secret key for signing JWT tokens | Yes | Generate randomly (e.g., openssl rand -hex 32) | Yes |
| JWT_EXPIRATION | JWT token expiration time (e.g., 7d, 24h) | No (defaults to 7d if not set) | Application configuration | No |
| FIREBASE_PROJECT_ID | Firebase project ID | Yes | Firebase Console → Project Settings → General | No |
| FIREBASE_PRIVATE_KEY | Firebase Admin SDK private key | Yes | Firebase Console → Project Settings → Service Accounts → Generate new private key | Yes |
| FIREBASE_CLIENT_EMAIL | Firebase Admin SDK client email | Yes | Firebase Console → Project Settings → Service Accounts | No |
| APPYPAY_API_KEY | AppyPay API key | Yes | AppyPay Dashboard → API Keys | Yes |
| APPYPAY_SECRET_KEY | AppyPay secret key | Yes | AppyPay Dashboard → API Keys | Yes |
| SUPABASE_URL | Supabase project URL | Yes | Supabase Dashboard → Project Settings → API | No |
| SUPABASE_ANON_KEY | Supabase anonymous key | Yes | Supabase Dashboard → Project Settings → API → anon public | No |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | Yes | Supabase Dashboard → Project Settings → API → service_role | Yes |
| GEMINI_API_KEY | Gemini Flash API key | Yes | Google AI Studio → Get API key | Yes |
| GOOGLE_VISION_API_KEY | Google Cloud Vision API key | Yes | Google Cloud Console → APIs & Services → Credentials | Yes |
| GEMINI_SHOPPING_PROMPT | Prompt for Gemini shopping list extraction | No (has built-in default) | Application | No |
| CORS_ORIGIN | Comma-separated list of allowed origins (e.g., https://frontend.vercel.app,https://admin.vercel.app) | Yes | Frontend deployment URLs | No |
| NODE_ENV | Node environment (development, production, test) | Yes | Runtime environment | No |
| PORT | Port to listen on (provided by cloud platform) | No (defaults to 3001 if not set) | Runtime environment (Render, Vercel, etc. provide this) | No |

## Notes:

1. **Do not commit actual values** to version control. Use `.env.example` as template.
2. **Supabase**: 
   - DATABASE_URL can be found in Settings → Database → Connection URI
   - For Prisma migrations, you may need to use the connection string without PgBouncer (remove `?pgbouncer=true`)
3. **Firebase**: 
   - Private key must be kept secure and never exposed
   - Service account must have appropriate roles (Firebase Admin Service Agent)
4. **AppyPay**: 
   - Ensure you use production keys for production environment
   - Sandbox keys are for testing only
5. **CORS_ORIGIN**: 
   - Should include all frontend domains that will call the backend
   - Example for Vercel: `https://kanda-frontend.vercel.app,https://kanda-admin.vercel.app`
   - Do not use wildcard (*) in production
6. **PORT**: 
   - Cloud platforms like Render automatically provide PORT environment variable
   - The backend must use this variable (see required change in cloud-readiness-report.md)
7. **NODE_ENV**: 
   - Set to "production" in production environments
   - Affects logging, error handling, and Swagger documentation availability

## Example .env.example (do not copy with real values):

```
# Database
DATABASE_URL=postgresql://user:password@host:port/database
DIRECT_URL=postgresql://user:password@host:port/database?schema=public

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRATION=7d

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@your-firebase-project-id.iam.gserviceaccount.com

# AppyPay (production)
APPYPAY_API_KEY=your_appypay_api_key
APPYPAY_SECRET_KEY=your_appypay_secret_key

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini Flash (LLM)
GEMINI_API_KEY=your_gemini_api_key

# Google Cloud Vision (OCR)
GOOGLE_VISION_API_KEY=your_google_vision_api_key

# Gemini Flash (LLM) - Shopping List Prompt
GEMINI_SHOPPING_PROMPT=Extraia os produtos e quantidades desta lista de compras angolana. Responda APENAS com um array JSON válido. Cada item deve ter obrigatoriamente as chaves: "name" (string), "quantity" (número), "unit" (string ou null).

# Services
CORS_ORIGIN=https://frontend.vercel.app,https://admin.vercel.app
NODE_ENV=production
PORT=10000  # This will be overridden by cloud platform
```