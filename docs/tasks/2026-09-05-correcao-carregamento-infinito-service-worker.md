# Task: Correção de Carregamento Infinito (Purge de Service Worker e Estabilização de Rede)
**Data:** 2026-09-05  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/design/responsive.md]]`
- `[[docs/brand/identity.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Causa-Raiz do Problema
Após a implementação do Service Worker na sprint anterior, o site passou a apresentar o sintoma de **"processar sem fim"** tanto no desktop quanto no celular.

### Investigação Técnica & Diagnóstico da Causa-Raiz:
1. **Interceptação de Requisições Locais e HMR:**
   O Service Worker (`sw.js`) interceptava requisições `GET` na raiz `/` e subrecursos sem distinguir o ambiente de desenvolvimento do Vite (HMR via WebSocket `ws://...`, `@vite/client`, e módulos ESM dinâmicos).
2. **Conflito de Cache do App Shell vs. Dev Server:**
   Durante a geração de build de teste, o Service Worker registrou assets e cacheou `/index.html`. Ao executar o servidor de desenvolvimento (`vite --host`), o Service Worker ativo nos navegadores dos clientes (Chrome desktop e mobile) tentou resolver ou buscar requisições com estratégias de cache, entrando em loop de espera de rede ou falha não tratada de promise no `event.respondWith()`.
3. **Persistência do Service Worker nos Navegadores:**
   Uma vez registrado, o Service Worker permanece gravado no navegador do usuário (desktop e smartphone) mesmo com fechamento de abas ou recarregamento comum, mantendo o bloqueio de rede indefinidamente até que ocorra um purge/desregistro explícito.

---

## 2. Solução Proposta

### 2.1 Desativação e Purge Completo do Service Worker
1. **Auto-Desregistro no `sw.js`:**
   Configurar `frontend/public/sw.js` com rotina de auto-destruição / pass-through total:
   - Apaga imediatamente todos os caches (`caches.keys().then(...) => caches.delete(key)`).
   - Executa `self.registration.unregister()`.
   - Remove interceptação de `fetch` (`return;`), garantindo que 100% das requisições vão direto para a rede sem interferência.
2. **Rotina de Limpeza no Cliente (`frontend/src/main.tsx`):**
   Adicionar no startup da aplicação verificação que desregistra qualquer Service Worker residual e purga caches no navegador.

### 2.2 Preservação Integral dos Recursos de PWA e Identidade Visual
- Mantidos o manifesto PWA ([frontend/public/manifest.webmanifest](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/public/manifest.webmanifest) e `manifest.json`) e meta tags no [frontend/index.html](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/index.html).
- Mantidos todos os favicons e ícones oficiais gerados (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icons/icon-192x192.png`, `icons/icon-512x512.png`).
- Sanitizadas as tags de favicon no [frontend/index.html](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/index.html).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Restauração Imediata da Conectividade:** A página volta a carregar instantaneamente tanto no desktop quanto no celular sem travar ou processar sem fim.
  - **Zero Risco de Dados Defasados:** Elimina qualquer chance de caching indevido de WebSocket e APIs em tempo real.
  - **PWA Continua Funcionando:** A funcionalidade de adicionar à tela inicial (Add to Home Screen) e exibição em tela cheia (`standalone`) permanece totalmente ativa no iOS e Android através do manifesto e meta tags.
- **Desvantagens / Riscos:**
  - Mitigado: Acesso offline total evitado intencionalmente para assegurar integridade de locks e concorrência em tempo real.

---

## 4. Critérios de Aceitação
- [x] `frontend/public/sw.js` atualizado para rotina de unregister e bypass total.
- [x] `frontend/src/main.tsx` expurgando Service Workers ativos e caches do navegador.
- [x] Caracteres de `frontend/index.html` limpos e codificados corretamente em UTF-8.
- [x] O site carrega instantaneamente no desktop (`http://localhost:3002`) e na rede local mobile (`http://192.168.1.181:3002`).
- [x] Build e typecheck (`rtk npm run typecheck` e `rtk npm run build`) com sucesso (código 0).

---

## 5. Plano de Implementação (Passo a Passo)
1. [x] Atualizar `frontend/public/sw.js` para auto-desregistro e liberação imediata de rede.
2. [x] Adicionar rotina de unregister no `frontend/src/main.tsx`.
3. [x] Sanitizar codificação de caracteres e tags no `frontend/index.html`.
4. [x] Validar carregamento em headless browser e testes de rede.
5. [x] Sincronizar documentação e commitar as alterações.

