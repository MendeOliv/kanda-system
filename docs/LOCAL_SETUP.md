# ==========================================
# KANDA SYSTEM - LOCAL DEVELOPMENT SETUP
# Quick Start Guide
# ==========================================

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Git
- Node.js 20+ (for local CLI tools, optional)

---

## 🚀 Quick Start (5 minutes)

### 1. Clone Repository
```bash
cd ~/projects
git clone <your-repo-url>
cd kanda-system
```

### 2. Copy Environment File
```bash
cp docker/.env.example docker/.env
# Edit docker/.env if needed (defaults work for local dev)
```

### 3. Start All Services
```bash
cd docker
docker-compose -f docker-compose.dev.yml up -d
```

### 4. Verify Services are Running
```bash
docker-compose -f docker-compose.dev.yml ps
```

Expected output:
```
NAME                 STATUS          PORTS
kanda-postgres-dev   running         5433/tcp
kanda-redis-dev      running         6379/tcp
kanda-backend-dev    running         3002/tcp
kanda-n8n-dev        running         5679/tcp
kanda-waha-dev       running         8000/tcp (mapped from 3000)
```

---

## 🌐 Access Services

### Backend API
- **URL**: http://localhost:3002
- **Health Check**: http://localhost:3002/api
- **API Docs** (if Swagger enabled): http://localhost:3002/api

### Frontend (Optional - Run Separately)
```bash
cd frontend
npm install
npm run dev
# Access: http://localhost:3000
```

### n8n Workflow Engine
- **URL**: http://localhost:5679
- **Username**: admin (from `.env` N8N_USER)
- **Password**: password (from `.env` N8N_PASSWORD)
- **Documentation**: http://localhost:5679/

### WAHA WhatsApp API
- **URL**: http://localhost:8000
- **API Base**: http://localhost:8000/api
- **Status Check**: http://localhost:8000/api/status

### PostgreSQL Database
- **Host**: localhost
- **Port**: 5433
- **User**: kanda_user (from `.env` DB_USER)
- **Password**: kanda_password (from `.env` DB_PASSWORD)
- **Database**: kanda_dev (from `.env` DB_NAME)

**Connection String**:
```
postgresql://kanda_user:kanda_password@localhost:5433/kanda_dev
```

**Connect with psql**:
```bash
psql "postgresql://kanda_user:kanda_password@localhost:5433/kanda_dev"
```

**Connect with DBeaver** (recommended GUI):
- Host: localhost
- Port: 5433
- Database: kanda_dev
- Username: kanda_user
- Password: kanda_password

### Redis Cache
- **URL**: redis://localhost:6379
- **Redis CLI**: `redis-cli -p 6379`
- **Commands**:
  ```bash
  # Check connection
  redis-cli ping
  # Returns: PONG
  
  # View all keys
  redis-cli KEYS "*"
  
  # View specific key
  redis-cli GET key_name
  ```

---

## 📝 Common Development Tasks

### View Logs for a Service
```bash
# Backend logs
docker-compose -f docker-compose.dev.yml logs backend

# n8n logs
docker-compose -f docker-compose.dev.yml logs n8n

# All logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Rebuild Backend Image (after package.json changes)
```bash
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml up -d backend
```

### Stop All Services
```bash
docker-compose -f docker-compose.dev.yml down
```

### Remove All Data (CAREFUL!)
```bash
docker-compose -f docker-compose.dev.yml down -v
# This removes volumes, so postgres/redis data is cleared
```

### Run Database Migrations
```bash
# From backend container
docker-compose -f docker-compose.dev.yml exec backend npm run migrate

# Or locally
DATABASE_URL="postgresql://kanda_user:kanda_password@localhost:5433/kanda_dev" npx prisma db push
```

### Access Backend Container Shell
```bash
docker-compose -f docker-compose.dev.yml exec backend sh
# Now inside container, run commands like:
# npm run build
# npm test
# npm run lint
```

### Access PostgreSQL Container
```bash
docker-compose -f docker-compose.dev.yml exec postgres psql -U kanda_user -d kanda_dev
```

---

## 🔥 Hot Reload Setup

### Backend (NestJS) - Automatic
- Backend is configured with volume mounts for hot-reload
- Any changes to `/backend/src/**` files auto-trigger rebuild
- No manual restart needed
- Check logs: `docker-compose -f docker-compose.dev.yml logs -f backend`

### Frontend (Next.js) - Run Locally
Backend hot-reload works in Docker, but for frontend we recommend running locally:

```bash
cd frontend
npm install
npm run dev

# Then access: http://localhost:3000
# Changes auto-reload immediately
# Frontend connects to backend at: http://localhost:3002
```

---

## 🐛 Debugging

### Service Won't Start
```bash
# Check specific service logs
docker-compose -f docker-compose.dev.yml logs backend

# Check if port is already in use
# Linux/Mac:
lsof -i :3002

# Windows (PowerShell):
netstat -ano | findstr :3002

# Kill process on port (if needed)
# Linux/Mac: kill -9 <PID>
# Windows: taskkill /PID <PID> /F
```

### Database Connection Issues
```bash
# Test PostgreSQL connection from host
psql "postgresql://kanda_user:kanda_password@localhost:5433/kanda_dev"

# Test from backend container
docker-compose -f docker-compose.dev.yml exec backend npm run test:db

# View postgres logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Redis Connection Issues
```bash
# Test Redis connection
redis-cli -p 6379 ping

# Check Redis memory
redis-cli INFO memory

# View redis logs
docker-compose -f docker-compose.dev.yml logs redis
```

### Service Health Checks Failing
```bash
# Check health status
docker-compose -f docker-compose.dev.yml ps

# If unhealthy, check specific service logs and restart:
docker-compose -f docker-compose.dev.yml restart backend
```

---

## 📦 Useful Docker Commands

### List All Services
```bash
docker-compose -f docker-compose.dev.yml ps
```

### List All Images
```bash
docker images | grep kanda
```

### List All Volumes
```bash
docker volume ls | grep kanda
```

### Inspect a Service
```bash
docker-compose -f docker-compose.dev.yml exec backend docker info
```

### Clean Up (Remove Stopped Containers)
```bash
docker-compose -f docker-compose.dev.yml down --remove-orphans
```

### Prune All Docker Resources (CAREFUL!)
```bash
docker system prune -a --volumes
```

---

## 🌍 Environment Variables Reference

Key variables for local development (from `.env`):

```
NODE_ENV=development                                # Switches to dev mode
DATABASE_URL=postgresql://kanda_user:kanda_password@postgres:5432/kanda_dev
REDIS_URL=redis://redis:6379
JWT_SECRET=your-jwt-secret-key-change-in-production
N8N_WEBHOOK_URL=http://n8n:5678                    # Internal to Docker network
WAHA_API_URL=http://waha:8000                      # Internal to Docker network
LOG_LEVEL=debug                                    # Verbose logging for development
NEXT_PUBLIC_API_URL=http://localhost:3002          # Frontend connects to backend
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

To change values:
1. Edit `docker/.env`
2. Restart service: `docker-compose -f docker-compose.dev.yml restart backend`

---

## 📊 Example Workflow

### 1. Start Development Environment
```bash
cd docker
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml ps
```

### 2. Create Database Tables (if first time)
```bash
cd backend
DATABASE_URL="postgresql://kanda_user:kanda_password@localhost:5433/kanda_dev" npx prisma db push
```

### 3. Run Frontend Locally
```bash
cd frontend
npm install
npm run dev
```

### 4. Develop & Test
- Edit code in `backend/src/` or `frontend/` 
- Changes auto-reload (hot-reload)
- Test at http://localhost:3000

### 5. Configure n8n Workflows
- Access http://localhost:5679
- Create workflows
- Connect to backend API at http://backend:3001 (from within n8n)

### 6. Stop Everything
```bash
cd docker
docker-compose -f docker-compose.dev.yml down
```

---

## 🔗 Integration Testing

### Backend → PostgreSQL
```bash
# Backend auto-connects via DATABASE_URL
# Verify in backend logs: "Database connected"
```

### Backend → Redis
```bash
# Backend auto-connects via REDIS_URL
# Verify in backend logs: "Redis connected"
```

### n8n → PostgreSQL
```bash
# n8n auto-connects via DB_POSTGRESDB_* variables
# Check n8n UI: Settings → Database → Connected
```

### Backend → n8n
```bash
# Create test endpoint in backend that calls n8n webhook
# e.g., POST /api/workflows/trigger
curl -X POST http://localhost:3002/api/workflows/trigger \
  -H "Content-Type: application/json" \
  -d '{"workflow": "test"}'
```

### Frontend → Backend
```bash
# Frontend calls backend via NEXT_PUBLIC_API_URL
# Example: fetch('http://localhost:3002/api/users')
```

---

## 📞 Need Help?

- Backend Issues? Check: `docker-compose -f docker-compose.dev.yml logs backend`
- Database Issues? Check: `docker-compose -f docker-compose.dev.yml logs postgres`
- Redis Issues? Check: `docker-compose -f docker-compose.dev.yml logs redis`
- n8n Issues? Check: `docker-compose -f docker-compose.dev.yml logs n8n`
- WAHA Issues? Check: `docker-compose -f docker-compose.dev.yml logs waha`

---

**Happy Coding! 🚀**
