# KANDA SYSTEM — WA-03 INITIALIZATION
# PRE-IMPLEMENTATION SPECIFICATION & AUDIT

Repositório:
C:\Users\UTILIZADOR\kanda-system

## STATUS OF PREVIOUS PHASE

WA-02: PASS

WA02.1:
- Architectural audit: PASS
- CLEANUP-01: PASS
- CLEANUP-02: PASS

Current architecture:

```text
WhatsApp
    ↓
Baileys
    ↓
engine/whatsapp.ts
    ↓
SINGLE SOCKET
    ↓
Adapter Layer
    ↓
HTTPS
    ↓
Kanda Backend
    ↓
Prisma
    ↓
Supabase
```

## Current WhatsApp Capabilities

### Engine Layer (`/whatsapp/src/engine/whatsapp.ts`):
- ✅ `startWhatsAppClient()` - Initializes Baileys connection
- ✅ `sendMessage(jid, text)` - Sends text messages via Baileys
- ✅ `getClient()` - Returns current Baileys socket
- ✅ `getWhatsAppStatus()` - Returns connection status
- ✅ `destroyWhatsAppClient()` - Cleans up connection
- ✅ Handles QR code and pairing code (Baileys 7.0+)
- ✅ Automatic reconnection on disconnection
- ✅ Message logging (incoming messages logged to console)

### Adapter Layer (`/whatsapp/src/adapter/index.ts`):
- ✅ Defines `WhatsAppIncomingMessage` DTO
- ✅ `normalizeWhatsAppMessage()` - Converts Baileys message objects to normalized DTO
- ✅ `startWhatsAppAdapter()` - Starts client and attaches listeners
- ✅ `getAdapterClient()` - Returns current client
- ✅ `destroyWhatsAppAdapter()` - Destroys client
- ⚠️ `attachListeners()` - Listens to connection updates and messages
  - ✅ Logs connection status changes
  - ✅ Logs incoming messages (normalized) to console
  - ❌ **MISSING**: No HTTP forwarding to backend

### WhatsApp API Layer (`/whatsapp/src/api/index.ts`):
- ✅ `/health` GET endpoint - Returns WhatsApp connection status
- ✅ `/send-message` POST endpoint - Sends messages via engine
  - Expects `{ to, text }` in request body
  - Returns `{ status: 'Message sent' }` on success
  - Proper error handling (400 for missing params, 500 for failures)

## Backend Integration Status

### Backend (`/backend/src/`):
- ❌ **No WhatsApp-related code found**
- ❌ **No HTTP clients** (axios, fetch, etc.) for calling WhatsApp API
- ❌ **No endpoints** for receiving incoming WhatsApp messages
- ❌ **No configuration** for WhatsApp API URL/credentials

### Message Flow Analysis:

#### OUTGOING (Backend → WhatsApp):
```
[MISSING] Backend
    ↓
[MISSING] HTTP call to WhatsApp API
    ↓
WhatsApp API (/send-message POST)
    ↓
Engine (sendMessage function)
    ↓
Baileys
    ↓
WhatsApp
```

#### INCOMING (WhatsApp → Backend):
```
WhatsApp
    ↓
Baileys
    ↓
Engine (messages.upsert event)
    ↓
Adapter (normalizeWhatsAppMessage)
    ↓
[MISSING] HTTP call to Backend
    ↓
[MISSING] Backend endpoint
    ↓
Backend Processing
```

## Missing Functionality

### 1. Outgoing Message Flow (Backend to WhatsApp):
- Backend needs to make HTTP POST to `http://localhost:3002/send-message` (WhatsApp API port)
- Requires HTTP client (Axios recommended, consistent with NestJS)
- Needs configuration for WhatsApp API URL

### 2. Incoming Message Flow (WhatsApp to Backend):
- Adapter needs to send HTTP POST to backend when message received
- Backend needs endpoint to accept incoming WhatsApp messages
- Requires message DTO definition in backend
- Requires validation and processing logic

### 3. Configuration:
- Need to add WhatsApp API URL to backend config
- Need to add backend URL to WhatsApp adapter config (or derive dynamically)

## Proposed WA-03 Scope

### Primary Objective:
Complete bidirectional WhatsApp message flow between Kanda Backend and WhatsApp users.

### Specific Tasks:

#### A. Enable Outgoing Messages (Backend → WhatsApp)
1. **Add HTTP client service** in backend for calling WhatsApp API
2. **Create WhatsApp service** in backend with `sendMessage(to: string, text: string)` method
3. **Add configuration** for WhatsApp API URL
4. **Create controller endpoint** (e.g., `/api/whatsapp/send`) that uses the service
5. **Update any existing** `/send-message` usage to go through backend service

#### B. Enable Incoming Messages (WhatsApp → Backend)
1. **Modify adapter** to send HTTP POST to backend on message receipt
2. **Add backend controller** to receive incoming WhatsApp messages
3. **Create DTO** for incoming WhatsApp messages in backend
4. **Add validation** and basic processing (store/log for now)
5. **Add configuration** for backend URL in adapter

#### C. Configuration & Infrastructure
1. **Add environment variables**:
   - Backend: `WHATSAPP_API_URL` (default: `http://localhost:3002`)
   - Adapter: `BACKEND_API_URL` (default: `http://localhost:3001/api`)
2. **Update docker-compose** if needed for service communication

## Acceptance Criteria

### Outgoing Messages:
- [ ] Backend can send WhatsApp messages via HTTP call to WhatsApp API
- [ ] WhatsApp API `/send-message` endpoint is callable from backend
- [ ] Error handling for failed sends (network, validation, etc.)
- [ ] Configuration-driven API URL

### Incoming Messages:
- [ ] Adapter forwards normalized WhatsApp messages to backend via HTTP
- [ ] Backend receives and validates incoming WhatsApp messages
- [ ] Messages are logged/stored for verification
- [ ] Error handling for failed forwards (network, backend unavailable)
- [ ] Configuration-driven backend URL

### Integration Tests:
- [ ] Send message from backend → received on WhatsApp
- [ ] Send message from WhatsApp → received in backend logs/storage
- [ ] Handle connection states (disconnected, reconnecting, etc.)

## Files Requiring Changes

### Backend (`/backend/src/`):
1. `src/config/configuration.ts` - Add WhatsApp API URL config
2. `src/whatsapp/whatsapp.service.ts` (NEW) - HTTP client for WhatsApp API
3. `src/whatsapp/whatsapp.controller.ts` (NEW) - Endpoints for WhatsApp integration
4. `src/whatsapp/dto/send-message.dto.ts` (NEW) - Outgoing message DTO
5. `src/whatsapp/dto/incoming-message.dto.ts` (NEW) - Incoming message DTO
6. `src/whatsapp/whatsapp.module.ts` (NEW) - Module declaration
7. `src/app.module.ts` - Import WhatsAppModule

### WhatsApp Adapter (`/whatsapp/src/adapter/`):
1. `src/adapter/index.ts` - Add HTTP POST to backend in message handler
2. `src/config.ts` (if not exists) - Add backend URL config
3. May need to add HTTP client dependency (axios or node-fetch)

### WhatsApp API (`/whatsapp/src/api/`):
1. No changes needed (already has `/send-message` endpoint)
2. May want to add CORS configuration to allow backend calls

## Risk Assessment

### Low Risk:
- Adding HTTP client to backend (standard NestJS practice)
- Creating new controller/service modules
- Configuration additions

### Medium Risk:
- Modifying adapter to add HTTP outgoing calls (introduces network dependency)
- Ensuring proper error handling for network failures
- Timeout configuration for HTTP calls

### Mitigation Strategies:
- Use NestJS HttpService (wraps Axios) for backend HTTP calls
- Implement retry logic with exponential backoff for failed HTTP calls
- Circuit breaker pattern for backend unavailability
- Proper logging of all HTTP call attempts and results
- Configuration timeouts (5-10 seconds reasonable for internal service calls)

## Test Plan

### Unit Tests:
- [ ] WhatsApp service correctly forms HTTP requests
- [ ] WhatsApp controller validates incoming message DTO
- [ ] Adapter normalizes and sends correct payload to backend

### Integration Tests:
- [ ] Backend → WhatsApp API → Baileys → WhatsApp (outgoing)
- [ ] WhatsApp → Baileys → Engine → Adapter → Backend (incoming)
- [ ] Error scenarios: backend down, WhatsApp API down, network issues

### Manual Verification:
- [ ] Start all services
- [ ] Send message from backend endpoint → verify received on WhatsApp phone
- [ ] Send message from WhatsApp → verify received in backend logs/storage
- [ ] Test reconnection scenarios

## Explicit Exclusions

### NOT part of WA-03:
- [ ] Message persistence/storage (beyond basic logging for verification)
- [ ] Advanced message processing (commands, media handling, etc.)
- [ ] Webhook signature validation (if needed later)
- [ ] Rate limiting/throttling beyond existing NestJS throttler
- [ ] Message templating or complex response logic
- [ ] Group message special handling (beyond basic DTO support)
- [ ] Location, contact, sticker, etc. media types (beyond basic DTO fields)
- [ ] Delivery receipts and read status tracking
- [ ] Typing indicators and presence notifications

## Final Verdict

### WA-03 READY FOR IMPLEMENTATION

Based on the audit, the system is ready for WA-03 implementation. The missing components are clearly identified:

1. **Backend lacks WhatsApp integration** - needs HTTP client, service, controller
2. **Adapter lacks outgoing HTTP to backend** - needs to forward normalized messages
3. **Configuration missing** - need to add API URLs to both sides

The existing foundation is solid:
- Engine properly handles Baileys connection
- Adapter properly normalizes messages
- WhatsApp API properly exposes send-message endpoint
- Backend is ready to accept new modules

Implementation should follow the exact sequence:
1. Add configuration to both sides
2. Implement backend WhatsApp service/controller for outgoing messages
3. Modify adapter to forward messages to backend
4. Add backend endpoint to receive incoming messages
5. Test both directions

This completes the bidirectional WhatsApp integration flow started in WA-02.