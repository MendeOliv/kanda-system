# Kanda — Especificação da API

**Base:** `/api/v1`
**Auth:** `Bearer <Firebase-Token>`
**Internal:** `X-Internal-Key` (para n8n)

## Públicos
- `GET /categories` - Lista categorias ativas.
- `GET /categories/:id/products` - Produtos de uma categoria.
- `GET /products?search=` - Busca produtos.

## Autenticados (Cliente)
- `POST /cart/items` - Adiciona ao carrinho.
- `DELETE /cart/items/:id` - Remove.
- `POST /checkout` - Cria pedido (valida stock).
- `GET /orders` - Histórico do cliente.
- `POST /orders/:id/repeat` - Repete encomenda.

## Internos (n8n)
- `POST /internal/customers/lookup` - Busca/cria cliente por telefone.
- `GET /internal/catalog/search?q=` - Pesquisa para IA.
- `POST /internal/orders` - Cria pedido via WhatsApp.

## Admin
- `POST /admin/products` - Criar produto.
- `PUT /admin/products/:id` - Editar preço/stock.
- `GET /admin/orders` - Lista todos os pedidos.
- `PUT /admin/orders/:id/status` - Atualiza estado.

## Webhook
- `POST /webhooks/appypay` - Callback da AppyPay (valida assinatura).