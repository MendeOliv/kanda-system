# Kanda — UX Brief

## 1. Objetivo da Interface
Fornecer uma experiência de compra simples, rápida e confiável para moradores do KK5000 e Kilamba que querem reabastecer a despensa sem sair de casa.

## 2. Público-Alvo
- Idade: 25–55 anos
- Dispositivo principal: smartphone (Android predominante)
- Nível de alfabetização digital: básico a intermediário (usam WhatsApp, Facebook, YouTube)
- Motivação: conveniência, evitar filas, garantir disponibilidade de produtos essenciais

## 3. Princípios de Design
- **Clareza acima de tudo:** texto grande, ícones reconhecíveis, cores de alto contraste.
- **Fluxo linear:** poucos passos do catálogo ao checkout.
- **Confiança:** mostrar preço claro, taxa de entrega visível, tempo estimado de entrega.
- **Offline-first mindset:** se perder conexão, mostrar o que já foi carregado e permitir continuar offline (carrinho persistente no localStorage).

## 4. Fluxo Principal (Happy Path)
1. **Landing / Home** – banner com promoção, atalhos para categorias principais.
2. **Lista de Categorias** – 4 ícones grandes (Alimentação, Higiene, Bebidas, Casa).
3. **Lista de Produtos** – grid 2 colunas, imagem, nome, preço/unidade, botão “+”.
4. **Carrinho** – barra inferior fixa mostrando quantidade e total; ao tocar, abre modal.
5. **Checkout** – tela única: endereço (se já salvo, mostrar; senão, pedir zona e referência), taxa de entrega, total, método de pagamento (Dinheiro ou AppyPay), botão “Confirmar Pedido”.
6. **Confirmação** – número do pedido, tempo estimado, opção “Acompanhar no WhatsApp”.

## 5. Componentes Reutilizáveis
- **AppBar** simples com logo e carrinho.
- **ProductCard** (imagem, título, preço, botão adicionar).
- **AddressSelector** (seleção de zona KK5000/Kilamba + campo de referência).
- **OrderStatusBadge** (pendente, confirmado, preparando, etc.).
- **EmptyState** (ilustração + texto amigável).

## 6. Tom de Voz e Mensagens
- Amigável, direto, sem jargões.
- Mensagens de erro: “Ops! Parece que este produto acabou. Tente outro ou atualize mais tarde.”
- Mensagens de sucesso: “Pedido recebido! Seu motoqueiro chegará em ~30 min.”

## 7. Acessibilidade
- Contraste mínimo AA (texto vs fundo).
- Tamanho de toque mínimo 48dp.
- Navegação por tab (web) e suporte a leitores de tela (alt em imagens, rótulos em botões).

## 8. Métricas de Sucesso (MVP)
- Taxa de conclusão do checkout ≥ 60% das sessões que adicionam item ao carrinho.
- Tempo médio de conclusão < 2 minutos.
- NPS (após primeira entrega) ≥ 30.