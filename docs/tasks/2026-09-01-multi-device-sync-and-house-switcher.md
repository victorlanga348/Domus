# Task: Sincronização Multi-Dispositivo, Seletor de Minhas Salas e Troca de Residência sem Logout
**Data:** 2026-09-01  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/auth-onboarding.md]]`, `[[docs/pages/dashboard.md]]`, `[[docs/integrations/api-contracts.md]]`, `[[docs/architecture/stack.md]]`

---

## 1. Contexto & Problema
1. **Multi-Dispositivo Isolado:** Quando dois dispositivos (ou dois moradores) acessam a mesma residência/sala, os aparelhos não se encontram. Isso ocorre porque o estado de membros (`familyMembers`) em `App.tsx` é armazenado em chaves locais do `localStorage` de cada navegador, não sendo hidratado a partir do BFF (`GET /api/dashboard`), e o WebSocket não emitia eventos de presença de moradores ativos (`house:presence`).
2. **Ausência de Lista de Minhas Salas:** Ao efetuar login ou acessar a tela de escolha de residência, o usuário só encontra formulários em branco ("Fundar Nova" ou "Entrar em Existente"). Não há listagem de "Minhas Residências/Salas" associadas ao usuário para seleção rápida com 1 clique.
3. **Impossibilidade de Sair/Trocar de Sala sem Deslogar:** O único botão disponível para sair de uma residência é o "Logout", que encerra a sessão JWT e apaga todo o estado, obrigando o morador a digitar email e senha novamente para acessar outra casa ou criar uma nova.

---

## 2. Solução Proposta

### 2.1 Backend (`src/modules/houses/`, `src/modules/rooms/`, `src/shared/socket/`)
- **Novo Endpoint `GET /api/houses/my-houses`:** Lista todas as residências às quais o usuário autenticado pertence ou criou, com contagem de membros, cargo (`ADMIN` ou `MEMBER`) e código de convite.
- **WebSocket com Presença em Tempo Real:**
  - Gerenciamento de conexões ativas por residência (`house:${houseId}`) e por sala (`room:${roomId}`).
  - Emissão dos eventos `house:presence` (lista de `userId`s online), `house:member_joined` e `house:member_left`.
  - Suporte completo a eventos de salas privadas (`room:join`, `room:leave`, `room:message`, `room:presence`).

### 2.2 Frontend (`src/features/auth/`, `src/layouts/`, `src/App.tsx`, `src/shared/socket/`)
- **Seletor de "Minhas Residências" em `HouseSelectionView.tsx`:**
  - Carregar e exibir a seção "Minhas Residências / Salas" logo acima dos formulários de criação/entrada.
  - Botão de acesso direto ("Entrar com 1 clique") sem necessidade de redigitar senha.
- **Botão "Trocar de Residência" (Sair da Sala sem Deslogar):**
  - Adicionar ação de alternância no Header, na Sidebar e em Configurações.
  - Criar `handleSwitchHouse()` em `App.tsx`: mantém `authUser` e `authToken`, limpa `currentHouse` e navega de volta para `HouseSelectionView.tsx`.
- **Sincronização Centralizada de Moradores:**
  - Sincronizar `familyMembers` no `App.tsx` e `Sidebar.tsx` a partir da resposta do BFF (`/api/dashboard`) e atualizar avatares e status de presença online via socket.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Experiência fluida e instantânea entre múltiplos dispositivos (smartphones, tablets e computadores na mesma residência).
  - Facilidade de navegação: o morador não perde sua sessão de autenticação ao transitar entre residências ou salas.
  - Zero atrito: salas já conhecidas e vinculadas aparecem prontas para seleção.
- **Desvantagens / Riscos:**
  - Gerenciamento de presença em memória no servidor WebSocket exige sincronização precisa no evento `disconnect` para evitar "membros fantasmas".

---

## 4. Critérios de Aceitação
- [x] Ao conectar dois navegadores/dispositivos na mesma residência, ambos exibem a lista completa de membros cadastrados e indicam quais estão online em tempo real.
- [x] A tela de seleção de residência (`HouseSelectionView`) exibe a lista de residências associadas ao usuário com botão de entrada direta em 1 clique.
- [x] O usuário consegue sair da residência atual e voltar para a tela de escolha de residências através de um botão no Header/Sidebar sem perder seu login (sem deslogar).
- [x] O backend expõe o endpoint `GET /api/houses/my-houses` protegido por autenticação.
- [x] O servidor WebSocket emite e escuta eventos de presença (`house:presence`) e salas privadas (`room:join`, `room:message`).
- [x] Typecheck (`rtk npm run typecheck:backend` e `frontend`) e testes passam com 100% de sucesso.

---

## 5. Plano de Implementação (Passo a Passo)

### Passo 1: Backend - Endpoint de Minhas Residências e WebSocket de Presença
1. [x] Atualizar `backend/src/modules/houses/houses.repository.ts`, `houses.service.ts`, `houses.controller.ts` e `houses.routes.ts` para implementar `GET /api/houses/my-houses`.
2. [x] Aprimorar `backend/src/shared/socket/socketServer.ts` com gerenciamento de presença online de usuários por residência e suporte a salas privadas.

### Passo 2: Frontend - Camada de API e Sockets
1. [x] Atualizar `frontend/src/features/auth/api/authApi.ts` para incluir método `listMyHouses(userId, token)`.
2. [x] Aprimorar `frontend/src/shared/socket/socketClient.ts` e `useHouseSocket.ts` para sincronizar presença e usuários online.

### Passo 3: Frontend - Interface e Navegação
1. [x] Atualizar `frontend/src/features/auth/components/HouseSelectionView.tsx` para listar as residências do usuário com cards interativos.
2. [x] Adicionar o botão "Trocar Residência" no `Header.tsx`, `Sidebar.tsx` e `SettingsView.tsx`.
3. [x] Atualizar `App.tsx` para integrar `handleSwitchHouse()` e hidratar `familyMembers` e presença em tempo real.

### Passo 4: Validação & Sincronização de Documentação
1. [x] Executar typecheck e build em ambos os pacotes.
2. [x] Atualizar specs em `docs/pages/auth-onboarding.md`, `docs/integrations/api-contracts.md` e `docs/architecture/stack.md`.

---

## 6. Validação e Testes
- [x] Typecheck Backend sem erros (`rtk npm run typecheck:backend` ou `npx tsc --noEmit`)
- [x] Typecheck Frontend sem erros (`rtk npm run typecheck:frontend` ou `npx tsc --noEmit`)
- [x] Validação visual e de fluxo no navegador
- [x] Sincronização completa refletida em `/docs`
