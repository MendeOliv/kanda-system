# Kanda — Workflows n8n (MVP)

## Princípio: Um workflow, uma responsabilidade.

### 1. Atendimento / Novo Pedido
- Trigger: Webhook do WAHA.
- Passos: lookup_customer → IA → create_order.
- Saída: Pedido criado, resumo enviado.

### 2. Novo Cliente → Boas-vindas
- Trigger: lookup_customer devolve "novo".
- Passos: Mensagem de boas-vindas + categorias.

### 3. Webhook de Pagamento (AppyPay)
- Trigger: POST /webhooks/appypay.
- Passos: Validar assinatura → Atualizar payment.status → Se pago, order.status = confirmed.

### 4. Pedido Confirmado → Notificar Loja
- Trigger: order.status muda para confirmed.
- Passos: Envia mensagem interna com resumo.

### 5. Pedido Pronto → Notificar Motoqueiro
- Trigger: Admin marca "pronto".
- Passos: Envia morada + contacto + valor ao motoqueiro.

### 6. Produto Esgotado
- Trigger: stock chega a 0.
- Passos: Marca produto inativo no catálogo (site + IA deixam de mostrar).

### 7. Pedido Cancelado
- Trigger: Cancelamento (cliente/admin).
- Passos: Reverte stock + notifica cliente.