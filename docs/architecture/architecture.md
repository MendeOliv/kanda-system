# Kanda — Arquitetura do Sistema

## 1. Serviços e Hospedagem (Decidido)
| Componente | Tecnologia | Hospedagem |
|---|---|---|
| Frontend | Next.js (React) | Vercel (gratuito) |
| Backend API | NestJS (Node/TypeScript) | Render (gratuito) |
| Base de Dados | PostgreSQL | Supabase (gratuito) |
| Cache/Estado | Redis | Upstash (gratuito) |
| Automação | n8n | Render (ou Railway) |
| WhatsApp | WAHA (WhatsApp HTTP API) | Render (ou Railway) |

## 2. Princípios
1. **Fonte única de verdade:** preço, stock e estado vivem no backend + BD. Site e WhatsApp são clientes.
2. **Nada confia no frontend:** toda validação (stock, preço, permissões) acontece no backend.
3. **Transações ACID:** stock decrementa na *mesma transação* que a criação do pedido.

## 3. Fluxo de Dados
- Frontend ↔ API Backend (REST)
- WhatsApp → WAHA → n8n → API Backend (endpoints internos `/internal/*` autenticados por `X-Internal-Key`)
- Admin → Frontend (/admin) → API Backend
- AppyPay → Webhook (/webhooks/appypay) → API Backend

## 4. Segurança (Visão Geral)
- Firebase Auth (JWT) com papéis (cliente, admin).
- Rate limiting por endpoint.
- Webhook valida assinatura e é idempotente.
- Segredos em variáveis de ambiente (`.env`), nunca no código.