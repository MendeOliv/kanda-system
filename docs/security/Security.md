# Kanda — Segurança

## 1. Autenticação
- Firebase Auth com papéis via custom claims.
- JWT curto (1h) + refresh token.
- MFA para admin (recomendado).

## 2. Validações
- **Backend obrigatório:** stock, preço, permissões validados no servidor.
- **SQL Injection:** usar Prisma/parametrização (nunca concatenar strings).
- **Input Validation:** class-validator/zod em todas as rotas.

## 3. Webhook (AppyPay)
- Validar assinatura/segredo ANTES de processar.
- Idempotência (`transaction_id` já processado? Ignorar).
- Guardar `raw_webhook_payload` para auditoria.

## 4. IA / WhatsApp
- A IA **nunca** aplica descontos ou preços – só lê da BD.
- Confirmação explícita do cliente obrigatória antes de `create_order`.
- Rate limiting por número de telefone.
- Deteção de abuso (muitos pedidos cancelados seguidos).

## 5. Segredos
- Chaves em `.env` (gitignorado). `.env.example` documenta nomes.
- Nunca logar chaves ou tokens.

## 6. Logs
- Tabela `audit_logs` (prevista no schema para Fase 2).
- Para já, logar mudanças de estado de pedido e alterações de preço/stock.