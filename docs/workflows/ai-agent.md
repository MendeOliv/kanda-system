# Kanda — IA Agent para WhatsApp

## 1. Objetivo
Um agente de IA (powered by Gemini Flash) que atende clientes via WhatsApp, permitindo:
- Consultar catálogo de produtos.
- Criar pedidos (com confirmação explícita).
- Consultar status de pedidos recentes.
- Enviar boas-vindas e ajuda básica.

## 2. Arquitetura
- **WAHA** (WhatsApp HTTP API) recebe mensagens e encaminha para **n8n**.
- **n8n** desencadeia um workflow que:
  1. Verifica/cria o contexto do usuário na tabela `ai_context`.
  2. Envia a mensagem para o agente de IA (via HTTP request a um endpoint interno `/internal/ai-agent`).
  3. O agente de IA executa ferramentas (tools) definidas no backend.
  4. Retorna a resposta para n8n, que envia de volta ao WhatsApp.
- **Backend (NestJS)** expõe:
  - `POST /internal/ai-agent` – recebe `{ phone, message, context }` e retorna `{ reply }`.
  - Ferramentas (implementadas como endpoints internos protegidos por `X-Internal-Key`):
    - `GET /internal/catalog/search?q=` – retorna lista de produtos (id, nome, preço, estoque).
    - `POST /internal/orders` – cria pedido (recebe dados do carrinho, retorna orderNumber).
    - `GET /internal/orders/latest?phone=` – retorna último pedido do cliente (resumo).
- O agente de IA **não** tem acesso direto ao banco; tudo passa por essas ferramentas.

## 3. Ferramentas (Tools) disponíveis para o agente
| Nome | Descrição | Parâmetros | Retorno |
|------|-----------|------------|---------|
| `search_catalog` | Busca produtos por nome ou categoria. | `{ q: string }` | `{ results: [{ id, name, price, unit_type, stock }] }` |
| `create_order` | Cria um pedido a partir de um carrinho. | `{ items: [{ productId, quantity }], zone, reference, paymentMethod }` | `{ orderNumber, total, deliveryFee, estimatedTime }` |
| `get_latest_order` | Recupera o último pedido do cliente. | `{ phone: string }` | `{ orderNumber, status, total, items }` |
| `get_store_info` | Informações básicas (horário, taxa de entrega por zona). | `{}` | `{ openingHours, deliveryFeeKk5000, deliveryFeeKilamba }` |

## 4. Guardrails (Limites de Segurança)
- O agente **nunca** inventa preços ou descontos; todos os valores vêm das ferramentas.
- Antes de criar um pedido, o agente deve:
  1. Mostrar o resumo do carrinho (produtos, quantidades, subtotal).
  2. Mostrar taxa de entrega e total.
  3. Pedir confirmação explícita ("Confirma o pedido? Responda SIM").
- Só aceita confirmação explícita (sim/yes, ou equivalente em português).
- Se o cliente tentar negociar preço fora da tabela, o agente responde: "Não posso alterar preços. O valor é fixo conforme tabela."
- Rate limiting: máximo de 10 mensagens por minuto por número.
- Armazenamento de contexto: última interação e resumo do último pedido (para facilitar "repetir encomenda").

## 5. Fluxo de Conversa (Exemplo)
1. Cliente: "Oi, quer saber o que têm de arroz?"
2. IA: Usa `search_catalog` com q="arroz", retorna lista.
3. IA: "Temos arroz agulha (R$ 25,00/kg) e arroz parboilizado (R$ 22,00/kg). Qual deseja e em que quantidade?"
4. Cliente: "Dois pacotes de agulha."
5. IA: Confirma: "2 x arroz agulha = R$ 50,00. Taxa de entrega KK5000: R$ 5,00. Total: R$ 55,00. Confirma? (SIM/NÃO)"
6. Cliente: "SIM"
7. IA: Chama `create_order` com os dados, retorna número do pedido.
8. IA: "Pedido #1234 recebido! Seu motochefe sairá em ~30 min. Obrigado!"

## 6. Extensões Futuras
- Integração com cartão de fidelidade.
- Suporte a imagens (cliente envia foto de produto vazio, IA identifica).
- Agendamento de entregas.