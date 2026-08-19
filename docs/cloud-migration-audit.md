# Kanda Cloud Migration Audit

## Executive Summary

This audit examines the Kanda-system repository to identify legacy components that can be removed or replaced as part of migrating to a cloud-first architecture targeting Vercel, NestJS Backend, and Supabase PostgreSQL. The audit found that Redis, n8n, and WAHA components are present but can be evaluated for removal, while Firebase and Google Vision are actively used and should be preserved for now. Docker is used for development but not required for the cloud runtime target.

## Current Architecture

The current architecture consists of:
- **Frontend**: Next.js 14 application (not to be modified in this task)
- **Backend**: NestJS 11 application with multiple modules
- **Database**: PostgreSQL with Prisma ORM
- **Infrastructure**: 
  - Redis for caching/queues
  - n8n for workflow automation
  - WAHA for WhatsApp integration
  - Firebase for authentication
  - Google Vision for OCR
  - Gemini for LLM capabilities
  - AppyPay for payments
  - Docker Compose for development environment

## Target Architecture

The target cloud-first architecture:
- **Frontend**: Vercel (Next.js 14)
- **Backend**: NestJS 11 
- **Database**: Supabase PostgreSQL (replacing direct PostgreSQL connection)
- **Authentication**: Firebase (to be evaluated for Supabase Auth replacement)
- **File Storage**: To be determined
- **Queue System**: To be determined (replacing Redis/BullMQ)
- **Workflows**: Native NestJS automation service (replacing n8n)
- **WhatsApp**: Isolated adapter (to be implemented later)
- **OCR**: Google Vision (to be evaluated for Gemini multimodal replacement)
- **LLM**: Gemini (current implementation)
- **Payments**: AppyPay (current implementation)

## Redis Audit

### Findings:
- **Package Dependencies**: `redis: ^4.6.0` in package.json
- **Imports**: No direct imports found in source code (search returned 0 results)
- **Runtime Usage**: No runtime usage found in source code
- **Environment Variables**: `REDIS_URL=redis://redis:6379` in .env.example
- **Docker/Compose Usage**: 
  - Defined in docker-compose.dev.yml (service: redis)
  - Referenced in backend service environment (REDIS_URL: redis://redis:6379)
  - Health check defined
- **Documentation Usage**: Not found in docs search
- **CI/CD Usage**: Not found in repository search

### Classification: LEGACY
Redis appears to be configured but not actually used in the application code. No imports or runtime usage found in the source code.

## n8n Audit

### Findings:
- **Package Dependencies**: No explicit n8n package found (n8n runs as separate container)
- **Imports**: 
  - `N8NInternalKeyGuard` imported in:
    - `backend/src/auth/auth.module.ts`
    - `backend/src/automation/automation.controller.ts`
- **Runtime Usage**: 
  - `N8NInternalKeyGuard` used as @UseGuards in AutomationController
  - Workflow entity contains `n8nWorkflowId` field
- **Environment Variables**: 
  - `N8N_USER`, `N8N_PASSWORD`, `N8N_INTERNAL_KEY` in .env.example
  - `N8N_WEBHOOK_URL` referenced in docker-compose.dev.yml
- **Docker/Compose Usage**:
  - Defined in docker-compose.dev.yml (service: n8n)
  - Volumes mount for workflows: `../backend/n8n-workflows:/home/node/.n8n/workflows:ro`
- **Documentation Usage**: 
  - `docs/workflows/n8n-workflows.md` exists
  - `docs/workflows/ai-agent.md` references automation
- **Workflow Files**: 
  - `backend/n8n-workflows/whatsapp-shopping-list.json` - WhatsApp shopping list workflow
  - This workflow integrates with backend automation API and WAHA

### Classification: USED (but replaceable)
n8n is actively used through the N8NInternalKeyGuard for securing automation endpoints and the Workflow entity stores n8n workflow IDs. The n8n workflow defines WhatsApp shopping list processing that calls backend APIs.

## WAHA Audit

### Findings:
- **Package Dependencies**: No explicit WAHA package found
- **Imports**: No direct imports found in source code
- **Runtime Usage**: 
  - Referenced in n8n workflow for sending WhatsApp messages
  - `WAHA_API_URL` used in n8n workflow
- **Environment Variables**: 
  - `WAHA_API_URL=http://waha:8000` in .env.example
  - `WHATSAPP_TOKEN`, `WAHA_SESSION_NAME`, `WAHA_API_KEY` in docker-compose.dev.yml
- **Docker/Compose Usage**:
  - Defined in docker-compose.dev.yml (service: waha)
  - Volumes for sessions and files
  - Ports: 8000:3000
- **Documentation Usage**: Not explicitly found
- **Endpoints**: No WAHA-specific endpoints found in backend (integration happens via n8n workflow)

### Classification: USED (but replaceable)
WAHA is used through the n8n workflow for sending WhatsApp messages. No direct backend endpoints depend on WAHA.

## Docker Audit

### Findings:
- **Dockerfile**: Multi-stage build for NestJS backend (production)
- **Dockerfile.dev**: Development Dockerfile with hot-reload
- **.dockerignore**: Present
- **docker-compose.dev.yml**: 6-service development stack (postgres, redis, backend, n8n, waha, frontend)
- **docker-compose.yml**: Not found (only dev version exists)

### Container Purposes:
1. **postgres**: PostgreSQL 16-alpine database
2. **redis**: Redis 7-alpine cache
3. **backend**: NestJS application (built from ../backend)
4. **n8n**: Workflow engine 
5. **waha**: WhatsApp API gateway
6. **frontend**: Next.js application

### Classification:
- **REQUIRED FOR DEVELOPMENT**: Yes (local development environment)
- **REQUIRED FOR CI**: Not found in repository (GitHub Actions not examined)
- **LEGACY**: No (actively used for development)
- **NOT REQUIRED FOR CLOUD RUNTIME**: Yes (target is Vercel + managed services)

## Firebase Audit

### Findings:
- **Package Dependencies**: `firebase-admin` implicitly used
- **Imports**: 
  - FirebaseModule imported in app.module.ts and auth.module.ts
  - FirebaseService, FirebaseStrategy, FirebaseAuthGuard used throughout
- **Runtime Usage**: 
  - User entity has `firebaseUid` field (unique)
  - Auth guards and strategies for Firebase token verification
  - User service methods for finding/creating by Firebase UID
  - Orders service accepts firebaseUid for lookup
- **Environment Variables**: 
  - `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` in .env.example
- **Docker/Compose Usage**: Referenced in backend service environment
- **Documentation Usage**: Not explicitly found
- **Frontend Usage**: 
  - `frontend/src/lib/firebase.ts` exists (Firebase client initialization)
  - Used in various frontend components

### Classification: USED
Firebase is actively used for authentication throughout the application. Both backend and frontend depend on it.

### Recommendation: 
Can be evaluated for replacement with Supabase Auth, but requires significant changes to auth flow. Should not be removed in this phase.

## Google Vision Audit

### Findings:
- **Package Dependencies**: `@google-cloud/vision` implicitly used
- **Imports**: 
  - GoogleVisionProvider imported in automation.module.ts and automation.service.ts
  - Used in automation.service.spec.ts for testing
- **Runtime Usage**: 
  - GoogleVisionProvider initialized with API key from config
  - Used in automation.service.ts for OCR text extraction from images
  - Falls back to regex parsing if not configured
- **Environment Variables**: 
  - `GOOGLE_VISION_API_KEY` in .env.example
- **Docker/Compose Usage**: Not explicitly found
- **Documentation Usage**: Not explicitly found

### Classification: USED
Google Vision is used for OCR in the shopping list automation flow when images are provided. It has a fallback mechanism.

### Recommendation:
Could potentially be replaced by Gemini multimodal capabilities, but requires testing. Should not be removed in this phase.

## Gemini Audit

### Findings:
- **Package Dependencies**: `@google/generative-ai` explicitly used
- **Imports**: 
  - GeminiProvider imported in automation.module.ts and automation.service.ts
  - Used in automation.service.spec.ts for testing
- **Runtime Usage**: 
  - GeminiProvider initialized with API key from config
  - Used in automation.service.ts for parsing shopping list text via LLM
  - Falls back to regex parsing if not configured
- **Environment Variables**: 
  - `GEMINI_API_KEY` in .env.example
  - `GEMINI_SHOPPING_PROMPT` for shopping list parsing
- **Docker/Compose Usage**: Not explicitly found
- **Documentation Usage**: Not explicitly found
- **Model Used**: gemini-2.0-flash
- **Direct DB Access**: No evidence of Gemini having direct database access

### Classification: USED
Gemini is used for LLM-powered shopping list parsing in the automation flow. It has a fallback mechanism and is not a source of truth.

### Compliance: 
Gemini is not used as a source of truth - it processes input and returns structured data that is then validated against the product catalog.

## AppyPay Audit

### Findings:
- **Package Dependencies**: No explicit AppyPay SDK found (appears to be REST API integration)
- **Imports**: 
  - AppyPayProvider imported in payments.module.ts and payments.service.ts
  - Used in payments.controller.spec.ts and payments.service.spec.ts for testing
- **Runtime Usage**: 
  - AppyPayProvider initialized with API keys from config
  - Used in payments.service.ts for creating payments
  - Webhook endpoint in payments.controller.ts for handling AppyPay callbacks
- **Environment Variables**: 
  - `APPYPAY_API_KEY`, `APPYPAY_SECRET_KEY` in .env.example
  - `APPYPAY_WEBHOOK_SECRET` implied in payments.controller.ts
- **Docker/Compose Usage**: Referenced in backend service environment
- **Documentation Usage**: Not explicitly found
- **Webhook**: POST /api/v1/payments/webhook with HMAC-SHA256 verification
- **Idempotency**: Handled via unique `appypayTransactionId` constraint

### Classification: USED
AppyPay is actively used for payment processing with proper webhook security and idempotency.

## Prisma Audit

### Findings:
- **schema.prisma** contains:
  - User model with `firebaseUid` (String, @unique)
  - Workflow model with `n8nWorkflowId` (String?, @unique) 
  - Other models: Product, Order, Payment, etc. (no obvious legacy fields)
- **Migration History**: 
  - `20260811080701_add_brand_relation` migration shows n8nWorkflowId column creation
  - Unique index created on Workflow.n8nWorkflowId

### Classification:
- **firebaseUid**: USED (Firebase authentication)
- **n8nWorkflowId**: USED (n8n workflow tracking) but replaceable
- Other models appear to be core business logic

### Recommendation:
n8nWorkflowId can be removed if n8n is replaced, but requires migration consideration.

## Environment Variables Audit

| VARIABLE | USED BY | REQUIRED | LEGACY | ACTION |
|----------|---------|----------|--------|--------|
| DB_USER | Backend, Docker | Yes | No | Keep |
| DB_PASSWORD | Backend, Docker | Yes | No | Keep |
| DB_NAME | Backend, Docker | Yes | No | Keep |
| JWT_SECRET | Backend, Docker | Yes | No | Keep |
| JWT_EXPIRATION | Backend, Docker | Yes | No | Keep |
| FIREBASE_PROJECT_ID | Backend, Frontend, Docker | Yes | No | Keep (for now) |
| FIREBASE_PRIVATE_KEY | Backend, Docker | Yes | No | Keep (for now) |
| FIREBASE_CLIENT_EMAIL | Backend, Docker | Yes | No | Keep (for now) |
| APPYPAY_API_KEY | Backend, Docker | Yes | No | Keep |
| APPYPAY_SECRET_KEY | Backend, Docker | Yes | No | Keep |
| N8N_USER | Backend, Docker | Yes (for n8n) | Maybe | Evaluate |
| N8N_PASSWORD | Backend, Docker | Yes (for n8n) | Maybe | Evaluate |
| N8N_INTERNAL_KEY | Backend, Docker, n8n workflow | Yes | Maybe | Evaluate |
| N8N_WEBHOOK_URL | Docker | Yes (for n8n) | Maybe | Evaluate |
| WAHA_API_URL | Backend (via n8n), Docker | Yes (for WAHA) | Maybe | Evaluate |
| WHATSAPP_TOKEN | Docker | Yes (for WAHA) | Maybe | Evaluate |
| WAHA_SESSION_NAME | Docker | Yes (for WAHA) | Maybe | Evaluate |
| WAHA_API_KEY | Docker | Yes (for WAHA) | Maybe | Evaluate |
| SUPABASE_URL | Not found in current files | No | Yes | Remove from template? |
| SUPABASE_ANON_KEY | Not found in current files | No | Yes | Remove from template? |
| SUPABASE_SERVICE_ROLE_KEY | Not found in current files | No | Yes | Remove from template? |
| GEMINI_API_KEY | Backend, Docker | Yes | No | Keep |
| GOOGLE_VISION_API_KEY | Backend, Docker | Yes | No | Keep |
| GEMINI_SHOPPING_PROMPT | Backend, Docker | Yes | No | Keep |
| REDIS_URL | Backend, Docker | No (not used in code) | Yes | Remove |
| LOG_LEVEL | Backend, Docker | Yes | No | Keep |

## Dependency Audit

### backend/package.json Key Dependencies:
- `@nestjs/*`: Required (NestJS framework)
- `@prisma/client`: Required (ORM)
- `firebase-admin`: Required (Firebase Auth)
- `@google/generative-ai`: Required (Gemini LLM)
- `@google-cloud/vision`: Required (Google Vision OCR)
- `redis`: **NOT USED IN CODE** - Candidate for removal
- `bullmq`: Not found (if present would be Redis-related)
- `axios`: Likely used for HTTP calls (keep)
- `@nestjs/jwt`: Required (JWT auth)
- `@nestjs/passport`: Required (auth strategies)
- `passport`: Required (auth)
- `@nestjs/config`: Required (config management)
- `@nestjs/swagger`: For documentation (keep)
- `@nestjs/testing`: For tests (keep)
- `jest`: For testing (keep)
- `@types/*`: Type definitions (keep)
- `typescript`: Required (keep)
- `reflect-metadata`: Required (keep)

## Files Recommended for Removal

Based on the audit, the following files/components are recommended for removal in Phase 2:

1. **Redis-related**:
   - Redis dependency in package.json
   - REDIS_URL environment variable
   - Redis service from docker-compose.dev.yml
   - Redis volume from docker-compose.dev.yml
   - Redis health check from backend service in docker-compose.dev.yml
   - Redis port mapping from docker-compose.dev.yml

2. **n8n-related** (if replacement implemented):
   - N8NInternalKeyGuard (if authentication method changes)
   - n8nWorkflowId field from Workflow entity (if n8n replaced)
   - n8n service from docker-compose.dev.yml
   - n8n volumes from docker-compose.dev.yml
   - n8n environment variables from backend service
   - n8n-workflows directory (if workflows moved to backend)
   - N8N_* environment variables from .env.example

3. **WAHA-related** (if WhatsApp adapter implemented):
   - WAHA service from docker-compose.dev.yml
   - WAHA volumes from docker-compose.dev.yml
   - WAHA environment variables from backend service
   - WHATSAPP_TOKEN, WAHA_SESSION_NAME, WAHA_API_KEY from .env.example
   - WAHA_API_URL from .env.example
   - n8n workflow file (if replaced by direct backend integration)

4. **Docker-related** (for production runtime):
   - Note: Docker files should be kept for development even if not used in production

## Files That Must Be Preserved

All core business logic must be preserved:
- **Products**: Product creation, catalog, inventory
- **Categories**: Category management
- **Brands**: Brand management
- **Authentication**: Firebase auth flow
- **Orders**: Order creation, management, tracking
- **Stock**: Inventory management
- **Payments**: AppyPay integration
- **Gemini**: LLM capabilities for shopping list parsing
- **Google Vision**: OCR capabilities (with fallback)
- **Admin**: Administrative functions
- **Users**: User management
- **Automation**: Native NestJS automation service

## Risks

1. **Breaking Changes**: Removing n8nWorkflowId or N8NInternalKeyGuard without proper replacement could break automation endpoints
2. **Authentication Flow**: Changing from Firebase to Supabase Auth would require significant frontend/backend changes
3. **OCR Functionality**: Removing Google Vision without adequate Gemini multimodal replacement could degrade image-based shopping list processing
4. **WhatsApp Integration**: Removing WAHA without implementing the promised isolated adapter would break WhatsApp functionality
5. **Development Environment**: Removing Docker Compose would impact local development experience
6. **Data Migration**: Changing schema (removing fields) requires careful migration planning

## Migration Plan

### Phase 1 Complete: Audit
- [x] Repository structure mapped
- [x> Redis usage verified
- [x] n8n usage verified
- [x] WAHA usage verified
- [x] Docker usage verified
- [x] Firebase usage verified
- [x] Google Vision usage verified
- [x] Gemini usage verified
- [x] AppyPay usage verified
- [x] Prisma schema audited
- [x] Environment variables audited
- [x] Dependencies audited

### Phase 2: Legacy Cleanup (After Audit Approval)
1. **Remove Redis** (confirmed not used in code)
   - Remove redis dependency from package.json
   - Remove REDIS_URL from .env.example
   - Remove Redis service, volume, port, and health check from docker-compose.dev.yml
   - Remove Redis environment variable from backend service in docker-compose.dev.yml

2. **Evaluate n8n replacement** 
   - Determine if AutomationController can use different auth guard
   - Consider if n8nWorkflowId can be removed from schema
   - Plan for moving workflow logic to native NestJS services

3. **Evaluate WAHA replacement**
   - Plan for isolated WhatsApp adapter implementation (future phase)
   - Consider if current n8n workflow can be replaced

4. **Update Documentation**
   - Mark removed components as LEGACY in documentation
   - Update architecture diagrams

5. **Run Validation**
   - npm install
   - npx prisma generate
   - npm run build
   - npm test

## Final Recommendation

**Immediate Actions (Phase 2)**:
1. Remove Redis completely - verified not used in codebase
2. Keep n8n and WAHA for now but mark for future replacement with isolated adapters
3. Keep Firebase, Google Vision, Gemini, and AppyPay - all actively used
4. Keep Docker Compose for development environment
5. Do not modify frontend as instructed
6. Do not implement WhatsApp adapter in this phase

**Component State Table**:

| COMPONENT | CURRENT STATE | TARGET STATE | ACTION |
|-----------|---------------|--------------|--------|
| Redis | Configured but unused in code | Removed | Remove dependency and config |
| n8n | Actively used via N8NInternalKeyGuard and Workflow.n8nWorkflowId | To be replaced with isolated adapter | Evaluate for removal after replacement |
| WAHA | Used via n8n workflow for WhatsApp messaging | To be replaced with isolated adapter | Evaluate for removal after replacement |
| Docker Compose | Used for local development | Keep for development | Preserve (not needed for cloud runtime) |
| Firebase | Actively used for authentication | To be evaluated for Supabase Auth | Preserve for now |
| Google Vision | Actively used for OCR with fallback | To be evaluated for Gemini multimodal | Preserve for now |
| Gemini | Actively used for LLM shopping list parsing | Keep | Preserve |
| AppyPay | Actively used for payment processing | Keep | Preserve |
| Prisma Schema | Contains firebaseUid and n8nWorkflowId | Potentially remove n8nWorkflowId | Evaluate after n8n replacement |
| Environment Variables | Mixed usage | Remove legacy vars | Remove REDIS_URL, evaluate N8N_* and WAHA_* |