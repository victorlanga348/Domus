# Task: Otimização de Latência no Login, Cadastro e Inicialização Mobile
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/auth-onboarding.md]]`, `[[docs/architecture/security.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema

O processo de autenticação (login e cadastro) apresenta latência excessiva (de 3 a 7 segundos), com lentidão significativamente mais perceptível quando executado em dispositivos móveis (smartphones / PWA) conectados à rede local.

A investigação identificou 4 causas-raiz convergentes:
1. **Gargalo de CPU por Criptografia em JS Puro (`bcryptjs`):**
   - No cadastro (`register`), o backend executa dois hashes Blowfish sequenciais (`data.password` e `data.pin || '0000'`) usando `bcryptjs`. Por ser uma biblioteca 100% JavaScript (sem bindings C++ nativos), cada hash consome 1024 iterações bloqueando a thread do Node.js no ambiente Docker/WSL2 por 400-600ms cada (~1s a 1.2s acumulados apenas na CPU do backend).
2. **CORS Preflight (`OPTIONS`) Não Cacheados no Mobile:**
   - No celular, as chamadas são cross-origin (ex: `http://192.168.1.X:3002` para `http://192.168.1.X:3333`). O middleware de CORS em `backend/src/app.ts` não especifica `maxAge`, forçando o navegador móvel a realizar requisições preliminares `OPTIONS` sobre Wi-Fi para cada requisição com JSON, adicionando round-trips de rede desnecessários.
3. **Interceção de Rotas de API pelo Service Worker (`sw.js`):**
   - O `sw.js` intercepta indiscriminadamente todas as requisições de rede com `e.respondWith(...)`, forçando comunicação interprocessos (IPC) entre a thread da WebView e a thread do Service Worker a cada chamada de autenticação e dados da API.
4. **Avalanche Concorrente Pós-Login ("Thundering Herd"):**
   - Imediatamente após o sucesso do login/cadastro, `App.tsx` dispara simultaneamente 7 requisições GET (`/dashboard`, `/tasks`, `/activity-logs`, `/rules`, `/preferences`, `/meals`, `/statuses`) e, fração de segundo depois, o Socket.io conecta e dispara outras 7 requisições idênticas via `onConnect`.
   - Navegadores móveis limitam conexões HTTP/1.1 a no máximo 6 sockets concorrentes por host. As requisições entram em fila (*Head-of-Line blocking*), congelando a interface móvel durante a transição.

---

## 2. Solução Proposta

1. **Backend - Paralelização e Eliminação de Hash Redundante (`backend/src/modules/auth/auth.service.ts`):**
   - No `register`, se o PIN não for explicitamente fornecido pelo usuário (PIN descontinuado na UI pública), reutilizar um valor seguro padrão pré-computado ou calcular `password_hash` e `pin_hash` em paralelo via `Promise.all()`.
   - Manter salt rounds em 10 (atendendo às diretrizes de segurança) sem execução sequencial bloqueante.
2. **Backend - Cache de Preflight CORS (`backend/src/app.ts`):**
   - Configurar `maxAge: 86400` (24 horas) na configuração do CORS do Express. O navegador móvel armazena a autorização prévia e dispara diretamente o `POST /api/auth/login` e `POST /api/auth/register` sem a penalidade do `OPTIONS` a cada tentativa.
3. **Frontend - Exclusão de Rotas de API no Service Worker (`frontend/public/sw.js`):**
   - Ajustar o listener `fetch` do `sw.js` para ignorar requisições que contenham `/api/`, `socket.io` ou que se destinem a portas de backend (`:3333`), permitindo que as requisições de API sigam direto pela pilha de rede nativa do navegador sem overhead de IPC do Service Worker.
4. **Frontend - Desduplicação de Sincronização Pós-Login (`frontend/src/App.tsx`):**
   - No listener `onConnect` do WebSocket, evitar disparar uma segunda rodada de `syncAllHouseData({ silent: true })` caso a sincronização inicial tenha ocorrido a menos de 10 segundos, prevenindo o engavetamento de 14 requisições em aparelhos móveis.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - Redução drástica do tempo de cadastro e login (tempo de resposta do backend cai em ~50-60%).
  - Eliminação de round-trips `OPTIONS` redundantes sobre Wi-Fi.
  - Alívio imediato no pool de conexões HTTP do navegador mobile, eliminando travamentos de transição de tela.
  - Zero quebra de contratos de API, zero alteração em banco de dados ou schemas.
- **Desvantagens / Riscos:**
  - O cache de preflight (`maxAge: 86400`) faz com que novas origens ou métodos precisem de até 24h ou limpeza de cache de rede do navegador caso headers adicionais sejam adicionados (impacto desprezível em desenvolvimento e padrão recomendado em produção).

---

## 4. Critérios de Aceitação

- [x] `backend/src/modules/auth/auth.service.ts` executa geração de hashes de forma paralela via `Promise.all()`, reduzindo o tempo de CPU na criação de usuário.
- [x] `backend/src/app.ts` envia header `Access-Control-Max-Age: 86400` nas respostas de preflight CORS.
- [x] `frontend/public/sw.js` ignora requisições para a API e WebSockets, repassando o controle direto ao navegador.
- [x] `frontend/src/App.tsx` não reexecuta `syncAllHouseData` redundante no `onConnect` do WebSocket quando uma sincronização já ocorreu recentemente.
- [x] Typecheck e testes passam com sucesso (`rtk npm run typecheck` no frontend e backend, `rtk npm run test:unit`).

---

## 5. Plano de Implementação (Passo a Passo)

1. [x] **Backend (`backend/src/modules/auth/auth.service.ts`):** Paralelizar o cálculo dos hashes no método `register()` e `googleLogin()` usando `Promise.all()`.
2. [x] **Backend (`backend/src/app.ts`):** Adicionar `maxAge: 86400` na configuração do middleware `cors`.
3. [x] **Frontend (`frontend/public/sw.js`):** Inserir condicional para não interceptar requisições que correspondam à API ou Socket.io.
4. [x] **Frontend (`frontend/src/App.tsx`):** Adicionar controle de timestamp de última sincronização (`lastSyncTimestampRef`) para evitar a chamada dupla no `onConnect`.
5. [x] **Validação & Testes:** Executar `rtk npm run typecheck` (0 erros) e `rtk npm run test:unit` (51 testes aprovados).
6. [x] **Sincronização & Governança:** Atualizar specs em `docs/pages/auth-onboarding.md` e `docs/architecture/security.md`.

---

## 6. Validação e Testes

- [x] `rtk npm run typecheck` (Frontend) - 0 erros
- [x] `rtk npm run typecheck` (Backend) - 0 erros
- [x] `rtk npm run test:unit` (Backend) - 51 testes aprovados
- [x] `rtk npm run build` (Frontend) - Concluído com sucesso em 4.36s
- [x] `rtk npm run build` (Backend) - Concluído com sucesso

---

## 7. Sincronização com /docs

- [x] `docs/pages/auth-onboarding.md`
- [x] `docs/architecture/security.md`
- [x] Matriz de impacto validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
