# 📋 KANDA SYSTEM - VALORES DE PRODUÇÃO (TEMPLATE)

Este ficheiro serve como template para guardar os valores reais de produção.
**NÃO fazer commit deste ficheiro com valores reais!**

## 🔐 Supabase (PostgreSQL)

```
Projeto: kanda-prod
URL: https://supabase.com/dashboard/projects

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres
SUPABASE_HOST=db.PROJECT-REF.supabase.co
SUPABASE_PORT=5432
SUPABASE_USER=postgres
SUPABASE_PASSWORD=YOUR_STRONG_PASSWORD
```

Passos:
1. Criar projeto em https://supabase.com
2. Ir a Project Settings → Database
3. Copiar CONNECTION STRING (URI)
4. Guardar em local seguro

## 🔄 Upstash (Redis)

```
Projeto: kanda-prod-redis
URL: https://console.upstash.com/redis

REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT
UPSTASH_HOST=YOUR_HOST.upstash.io
UPSTASH_PORT=12345
UPSTASH_PASSWORD=YOUR_PASSWORD
```

Passos:
1. Criar database em https://upstash.com
2. Ir a Console
3. Copiar REDIS_URL
4. Guardar em local seguro

## 🌐 Render Backend

```
Serviço: kanda-backend
URL: https://kanda-backend-XXXXX.onrender.com

Node: https://github.com/SEU_USERNAME/kanda-system
Branch: main
Build: npm install && npm run build
Start: node dist/main
```

Environment Variables:
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:...@db.....supabase.co:5432/postgres
REDIS_URL=redis://default:...@....upstash.io:12345
JWT_SECRET=GERAR_40_CHARS_ALEATORIOS
CORS_ORIGIN=https://kanda-system.vercel.app
N8N_WEBHOOK_URL=https://kanda-n8n-XXXXX.onrender.com
WAHA_API_URL=https://kanda-waha-XXXXX.onrender.com
```

## 📖 Render n8n

```
Serviço: kanda-n8n
URL: https://kanda-n8n-XXXXX.onrender.com
Imagem: n8nio/n8n:latest
Porta: 5678
```

Environment Variables:
```
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=db.PROJECT-REF.supabase.co
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=SUPABASE_PASSWORD
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=GERAR_SENHA_FORTE
N8N_INTERNAL_KEY=GERAR_32_CHARS_ALEATORIOS
N8N_WEBHOOK_URL=https://kanda-n8n-XXXXX.onrender.com/
WEBHOOK_TUNNEL_URL=https://kanda-n8n-XXXXX.onrender.com/
```

## 📱 Render WAHA

```
Serviço: kanda-waha
URL: https://kanda-waha-XXXXX.onrender.com
Imagem: devlikeapro/waha:latest
Porta: 3000
```

Environment Variables:
```
WHATSAPP_RESTART_ALL_FAILED_SESSION=false
LOG_LEVEL=info
```

## 🎨 Vercel Frontend

```
Projeto: kanda-system
URL: https://kanda-system.vercel.app
Repositório: https://github.com/SEU_USERNAME/kanda-system
Pasta: /frontend
Framework: Next.js
```

Environment Variables:
```
NEXT_PUBLIC_API_URL=https://kanda-backend-XXXXX.onrender.com
```

## 🔑 Secrets (Guardar em Local Seguro)

### JWT Secret
```bash
# Gerar novo:
node -e "console.log(require('crypto').randomBytes(20).toString('hex'))"

# Guardar em:
JWT_SECRET=VALOR_ACIMA_20_BYTES
```

### n8n Internal Key
```bash
# Gerar novo (32 caracteres):
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Guardar em:
N8N_INTERNAL_KEY=VALOR_ACIMA_32_CHARS
```

## 📊 Checklist de Migração de Produção

- [ ] Supabase criado e testado
- [ ] Upstash criado e testado
- [ ] Render backend deployado
- [ ] Render n8n deployado
- [ ] Render WAHA deployado
- [ ] Vercel frontend deployado
- [ ] CORS configurado
- [ ] Todas as variáveis de ambiente definidas
- [ ] Health checks passam
- [ ] Testes end-to-end passam

## 🚀 Ordem de Deployment

1. Supabase (base de dados) - esperar 5 min
2. Upstash (cache) - esperar 2 min
3. Render Backend - esperar 5 min
4. Render n8n - esperar 5 min
5. Render WAHA - esperar 3 min
6. Vercel Frontend - esperar 2 min
7. Configurar CORS no Backend
8. Testar todos os endpoints

Total: ~25 minutos

## 🔗 Links Importantes

- Supabase Dashboard: https://supabase.com/dashboard
- Upstash Dashboard: https://console.upstash.com
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub: https://github.com/SEU_USERNAME

## 📝 Notas

- Manter este ficheiro SEGURO e NÃO fazer commit no Git
- Usar este como template para criar `.env.prod`
- Valores sensíveis: JWT_SECRET, N8N_INTERNAL_KEY, senhas BD
- Replicar a estrutura em outras máquinas/equipas com valores diferentes

**Template Version**: 1.0  
**Status**: Ready for Production Setup
