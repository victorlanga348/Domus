# Task: Opção A - Ingresso Estrito por Código Único e Prevenção de Vazamento de Código ao Sair
**Data:** 2026-09-04  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/pages/auth-onboarding.md]]`
- `[[docs/integrations/api-contracts.md]]`
- `[[docs/architecture/security.md]]`
- `[[docs/pages/settings.md]]`
- `[[docs/architecture/data-model.md]]`

---

## 1. Contexto & Problema
Atualmente, o sistema DOMUS exige senha de entrada para residências na criação e no ingresso, criando atrito desnecessário e redundância cognitiva (dupla barreira: Código + Senha).
Além disso, foram identificadas duas falhas críticas de privacidade e autorização no fluxo de saída de residência (`leaveHouse`):
1. **Vazamento do Código de Convite:** Ao se desvincular de uma residência, a interface de seleção de residência (`HouseSelectionView`) renderizava o card em "Minhas Residências Salvas" exibindo abertamente o código de convite da casa (`invite_code`), expondo credenciais confidenciais a um ex-morador.
2. **Bypass de Reingresso sem Código (1-Clique):** O card permitia clicar em "Entrar na Casa ->" e reingressar imediatamente sem digitar nenhuma credencial (`switchHouse`), violando a regra de que qualquer morador desvinculado deve obrigatoriamente digitar o código para reingressar.

---

## 2. Solução Proposta (Opção A - Apenas Código Único)
1. **Eliminação Completa da Senha da Residência:**
   - **Criar Residência:** Usuário fornece apenas o `Nome da Residência`. O sistema gera deterministicamente o código único no padrão `CASA-XXXX` (`invite_code`). O campo `password_hash` passa a armazenar string vazia `""` (já compatível com o schema Prisma `@default("")`).
   - **Entrar em Residência:** Usuário fornece estritamente o `Código de Convite` (`invite_code`, ex: `CASA-4892`). Nenhuma senha de casa é solicitada nem validada.
   - **Governança por Código Rotativo:** Caso o código de convite seja compartilhado indevidamente ou esquecido, o `Admin Geral` utiliza o botão oficial "Regenerar Código" no painel de configurações para invalidá-lo e gerar um novo instantaneamente.
2. **Correção do Vazamento de Código & Blindagem de Estado:**
   - No `handleConfirmLeaveHouse` em `App.tsx`, atualizar imediatamente o estado `authUser` e a persistência em `localStorage` (`domus_auth_user`) com `house_id: null` e `role: 'MEMBER'`.
   - Na `HouseSelectionView`, a seção "Minhas Residências Salvas" não exibirá o `invite_code` e não será exibida para quem não tem residência ativa (`house_id === null`).
   - Remover qualquer bypass de 1 clique que permita entrar sem digitar o código.
3. **Reingresso Obrigatório por Código:**
   - Quem saiu da residência volta à estaca zero de filiação e é obrigado a inserir o código no formulário "Entrar em Residência".
   - Todo usuário que ingressa via código assume estritamente o cargo de Morador (`role: MEMBER`).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Fricção Mínima de Onboarding:** Usuários só precisam copiar e colar um código de 9 caracteres (`CASA-XXXX`), sem necessidade de inventar, memorizar ou compartilhar uma segunda senha familiar.
  - **Privacidade & Isolamento:** Ex-moradores não têm mais acesso visual a códigos de casas das quais saíram.
  - **Zero Regressão de Segurança:** A segurança da casa permanece garantida pela unicidade (`@unique`) do código de convite e pela capacidade do `Admin Geral` de regenerá-lo a qualquer momento.
- **Desvantagens / Riscos:**
  - Se alguém compartilhar publicamente o código de convite, pessoas não autorizadas com conta no DOMUS poderiam entrar se o Admin Geral não rotacionar o código.
  - **Mitigação:** O painel de Configurações possui o botão "Regenerar Código" com broadcast WebSocket imediato, e o Admin Geral pode remover qualquer membro indevido via menu contextual (`...`).

---

## 4. Critérios de Aceitação
- [x] Formulário "Criar Residência" não solicita campo de senha, apenas o Nome da Residência.
- [x] Formulário "Entrar em Residência" solicita apenas o Código de Convite da Residência (ex: `CASA-4892`), sem campo de senha.
- [x] Endpoint `POST /api/house/create` aceita payload `{ houseName, user_id }` sem exigir senha.
- [x] Endpoint `POST /api/house/join` aceita payload `{ inviteCode, user_id }`, valida a existência do código e associa o usuário com `role: 'MEMBER'`.
- [x] Ao clicar em "Sair da Residência", o usuário é desvinculado e o estado em tela e `localStorage` reflete `house_id: null`.
- [x] Quem saiu da residência não visualiza o código da casa em nenhuma tela.
- [x] Para voltar à residência, o usuário é estritamente obrigado a preencher o código de convite no card "Entrar em Residência".
- [x] Testes automatizados (unitários e E2E) atualizados e passando 100%.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Backend - Serviços e Controladores (`backend/src/modules/houses/`):**
   - Em `houses.service.ts`:
     - Atualizar `createHouse(userId, houseName)`: remover validação de senha; salvar `password_hash: ''`.
     - Atualizar `joinHouse(userId, inviteCode)`: remover comparação de senha Bcrypt; buscar por `invite_code` (com trim e formatação case-insensitive); associar como `MEMBER`.
   - Em `houses.controller.ts`:
     - Adaptar `createHouse` e `joinHouse` para receber os parâmetros simplificados.
2. **Frontend - APIs e Componentes de Autenticação/Onboarding:**
   - Em `authApi.ts`:
     - Atualizar `createHouse` e `joinHouse` para não exigir/enviar `housePassword`.
   - Em `HouseSelectionView.tsx`:
     - Remover inputs de senha em ambos os cards ("Criar Residência" e "Entrar em Residência").
     - Remover exibição de `invite_code` e botão de 1 clique sem código em "Minhas Residências Salvas" (ou ocultar quando o usuário está sem casa).
   - Em `App.tsx`:
     - No `handleConfirmLeaveHouse`, atualizar `setAuthUser((prev) => prev ? { ...prev, house_id: null, role: 'MEMBER' } : null)` e persistir em `domus_auth_user`.
3. **Testes Automatizados:**
   - Em `backend/tests/e2e/lifecycle.e2e.test.ts`: ajustar os passos 3 e 4 para criação e ingresso por código único sem senha.
   - Em `backend/tests/unit/security.test.ts`: manter testes de código de convite e isolar testes de Bcrypt.
4. **Sincronização de Docs:**
   - Atualizar `docs/pages/auth-onboarding.md`, `docs/integrations/api-contracts.md`, `docs/architecture/security.md` e `docs/pages/settings.md`.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` no backend (0 erros)
- [x] `rtk npm run typecheck` no frontend (0 erros)
- [x] `rtk npm test` no backend (22 testes passando)
- [x] `rtk npm run build` no frontend (build de produção concluído com sucesso)

---

## 7. Sincronização com /docs
- [x] `docs/pages/auth-onboarding.md`
- [x] `docs/integrations/api-contracts.md`
- [x] `docs/architecture/security.md`
- [x] `docs/pages/settings.md`
- [x] `docs/tasks/2026-09-04-opcao-a-ingresso-apenas-codigo-unico-e-prevencao-vazamento.md`
