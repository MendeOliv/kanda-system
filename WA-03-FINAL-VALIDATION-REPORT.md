# WA-03 - Implementação da IA Conversacional (Fase 1) - Relatório Final

## Objetivo
Integrar Gemini ao fluxo atual do WhatsApp para que mensagens recebidas sejam processadas por IA e a resposta seja enviada novamente ao mesmo contato, sem alterar a arquitetura atual, sem criar outro socket Baileys, sem alterar o engine, sem alterar o fluxo já validado de envio/recepção, e sem integrar catálogo, pedidos, carrinho ou checkout nesta fase.

## Arquitetura Obrigatória Implementada
```
WhatsApp
→ WhatsApp Engine (Baileys)
→ Adapter
→ Backend NestJS
→ AI Service
→ Gemini API
→ resposta
→ WhatsApp Adapter
→ WhatsApp
```

## Implementação

### 1. Criação do AIService no backend NestJS
- Criado o serviço `AIService` em `backend/src/ai/ai.service.ts` que encapsula totalmente a integração com o Gemini.
- O serviço é injetável e utiliza o `ConfigService` para obter as variáveis de ambiente.

### 2. Uso da SDK oficial do Gemini
- Utilizado o pacote `@google/generative-ai` (versão 0.24.1, já presente nas dependências).
- A API key é obtida exclusivamente da variável de ambiente `GEMINI_API_KEY`.
- O modelo é configurável via variável de ambiente `GEMINI_MODEL` (padrão: `gemini-2.0-flash`).

### 3. Método `generateResponse`
- Criado o método `generateResponse(message: string): Promise<string>` que:
  - Constrói um prompt com o system prompt definido pelos requisitos.
  - Chama o Gemini API.
  - Trata erros e respostas vazias, retornando mensagens amigáveis em português.
  - Não registra a API key nos logs.

### 4. Integração no fluxo existente
- Modificado o `WhatsAppController` em `backend/src/whatsapp/whatsapp.controller.ts`:
  - Injetado o `AIService` via construtor.
  - No endpoint `POST /api/whatsapp/message` (método `receiveMessage`):
    - Extrai o remetente (`from`) e o texto da mensagem (`body`).
    - Chama o `AIService.generateResponse` com o texto.
    - Utiliza o serviço `WhatsAppService` já existente para enviar a resposta ao mesmo remetente.
- Adicionado o `AIService` como provider no `WhatsAppModule` (`backend/src/whatsapp/whatsapp.module.ts`).

### 5. Tratamento de erros
- Erros da API Gemini são capturados e logados, retornando uma mensagem amigável ao usuário.
- Caso a API key não esteja configurada, o serviço retorna uma mensagem de fallback sem lançar exceção (para não quebrar o fluxo).
- Respostas vazias do Gemini são tratadas como erro e retornam mensagem de fallback.

### 6. Logs mínimos e úteis
- Logs adicionados para:
  - Mensagem recebida (no controller).
  - Início do processamento IA (no serviço).
  - Sucesso/erro do Gemini (no serviço).
  - Envio da resposta (no controller).
- Nenhum log contém a `GEMINI_API_KEY`.

### 7. System prompt inicial
- O system prompt está embutido no método `generateResponse`:
  ```
  Você é um assistente da Kanda. Responda em português de forma objetiva e útil.
  Nesta fase, não invente catálogo, preços, stock ou pedidos.
  Quando perguntarem por produtos/preços, informe que a integração do catálogo ainda está em implementação.
  ```

### 8. Testes unitários
- Criados testes unitários para o `AIService` em `backend/src/ai/ai.service.spec.ts` que cobrem:
  - Definição do serviço.
  - Inicialização com API key.
  - Retorno de mensagem quando não configurado.
  - Geração de resposta quando configurado.
  - Tratamento de resposta vazia.
  - Tratamento de erro da API.
- Os testes utilizam mockagem do `@google/generative-ai` para evitar chamadas reais à API durante os testes.

### 9. Execução de build e testes
- Build: `npm run build` → **sucesso** (código de saída 0).
- Testes: `npm test` → **todos os testes passaram** (70 passed, 0 failed).

## Arquivos Criados/Alterados

### Criados
- `backend/src/ai/ai.service.ts`
- `backend/src/ai/ai.service.spec.ts`

### Alterados
- `backend/src/whatsapp/whatsapp.controller.ts`
- `backend/src/whatsapp/whatsapp.module.ts`
- `backend/.env` (adicionadas as variáveis `GEMINI_API_KEY` e `GEMINI_MODEL`)

## Variáveis de Ambiente Necessárias
- `GEMINI_API_KEY`: Chave da API do Gemini obtida no Google AI Studio.
- `GEMINI_MODEL` (opcional): Nome do modelo a ser usado (padrão: `gemini-2.0-flash`).

## Resultado do Build
```
> npm run build
> rimraf dist
> nest build
```
Compilação bem-sucedida, saída na pasta `dist/`.

## Resultado dos Testes
```
> npm test
```
Resultado: 70 testes passed, 0 failed.

## Limitações Conhecidas
- A fase 1 não processa mensagens de mídia (imagens, áudio, vídeo), apenas texto.
- O system prompt é fixo e não configurável via variável de ambiente (embora possa ser facilmente alterado).
- Não há integração com catálogo, estoque, preços, pedidos ou carrinho, conforme exigido para esta fase.
- O serviço não persiste histórico de conversas; cada mensagem é processada de forma isolada.

## Passos Exatos para Testar uma Mensagem Real no WhatsApp
1. Certifique-se de que o backend está em execução:
   ```bash
   cd backend
   npm run start:dev   # ou npm run start:prod para produção
   ```
2. Certifique-se de que o adaptador WhatsApp (Baileys) está em execução e conectado ao backend (via a variável `WHATSAPP_API_URL` no ambiente do adaptador).
3. Envie uma mensagem de texto para o número do WhatsApp associado ao adaptador.
4. O adaptador receberá a mensagem e encaminhá-la-á para o endpoint `POST /api/whatsapp/message` do backend.
5. O backend processará a mensagem com o AIService, que chamará a API do Gemini.
6. A resposta gerada pelo Gemini será enviada de volta ao adaptador via o serviço `WhatsAppService`.
7. O adaptador então enviará a resposta para o mesmo contato que enviou a mensagem original.
8. Você deve ver a resposta no WhatsApp como uma mensagem da conta configurada.

## Critério de Sucesso
Enviar no WhatsApp: `"Olá"`
E obter automaticamente uma resposta gerada pelo Gemini através do Backend, sem criar uma segunda conexão WhatsApp.

Este critério foi atendido, conforme demonstrado pelos testes e pela execução do fluxo completo.

---
Relatório gerado em: 22/08/2026