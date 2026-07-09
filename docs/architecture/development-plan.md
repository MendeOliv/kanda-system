# Kanda — Plano de Desenvolvimento (Sprints)

## Sprint 0 — Fundação (1 dia)
- [ ] Criar repositório com estrutura acima.
- [ ] Configurar Firebase Auth (login por telefone).
- [ ] Configurar Supabase (Postgres) e rodar `prisma migrate`.
- [ ] Script `seed-catalog.ts` com 30 produtos fictícios.
- [ ] Docker Compose local (postgres, redis, backend, frontend) para dev.

## Sprint 1 — Backend Base (3 dias)
- [ ] CRUD de produtos e categorias (API).
- [ ] Autenticação (valida token Firebase).
- [ ] Módulo de clientes (lookup por telefone).

## Sprint 2 — Frontend (4 dias)
- [ ] Home + categorias + listagem de produtos.
- [ ] Página de produto + pesquisa.
- [ ] Carrinho (adicionar/remover).
- [ ] Checkout (morada, zona, taxa de entrega).

## Sprint 3 — Pedidos e Pagamentos (3 dias)
- [ ] Criação de pedido com transação ACID (stock).
- [ ] Integração AppyPay (sandbox) + webhook.
- [ ] Dinheiro à entrega (método offline).

## Sprint 4 — Admin (2 dias)
- [ ] Lista de pedidos + mudança de estado.
- [ ] Atribuição de motoqueiro.
- [ ] Gestão de stock/preços.

## Sprint 5 — WhatsApp + IA (4 dias)
- [ ] WAHA + n8n configurados.
- [ ] Agente IA (Gemini Flash) com tools (search_catalog, create_order).
- [ ] Workflow "Novo Pedido" e "Boas-vindas".
- [ ] Guardrails de segurança.

## Sprint 6 — Integração e Polimento (2 dias)
- [ ] "Repetir encomenda" (histórico).
- [ ] Testes end-to-end (site e WhatsApp).
- [ ] Deploy: Vercel + Render + Supabase.