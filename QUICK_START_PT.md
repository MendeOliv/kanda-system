# 🚀 KANDA SYSTEM - GUIA RÁPIDO EM PORTUGUÊS

## ✅ O que foi configurado?

### 1️⃣ Ambiente Local (Docker Compose)
- ✅ PostgreSQL 16 (base de dados)
- ✅ Redis 7 (cache)
- ✅ NestJS Backend (API)
- ✅ n8n (workflows)
- ✅ WAHA (WhatsApp)

### 2️⃣ Ambiente de Produção
- ✅ Backend → Render
- ✅ Frontend → Vercel
- ✅ Database → Supabase
- ✅ Cache → Upstash

### 3️⃣ Arquivos Criados (12 ficheiros)

```
✅ docker/docker-compose.dev.yml     - Ambiente local completo
✅ docker/.env.example               - Variáveis de ambiente
✅ docker/.env.local.example         - Exemplo com valores locais
✅ docker/README.md                  - Documentação Docker
✅ backend/Dockerfile               - Build de produção
✅ backend/Dockerfile.dev           - Build de desenvolvimento
✅ backend/package.json             - Dependências NestJS
✅ backend/prisma/schema.prisma     - Schema da base de dados
✅ docs/LOCAL_SETUP.md              - Como começar localmente
✅ docs/deployment/DEPLOYMENT.md    - Deploy em produção
✅ docs/deployment/DEPLOYMENT_CHECKLIST.md - Checklist passo a passo
✅ SETUP_COMPLETE.md                - Este resumo
```

---

## 🔥 COMEÇAR RÁPIDO (5 minutos)

### 1. Ir para a pasta docker
```bash
cd C:\Users\UTILIZADOR\kanda-system\docker
```

### 2. Copiar ficheiro .env
```bash
# Windows CMD
copy .env.local.example .env

# Ou editaras o ficheiro com valores personalizados
```

### 3. Subir todos os serviços
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 4. Verificar serviços
```bash
docker-compose -f docker-compose.dev.yml ps
```

Deverá aparecer:
```
NAME                 STATUS
kanda-postgres-dev   running ✅
kanda-redis-dev      running ✅
kanda-backend-dev    running ✅
kanda-n8n-dev        running ✅
kanda-waha-dev       running ✅
```

### 5. Aceder aos serviços

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Backend API | http://localhost:3002 | - |
| n8n | http://localhost:5679 | admin / password |
| WAHA | http://localhost:8000 | - |
| PostgreSQL | localhost:5433 | kanda_user / kanda_password |
| Redis | localhost:6379 | - |

### 6. Parar tudo
```bash
docker-compose -f docker-compose.dev.yml down
```

---

## 📝 Variáveis de Ambiente Importantes

### Desenvolvimento (LOCAL)
```
DATABASE_URL=postgresql://kanda_user:[REDACTED]@postgres:5432/kanda_dev
REDIS_URL=redis://redis:6379
NODE_ENV=development
JWT_SECRET=local-secret-key
```

### Produção (RENDER)
```
DATABASE_URL=postgresql://postgres:XXX@db.XXX.supabase.co:5432/postgres
REDIS_URL=redis://default:XXX@XXX.upstash.io
NODE_ENV=production
JWT_SECRET=[GERAR CHAVE FORTE]
```

---

## 🌐 Fazer Deploy em Produção (50 minutos)

### Passo 1: Preparar Infraestrutura (20 min)
1. Criar conta em https://supabase.com
2. Criar novo projeto PostgreSQL
3. Criar conta em https://upstash.com
4. Criar nova base de dados Redis
5. Executar migrações localmente

### Passo 2: Deploy Backend (10 min)
1. Ir a https://render.com
2. Conectar repositório GitHub
3. Criar novo Web Service
4. Nome: `kanda-backend`
5. Definir variáveis de ambiente
6. Clicar Deploy

### Passo 3: Deploy Frontend (5 min)
1. Ir a https://vercel.com
2. Conectar repositório GitHub
3. Selecionar pasta `frontend`
4. Definir `NEXT_PUBLIC_API_URL` = URL do backend
5. Clicar Deploy

### Passo 4: Configurar CORS (2 min)
1. Ir a Render Backend
2. Adicionar `CORS_ORIGIN=https://seu-dominio-vercel.vercel.app`
3. Redeploy

### Passo 5: Ativar n8n e WAHA (8 min)
1. Deploy n8n no Render (imagem Docker oficial)
2. Deploy WAHA no Render (imagem Docker oficial)
3. Configurar variáveis de ambiente

---

## 🔧 Comandos Úteis

### Logs
```bash
# Ver logs de um serviço
docker-compose -f docker-compose.dev.yml logs backend

# Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Reconstruir
```bash
# Se mudou package.json
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml up -d backend
```

### Base de Dados
```bash
# Aceder ao PostgreSQL
docker-compose -f docker-compose.dev.yml exec postgres psql -U kanda_user -d kanda_dev

# Executar migrações
DATABASE_URL="postgresql://kanda_user:[REDACTED]@localhost:5433/kanda_dev" npx prisma db push
```

### Cache
```bash
# Testar Redis
redis-cli -p 6379 ping
# Deve retornar: PONG
```

---

## 📚 Documentação Detalhada

| Documento | Conteúdo |
|-----------|----------|
| **LOCAL_SETUP.md** | Como desenvolver localmente (commands, portas, troubleshooting) |
| **DEPLOYMENT.md** | Como fazer deploy em produção (step-by-step) |
| **DEPLOYMENT_CHECKLIST.md** | Checklist interativa para deploy |
| **docker/README.md** | Referência completa de Docker |

---

## ⚠️ Cuidados Importantes

### NÃO Fazer Commit
- ❌ Ficheiro `.env` com valores reais
- ❌ Senhas de base de dados
- ❌ Chaves JWT
- ❌ Firebase keys
- ❌ AppyPay keys

### Fazer Commit
- ✅ `.env.example` (com placeholders)
- ✅ `docker-compose.dev.yml`
- ✅ `Dockerfile` files
- ✅ Documentação

### Manter Seguro
- 🔒 Usar `.gitignore` para ignorar `.env`
- 🔒 Gerar JWT_SECRET forte (40+ caracteres aleatórios)
- 🔒 Usar diferentes credenciais dev/prod
- 🔒 Não hardcoding secrets no código

---

## 🐛 Problemas Comuns

### "Port already in use: 3002"
```bash
# Windows
netstat -ano | findstr :3002
taskkill /PID [PID] /F

# Mac/Linux
lsof -i :3002
kill -9 [PID]
```

### Container não inicia
```bash
docker-compose -f docker-compose.dev.yml logs backend
# Ver o erro e corrigir
```

### Não consegue ligar à base de dados
```bash
# Verificar se PostgreSQL está running
docker-compose -f docker-compose.dev.yml ps postgres

# Testar ligação
psql "postgresql://kanda_user:[REDACTED]@localhost:5433/kanda_dev"
```

---

## 🎯 Próximos Passos

### 1. Implementar Backend
- [ ] Criar módulos NestJS (Users, Products, Orders)
- [ ] Implementar autenticação JWT
- [ ] Conectar ao PostgreSQL com Prisma
- [ ] Criar endpoints API

### 2. Implementar Frontend
- [ ] Criar páginas Next.js
- [ ] Implementar componentes UI
- [ ] Ligar à API backend
- [ ] Hot reload testing

### 3. Integração n8n
- [ ] Criar workflows para notificações
- [ ] Conectar ao backend via webhooks
- [ ] Testar executionsLocalmente

### 4. WhatsApp Integration
- [ ] Configurar WAHA com número de teste
- [ ] Criar endpoints para enviar/receber mensagens
- [ ] Integrar com n8n workflows

### 5. Deploy
- [ ] Seguir DEPLOYMENT_CHECKLIST.md
- [ ] Testar tudo em produção
- [ ] Monitorar logs
- [ ] Configurar backups

---

## 💡 Dicas Importantes

✅ **Sempre** começar com `docker-compose.dev.yml` localmente antes de fazer deploy

✅ **Sempre** copiar `.env.example` para `.env` e preencher valores

✅ **Sempre** testar a health check: `curl http://localhost:3002/api`

✅ **Sempre** verificar logs: `docker-compose logs -f`

✅ **Sempre** usar variáveis de ambiente para secrets

✅ **Nunca** fazer commit de `.env` com valores reais

✅ **Nunca** reutilizar secrets entre dev e prod

---

## 📞 Ficheiros Importantes

```
C:\Users\UTILIZADOR\kanda-system\
├── docker/docker-compose.dev.yml  ← Subir ambiente local
├── docker/.env.local.example       ← Copiar para .env
├── backend/Dockerfile             ← Build de produção
├── backend/Dockerfile.dev         ← Build de dev
└── docs/
    ├── LOCAL_SETUP.md            ← Guia completo local
    ├── deployment/
    │   ├── DEPLOYMENT.md         ← Guia completo produção
    │   ├── DEPLOYMENT_CHECKLIST.md
    │   └── render.yaml           ← Configuração Render
    └── SETUP_COMPLETE.md         ← Este ficheiro
```

---

## ✨ Resumo Final

| Aspecto | Status |
|--------|--------|
| ✅ Docker Compose | Configurado |
| ✅ Variáveis de Ambiente | Configuradas |
| ✅ Base de Dados (PostgreSQL) | Pronta |
| ✅ Cache (Redis) | Pronto |
| ✅ Backend (NestJS) | Template |
| ✅ n8n | Integrado |
| ✅ WAHA | Integrado |
| ✅ Deploy Render | Documentado |
| ✅ Deploy Vercel | Documentado |
| ✅ Documentação | Completa |

**Tudo pronto para começar a desenvolver! 🚀**

---

**Última Atualização**: $(date)  
**Status**: ✅ Completo e Operacional
