# Legacy WhatsApp Shopping List Flow (n8n Workflow)

This document describes the legacy n8n workflow `whatsapp-shopping-list.json` that handled WhatsApp-based shopping list processing. It is preserved for reference when implementing the WhatsApp Adapter in Phase 3.

## Overview

The workflow is triggered by a WhatsApp message (text or image) via WAHA, processes the message to extract a shopping list (using OCR/LLM via the backend automation API), formats a reply, sends it back via WAHA, and waits for user confirmation to create an order.

## Detailed Steps

### 1. Trigger: WhatsApp Message
- **Node**: `n8n-nodes-base.webhook`
- **Path**: `whatsapp-shopping-list`
- **Response Mode**: `responseNode` (waits for workflow to finish before responding to WAHA)
- **Description**: Receives the payload from WAHA when a user sends a photo or text message via WhatsApp.
- **Input Payload** (from WAHA):
  - For text: `{ from: '2449XXXXXXXX', body: { type: 'text', text: '2 arroz, 1 óleo' } }`
  - For image: `{ from: '2449XXXXXXXX', body: { type: 'image', url: 'https://...'} }`
  - The workflow normalizes both formats.

### 2. Extract Image & Phone
- **Node**: `n8n-nodes-base.function`
- **Function Code**:
  ```javascript
  // WAHA envia: { from: '2449XXXXXXXX', body: { type: 'image', url: '...' } }
  // ou { from: '...', body: { type: 'text', text: '2 arroz, 1 óleo' } }
  const body = $json.body || $json;
  const from = body.from || body._data?.from;
  const msgBody = body.body || body._data?.body || body;

  let text = null;
  let imageUrl = null;

  if (msgBody.image?.url) {
    imageUrl = msgBody.image.url;
  } else if (msgBody.text) {
    text = msgBody.text;
  } else {
    throw new Error('Mensagem sem texto ou imagem');
  }

  return { phone: from, text, imageUrl };
  ```
- **Output**: `{ phone: string, text: string|null, imageUrl: string|null }`

### 3. Parse via Automation API
- **Node**: `n8n-nodes-base.httpRequest`
- **Method**: POST
- **URL**: `{{$env.API_URL}}/api/v1/automation/parse-shopping-list`
- **Body Parameters**:
  - `text`: `={{ $json.text }}`
  - `imageUrl`: `={{ $json.imageUrl }}`
- **Description**: Calls the backend automation API to parse the shopping list:
  - If `text` is provided, uses regex parsing.
  - If `imageUrl` is provided, uses Google Vision OCR (if configured) or Gemini multimodal (if configured) to extract text, then parses.
  - Performs fuzzy matching against the product catalog.
  - Returns a structured list of recognized products and any unrecognized items.
- **Expected Response Shape**:
  ```json
  {
    "products": [
      { "name": string, "quantity": number, "unit": string|null, "price": number }
    ],
    "unrecognizedItems": [string]
  }
  ```

### 4. Format WhatsApp Reply
- **Node**: `n8n-nodes-base.function`
- **Function Code**:
  ```javascript
  const data = $input.first().json;
  const items = data.products || [];
  let msg = '*���🛒 Lista de Compras Kanda*\\n\\n';

  let total = 0;
  for (const item of items) {
    const line = `- ${item.quantity}x ${item.name} = ${(item.price * item.quantity).toLocaleString()} Kz`;
    msg += `${line}\\n`;
    total += item.price * item.quantity;
  }

  msg += `\\n���💰 Total: ${total.toLocaleString()} Kz`;

  if (data.unrecognizedItems?.length > 0) {
    msg += `\\n\\n��⚠��️ Não encontrado: ${data.unrecognizedItems.join(', ')}`;
  }

  return { phone: $('Extract').item.json.phone, message: msg, products: items, total };
  ```
- **Output**: `{ phone: string, message: string, products: Array, total: number }`

### 5. Send WhatsApp Reply
- **Node**: `n8n-nodes-base.httpRequest`
- **Method**: POST
- **URL**: `{{$env.WAHA_API_URL}}/api/v1/messages`
- **Body Parameters**:
  - `to`: `={{ $json.phone }}`
  - `message`: `={{ $json.message }}`
- **Description**: Sends the formatted message back to the user via WAHA.

### 6. Wait for Confirmation (TBD)
- **Node**: `n8n-nodes-base.wait`
- **Resume**: `webhook`
- **Description**: Awaits a response from the user (Sim/Não) to confirm the order. The workflow expects a webhook POST to `/api/v1/automation/orders/sync` (handled by the backend AutomationController).
- **Note**: This step is marked "TBD" (to be defined) in the original workflow; the actual confirmation mechanism is implemented in the NestJS automation service.

### 7. Order Confirmation & Creation (Handled by Backend)
Although not part of the n8n workflow diagram, the workflow relies on the following backend endpoints (in `AutomationController`):
- `POST /api/v1/automation/parse-shopping-list` (used in step 3)
- `POST /api/v1/automation/orders/sync` (expected by the wait node)

These endpoints perform:
- **Product lookup**: Fuzzy match extracted product names against the `Product` catalog.
- **Stock lookup**: Verify sufficient `Product.stock` for requested quantity.
- **Order creation**: Create an `Order` record with `OrderItem`s, decrement stock, set pending status.
- **Payment handling**: Generate a payment URL via AppyPay provider (or mock if not configured).
- **Response**: Return payment URL and order details to be used in the confirmation message.

## Authentication
- The workflow does not implement its own authentication; it relies on:
  - The backend automation API being accessible (via `API_URL` environment variable).
  - The backend endpoints are protected by the `N8NInternalKeyGuard` (see below).
- The `N8NInternalKeyGuard` validates the `N8N_INTERNAL_KEY` header against the environment variable.

## Error Handling
- The `Extract Image & Phone` node throws an error if the message contains neither text nor image.
- The HTTP request nodes will fail if the backend is unreachable or returns non-2xx; n8n will mark the node as failed and the workflow stops (unless error workflows are defined, which they are not in this workflow).
- The workflow does not have automatic retries; failures must be handled externally (e.g., by monitoring and manual retry).

## Retries
- No built-in retry mechanism in the workflow.
- The backend automation API may have internal retries for external services (e.g., AppyPay, Gemini) but not for the workflow itself.

## Environment Variables Used
- `API_URL`: Base URL of the backend automation API (e.g., `https://kanda-backend.onrender.com`).
- `WAHA_API_URL`: Base URL of the WAHA instance (e.g., `http://seu-waha.onrender.com`).

## Data Transformation Summary
1. **WAHA payload** → normalized `{phone, text, imageUrl}`
2. **Text/image** → backend automation API → parsed product list
3. **Product list** → formatted WhatsApp message
4. **Message** → sent back to user via WAHA
5. **User reply** → captured via webhook (awaited by wait node) → backend processes order creation

## Dependencies on Backend Logic
The workflow delegates all core business logic to the NestJS automation service:
- Message parsing (OCR/LLM + regex)
- Product catalog lookup (fuzzy matching)
- Stock verification
- Order creation
- Payment integration (AppyPay)
This makes the workflow a thin orchestration layer; the actual automation resides in the backend.

## Notes for Reimplementation
When replacing this workflow with a WhatsApp Adapter (e.g., using Baileys directly in NestJS), preserve:
- The same input/output contract with WAHA (or Baileys).
- The same sequence: receive message → extract text/image → call automation parse API → format reply → send reply → await confirmation → process order.
- Ensure the adapter uses the same backend endpoints (`/api/v1/automation/parse-shopping-list` and `/api/v1/automation/orders/sync`) or integrates their logic directly.
- Maintain the same error handling and user experience (e.g., unrecognized items notification).