# Task: Habilitação de Acesso Mobile e Testes na Rede Local (LAN / Wi-Fi)
**Data:** 2026-09-02  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/architecture/security.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema

O usuário deseja testar a aplicação DOMUS (frontend e backend) diretamente no smartphone conectado à mesma rede Wi-Fi que o computador de desenvolvimento.
Atualmente, o ambiente possui restrições que impedem o acesso móvel direto:
1. **Frontend Host Binding:** O Vite precisa escutar explicitamente em `0.0.0.0` para aceitar conexões além do `localhost`.
2. **Resolução de Endereço da API no Cliente:** Em `frontend/src/config/constants.ts`, `API_BASE_URL` e `SOCKET_URL` apontavam fixamente para `http://localhost:3333`. Ao abrir o site pelo celular em `http://192.168.1.181:3002`, o navegador mobile tentava conectar no `localhost:3333` do próprio smartphone, falhando todas as chamadas HTTP e WebSockets.
3. **Restrição de CORS no Backend:** `backend/.env` possui `CORS_ORIGIN=http://localhost:3002`. Requisições originadas do celular (ex: `http://192.168.1.181:3002`) seriam bloqueadas pelo middleware de CORS do Express e Socket.io.
4. **Backend Host Binding:** O servidor HTTP/WebSocket Node.js precisa garantir bind explícito em `0.0.0.0` para escutar em todas as interfaces de rede locais.

---

## 2. Solução Proposta

1. **Detecção Dinâmica de Host no Frontend (`frontend/src/config/constants.ts`):**
   - Configurar `API_BASE_URL` e `SOCKET_URL` para utilizar dinamicamente `window.location.hostname` quando `VITE_API_URL` não for fornecida explicitamente:
     ```typescript
     const getHost = () => (typeof window !== 'undefined' && window.location.hostname) || 'localhost';
     ```
   - Dessa forma, ao acessar `http://192.168.1.181:3002` no celular, o frontend se conecta automaticamente a `http://192.168.1.181:3333/api` e `http://192.168.1.181:3333` sem necessidade de configurações manuais.
2. **Configuração do Servidor Vite (`frontend/vite.config.ts`):**
   - Definir `server: { host: true, port: 3002 }`, garantindo que o servidor Vite abra na rede local em `0.0.0.0`.
3. **Abertura Inteligente de CORS no Backend (`backend/src/app.ts`, `backend/src/shared/socket/socketServer.ts`):**
   - No modo de desenvolvimento (`NODE_ENV === 'development'`), permitir requisições de origens locais (`localhost`, `127.0.0.1` e faixas de IP de rede privada `192.168.*.*`, `10.*.*.*`, `172.16-31.*.*`), refletindo o origin da requisição com `credentials: true`.
   - Ajustar o Socket.io Server com política idêntica de CORS.
4. **Host Binding no Backend (`backend/src/server.ts`):**
   - Especificar `httpServer.listen(env.PORT, '0.0.0.0', ...)` para assegurar escuta em todas as placas de rede do host.
5. **Instruções e URLs de Teste Prontas:**
   - Fornecer o IP local verificado (`192.168.1.181`) com a URL exata para abertura no navegador do celular: `http://192.168.1.181:3002`.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - Zero atrito para testar no celular ou tablet físico na mesma rede Wi-Fi.
  - Sincronização em tempo real (WebSockets) funcionando perfeitamente entre o PC e o celular simultaneamente.
  - Independente de alterações de IP pelo roteador (a resolução dinâmica do frontend usa o host corrente).
  - Mantém total segurança em produção (validação de CORS estrita mantida fora de `development`).
- **Desvantagens / Riscos:**
  - Caso o Firewall do Windows bloqueie conexões de entrada na rede privada nas portas 3002 ou 3333, será necessário autorizar o Node.js no popup do Windows Defender Firewall.

---

## 4. Critérios de Aceitação

- [x] `frontend/src/config/constants.ts` resolve `API_BASE_URL` e `SOCKET_URL` dinamicamente com base no `hostname` atual.
- [x] `frontend/vite.config.ts` configurado com `server: { host: true, port: 3002 }`.
- [x] `backend/src/server.ts` escutando explicitamente em `0.0.0.0`.
- [x] `backend/src/app.ts` e `socketServer.ts` aceitando requisições do frontend vindo de IPs locais com credentials.
- [x] Typecheck e build de frontend e backend passando com código 0.
- [x] Specs de `/docs` atualizadas.

---

## 5. Plano de Implementação (Passo a Passo)

1. [x] **Atualização de Documentação:**
   - Atualizar `docs/architecture/security.md` documentando a política de CORS para rede local em desenvolvimento.
2. [x] **Frontend - Configuração de Host & Vite:**
   - Atualizar `frontend/src/config/constants.ts` com fallback dinâmico de hostname.
   - Atualizar `frontend/vite.config.ts` com `server: { host: true, port: 3002 }`.
3. [x] **Backend - Host Binding & CORS:**
   - Atualizar `backend/src/server.ts` para escutar em `0.0.0.0`.
   - Configurar validador de CORS para rede local em `backend/src/app.ts` e `backend/src/shared/socket/socketServer.ts`.
4. [x] **Validação Técnica:**
   - Executar typecheck e build em ambos os projetos com prefixo `rtk`.
5. [x] **Sincronização & Commit:**
   - Atualizar status da task para "Concluída", realizar commit em português e orientar os comandos de execução.

---

## 6. Validação e Testes

- [x] `rtk npm run typecheck` (frontend): Código 0.
- [x] `rtk npm run typecheck` (backend): Código 0.
- [x] `rtk npm run build` (frontend): Código 0.
- [x] `rtk npm run build` (backend): Código 0.

---

## 7. Sincronização com /docs

- [x] `docs/architecture/security.md`
- [x] `docs/integrations/api-contracts.md`
- [x] Matriz de impacto validada em `[[docs/documentation-governance.md]]`.
