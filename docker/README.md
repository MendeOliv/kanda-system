# 🐳 Kanda System - Docker Configuration

Complete Docker setup for Kanda System development and production environments.

---

## 📁 File Structure

```
docker/
├── docker-compose.dev.yml     # Development environment (local)
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore for sensitive files
└── README.md                  # This file
```

---

## 🚀 Development Environment

### Start Services
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Services Running
- **PostgreSQL**: `localhost:5433`
- **Redis**: `localhost:6379`
- **NestJS Backend**: `localhost:3002`
- **n8n**: `localhost:5679`
- **WAHA**: `localhost:8000`

### Environment
Copy `.env.example` to `.env` and update as needed:

```bash
cp .env.example .env
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Stop Services
```bash
docker-compose -f docker-compose.dev.yml down
```

---

## 🏢 Production Environment

### Deployment Targets
- **Backend**: Render
- **Frontend**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash (Redis)
- **Workflows**: n8n on Render
- **WhatsApp**: WAHA on Render

### Setup Instructions
See: `../docs/deployment/DEPLOYMENT.md`

### Quick Checklist
1. ✅ Supabase project created + migrations run
2. ✅ Upstash Redis database created
3. ✅ Render services configured (backend, n8n, waha)
4. ✅ Vercel project connected to GitHub
5. ✅ Environment variables set in all services
6. ✅ CORS origins configured
7. ✅ Health checks verified

---

## 📝 Configuration Files

### docker-compose.dev.yml
Local development setup with:
- PostgreSQL 16 (Alpine)
- Redis 7 (Alpine)
- NestJS Backend (hot-reload enabled)
- n8n workflow engine
- WAHA WhatsApp API

**Features**:
- ✅ Persistent volumes for data
- ✅ Health checks for all services
- ✅ Hot-reload support (backend)
- ✅ Docker network isolation
- ✅ Environment variable configuration

### .env.example
Template with all required environment variables for both dev and production:
- Database credentials
- Redis configuration
- JWT secrets
- Firebase credentials
- Payment gateway (AppyPay)
- n8n configuration
- WAHA configuration
- CORS settings

---

## 🔧 Environment Variables

### Development (.env for docker-compose.dev.yml)

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | Environment mode |
| `DB_USER` | `kanda_user` | PostgreSQL user |
| `DB_PASSWORD` | `kanda_password` | PostgreSQL password |
| `DB_NAME` | `kanda_dev` | PostgreSQL database |
| `DATABASE_URL` | `postgresql://...@postgres:5432/...` | Full connection string |
| `REDIS_URL` | `redis://redis:6379` | Redis connection |
| `JWT_SECRET` | `your-jwt-secret-...` | JWT signing key |
| `N8N_USER` | `admin` | n8n username |
| `N8N_PASSWORD` | `password` | n8n password |
| `N8N_INTERNAL_KEY` | `your-n8n-...` | n8n internal key |
| `LOG_LEVEL` | `debug` | Logging level |

### Production (.env.prod for Render/Vercel deployment)

| Variable | Source | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | Supabase | PostgreSQL production |
| `REDIS_URL` | Upstash | Redis production |
| `NODE_ENV` | Manual | Set to `production` |
| `JWT_SECRET` | Manual | Generate strong secret |
| `N8N_WEBHOOK_URL` | Render | n8n service URL |
| `WAHA_API_URL` | Render | WAHA service URL |
| `NEXT_PUBLIC_API_URL` | Render | Backend API URL |
| `CORS_ORIGIN` | Manual | Vercel frontend URL |

---

## 📊 Database Connection

### Development (Local)
```
Host: localhost
Port: 5433
User: kanda_user
Password: kanda_password
Database: kanda_dev
```

**Connection String**:
```
postgresql://kanda_user:kanda_password@localhost:5433/kanda_dev
```

### Production (Supabase)
```
Host: db.[project-ref].supabase.co
Port: 5432
User: postgres
Database: postgres
```

**Get from**: Supabase Dashboard → Project Settings → Database

---

## 🔗 Service Integration

### Backend → Database
- ✅ Uses `DATABASE_URL` environment variable
- ✅ Connects on startup
- ✅ Health check at `/health`

### Backend → Redis
- ✅ Uses `REDIS_URL` environment variable
- ✅ Caching layer for sessions/data
- ✅ Configured in docker-compose

### Backend → n8n
- ✅ Calls n8n webhooks via `N8N_WEBHOOK_URL`
- ✅ Triggers workflows from API
- ✅ Dev: `http://n8n:5678` (internal)
- ✅ Prod: `https://n8n-xxxxx.onrender.com` (public)

### Backend → WAHA
- ✅ Calls WAHA API via `WAHA_API_URL`
- ✅ Sends/receives WhatsApp messages
- ✅ Dev: `http://waha:8000` (internal)
- ✅ Prod: `https://waha-xxxxx.onrender.com` (public)

### Frontend → Backend
- ✅ Calls backend via `NEXT_PUBLIC_API_URL`
- ✅ Dev: `http://localhost:3002`
- ✅ Prod: `https://backend-xxxxx.onrender.com`

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Linux/Mac: Find process on port 3002
lsof -i :3002

# Windows: Find process on port 3002 (PowerShell)
netstat -ano | findstr :3002

# Kill process
# Linux/Mac: kill -9 <PID>
# Windows: taskkill /PID <PID> /F
```

### Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs backend

# Rebuild container
docker-compose -f docker-compose.dev.yml build --no-cache backend

# Restart
docker-compose -f docker-compose.dev.yml up -d backend
```

### Database Connection Fails
```bash
# Test local connection
psql "postgresql://kanda_user:kanda_password@localhost:5433/kanda_dev"

# Or use DBeaver GUI for easier testing
```

### Volume/Permission Issues
```bash
# Remove volumes and restart
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

---

## 📚 Documentation Links

- **Local Setup Guide**: `../LOCAL_SETUP.md`
- **Deployment Guide**: `../deployment/DEPLOYMENT.md`
- **Docker Official**: https://docs.docker.com
- **Docker Compose**: https://docs.docker.com/compose
- **NestJS Docs**: https://docs.nestjs.com
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **n8n Docs**: https://docs.n8n.io
- **WAHA Docs**: https://github.com/devlikeapro/waha

---

## 🔐 Security Notes

- ✅ Never commit `.env` file (use `.env.example`)
- ✅ Use strong JWT_SECRET in production (40+ characters)
- ✅ Rotate secrets regularly
- ✅ Use separate credentials for dev/prod
- ✅ Don't hardcode secrets in Dockerfile
- ✅ Enable HTTPS in production (handled by Render/Vercel)
- ✅ Whitelist IP addresses if possible
- ✅ Use environment variables for all sensitive data

---

## 📞 Support

For issues:
1. Check logs: `docker-compose -f docker-compose.dev.yml logs -f`
2. Verify environment variables in `.env`
3. Ensure all services are healthy: `docker-compose -f docker-compose.dev.yml ps`
4. Review deployment guide if production issue

**Last Updated**: $(date)
