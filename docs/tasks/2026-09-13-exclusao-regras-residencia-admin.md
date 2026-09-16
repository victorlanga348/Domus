# Task: Governança e Exclusão Acessível de Regras da Residência para Administradores
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/settings.md]]`, `[[docs/architecture/security.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema

Atualmente, o usuário com privilégios de **Admin Geral** (`Admin Geral`) ou **Admin** (`Admin`) enfrenta dificuldades e inconsistências ao tentar excluir regras de convivência da casa na aba de Configurações (`SettingsView`):
1. **Invisibilidade em Dispositivos Móveis e Touchscreens:** O botão de exclusão de regras em `SettingsView.tsx` utiliza a classe `opacity-0 group-hover:opacity-100`. Como telas touch (smartphones e tablets) não possuem evento `:hover` contínuo do mouse, o ícone de lixeira permanece em `opacity: 0` (100% invisível e inacessível) em celulares.
2. **Touch Target Inadequado e Falta de Affordance no Desktop:** Mesmo no desktop, o botão só aparece ao passar o cursor diretamente sobre a linha da regra, com alvo de toque diminuto (`p-1`) e sem confirmação de segurança, facilitando cliques acidentais ou deixando o usuário sem saber onde clicar.
3. **Ausência de Modal de Confirmação & Feedback:** A exclusão ocorre de forma abrupta sem diálogo de confirmação ("Deseja excluir esta regra da casa?") e sem notificação via Toast confirmando o sucesso da remoção.
4. **Falta de Validação RBAC no Backend:** O endpoint `DELETE /api/rules/:id` não verifica se quem está solicitando a exclusão é de fato um administrador (`Admin Geral` ou `Admin`), violando o princípio do menor privilégio.

---

## 2. Solução Proposta

1. **Frontend - Affordance Visual Acessível e Responsivo (`SettingsView.tsx`):**
   - Garantir que o botão de exclusão de regras esteja sempre visível e utilizável para administradores (`isGeneralAdmin || isAdmin`), tanto em desktop quanto em mobile:
     - No mobile: visível com botão de toque confortável (`min-h-[38px] min-w-[38px]`, ícone de lixeira em vermelho suave/neutro com estado active).
     - No desktop: estilo elegante com transição suave, tooltip explicativo e área de clique ergonômica.
2. **Frontend - Modal de Confirmação de Exclusão (`ConfirmDeleteRuleModal`):**
   - Ao tocar/clicar no botão de lixeira, abrir um modal de confirmação acessível com título, descrição da regra selecionada, botão "Cancelar" e botão destrutivo "Excluir Regra".
   - Após confirmação, disparar notificação Toast (*"Regra da casa removida com sucesso!"*) e registrar auditoria via `recordHouseActivity`.
3. **Backend - Validação Estrita de RBAC (`RulesController` / `RulesService`):**
   - Interceptar a rota `DELETE /api/rules/:id` para exigir que o solicitante possua cargo de `ADMIN` ou `SUB_ADMIN` (`Admin Geral` ou `Admin`). Se um morador regular (`MEMBER`/`Resident`) tentar a exclusão, retornar `403 Forbidden` (`FORBIDDEN_RULE_DELETE`).
4. **Sincronização em Tempo Real (WebSocket):**
   - Garantir a propagação do evento `house:rule_deleted` para atualizar instantaneamente todos os demais dispositivos conectados à residência.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - Resolução definitiva do problema em celulares e telas sensíveis ao toque.
  - Prevenção contra deleções acidentais de regras importantes da residência.
  - Alinhamento rigoroso com as diretrizes de segurança RBAC e acessibilidade (WCAG touch targets).
  - Feedback tátil e visual instantâneo para o morador administrador.
- **Desvantagens / Riscos:**
  - Adição de um passo extra de confirmação (modal), mitigado por um clique simples em "Excluir Regra" com foco acessível.

---

## 4. Critérios de Aceitação

- [x] Administradores (`Admin Geral` e `Admin`) conseguem visualizar e acionar claramente o botão de excluir regra no smartphone e no desktop.
- [x] Moradores comuns (`Resident`) não visualizam botões de exclusão de regras e não podem acionar a rota.
- [x] Um modal de confirmação é exibido antes de excluir a regra, evitando exclusões acidentais.
- [x] A exclusão reflete instantaneamente no estado local, no PostgreSQL e via WebSocket (`house:rule_deleted`) para outros clientes.
- [x] O backend bloqueia requisições de remoção de regra vindas de moradores sem cargo administrativo com `403 Forbidden`.
- [x] Um Toast de sucesso é exibido após a exclusão.
- [x] Typecheck e testes passam com sucesso (`rtk npm run typecheck` e `rtk npm run test:unit`).

---

## 5. Plano de Implementação (Passo a Passo)

1. [x] **Backend (`backend/src/modules/rules/rules.controller.ts` & `rules.service.ts`):** Adicionar checagem de permissão RBAC exigindo que `userRole` seja `ADMIN` ou `SUB_ADMIN`.
2. [x] **Frontend - Modal e Botão (`SettingsView.tsx`):**
   - Adicionar estado `ruleToDelete: HouseRule | null`.
   - Adicionar modal de confirmação de exclusão de regra de convivência.
   - Tornar o botão de lixeira visível no mobile (`opacity-100 sm:opacity-0 sm:group-hover:opacity-100`) com alvo de toque de 38x38px.
   - Disparar Toast de feedback.
3. [x] **Frontend - API & App (`rulesApi.ts` & `App.tsx`):**
   - Enviar header `x-user-role` na criação e exclusão de regras.
   - Registrar log de auditoria em `ActivityLog` ao remover regra.
4. [x] **Validação Técnica:**
   - `rtk npm run typecheck` no frontend e backend (0 erros).
   - `rtk npm run test:unit` no backend (57 testes aprovados).
   - `rtk npm run build` em ambos os ambientes.
5. [x] **Sincronização & Governança:** Atualizar `docs/pages/settings.md` e `docs/architecture/security.md`.

---

## 6. Validação e Testes

- [x] `rtk npm run typecheck` (Frontend) - 0 erros
- [x] `rtk npm run typecheck` (Backend) - 0 erros
- [x] `rtk npm run test:unit` (Backend) - 57 testes aprovados
- [x] `rtk npm run build` (Frontend) - Concluído com sucesso em 5.35s
- [x] `rtk npm run build` (Backend) - Concluído com sucesso

---

## 7. Sincronização com /docs

- [x] `docs/pages/settings.md`
- [x] `docs/architecture/security.md`
- [x] Matriz de impacto validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
