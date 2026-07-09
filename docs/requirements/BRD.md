# Kanda — Documento de Requisitos de Negócio (BRD)

## 1. Contexto
A Kanda é uma mercearia generalista (alimentares, higiene, bebidas, produtos de casa, incluindo gelo e água filtrada) localizada em Luanda, que atende os bairros do KK5000 e Kilamba.

**Ponto de partida:** hoje não existe qualquer canal de encomendas. Tudo é venda presencial.

**Objetivo do projeto:** criar um canal de encomendas (site + WhatsApp com IA) para servir de proposta comercial à Kanda, demonstrando aumento de faturação e redução de trabalho manual.

## 2. Público-Alvo
Moradores do KK5000 e Kilamba, compra de conveniência recorrente (reposição doméstica).

## 3. Catálogo (Fictício para a Proposta)
Para efeitos de demonstração, usaremos um catálogo fictício com 20–30 produtos distribuídos por 4 categorias:
- Alimentares (arroz, óleo, massa, etc.)
- Higiene (sabonete, pasta, detergente)
- Bebidas (água, refrigerantes, sumos)
- Produtos de Casa (gelo, pilhas, velas)

## 4. Modelo de Entrega
- **Entregas:** motoqueiros alugados/terceirizados (sem frota própria).
- **Zonas:** KK5000 e Kilamba (taxa fixa por zona).
- **Horário:** 08h00 às 21h00 (encomendas fora deste horário ficam em fila).

## 5. Pagamento
- **Dinheiro à entrega** (método padrão no MVP).
- **AppyPay (Multicaixa-Express)** – integração via API REST com webhook.

## 6. MVP (Escopo da Proposta)
- Catálogo com 4 categorias + busca.
- Carrinho e checkout.
- Conta de cliente por telefone (Firebase Auth).
- WhatsApp com IA (um agente único) para consulta e fecho de pedido.
- Painel admin básico (produtos, pedidos, atribuição manual de motoqueiro).
- "Repetir última encomenda" (movido para MVP, pois é diferencial).