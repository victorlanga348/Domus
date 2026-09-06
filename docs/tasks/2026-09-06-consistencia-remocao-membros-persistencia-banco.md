# Task: Persistência Real e Consistência na Remoção de Moradores da Residência
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/settings.md]]`, `[[docs/components/modals.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema
Ao remover um morador da residência através do menu de configurações (`SettingsView` / `Modals`):
1. O número de moradores não muda ou reverte quase instantaneamente.
2. Ao recarregar a página ou sair e reentrar na aplicação, os moradores previamente removidos reaparecem na lista.

### Causa-Raiz Técnica (Isolada)
- O manipulador `handleRemoveMember` em `frontend/src/App.tsx` apenas alterava o estado em memória `familyMembers` e a chave local `localStorage`, emitindo em seguida o evento WebSocket `members:updated`.
- **Não existia nenhum endpoint de remoção de membros no backend.** O backend nunca atualizava o registro do usuário (`user.house_id`).
- O evento WebSocket e o carregamento da tela disparavam imediatamente `fetchDashboard()`, que chamava `dashboardApi.getDashboardData(...)`. Como o PostgreSQL ainda continha o morador associado à casa (`house_id`), a API devolvia a lista completa de moradores do banco, sobrescrevendo o estado local e reintroduzindo os usuários removidos em fração de segundos.

---

## 2. Solução Proposta

1. **Novo Endpoint no Backend (`HouseService.removeMember` & `HouseController.removeMember`):**
   - Rota: `POST /api/house/remove-member` (e alias `DELETE /api/house/members/:memberId`).
   - Validações de RBAC:
     * Apenas Administrador Geral (`ADMIN`) ou Sub-Administrador (`Admin`) podem remover membros.
     * Ninguém pode remover o Administrador Geral da casa (`target.role === 'ADMIN'` bloqueado com 403).
     * O usuário não pode auto-remover-se por este método (deve usar `leaveHouse`).
     * O morador deve pertencer à mesma residência do solicitante.
   - Transação Atômica (`prisma.$transaction`):
     * Desvincula o morador: `user.house_id = null` e reseta cargo para `MEMBER`.
     * Remove o morador de participações em tarefas da residência (`task_participants`).
     * Registra log de auditoria na tabela `activity_logs`.
     * Emite eventos WebSocket `house:member_removed` e `house:members_updated`.

2. **Integração no Frontend (`authApi.removeMember` & `App.tsx`):**
   - Adicionar o método `authApi.removeMember(houseId, memberId, requesterId, requesterRole, token)` consumindo o novo endpoint.
   - Atualizar `handleRemoveMember` em `App.tsx` para executar a chamada assíncrona antes de atualizar os estados locais.
   - Invalidar o cache do dashboard (`domus_dashboard_${houseId}`) para que novas consultas reflitam a contagem exata imediatamente.
   - Garantir que a exibição do total de moradores em `DashboardView.tsx` reflita rigorosamente `familyMembers.length`.

3. **Isolamento de Governança nas Configurações (`SettingsView` vs `FamilyMembersDrawer`):**
   - Remover os botões e ações administrativas (`Tornar Admin`, `Despromover`, `Passar Admin Geral`, `Remover`) do drawer de status dos moradores (`FamilyMembersDrawer` em `Modals.tsx`).
   - O `FamilyMembersDrawer` deve ser estritamente informativo sobre status, localização e presença dos moradores.
   - Todas as operações de governança de membros (promover, despromover, transferir liderança geral e remover) ficam concentradas exclusivamente na aba de **Configurações** (`SettingsView.tsx` através do `MemberActionDropdown.tsx`).

4. **Testes Unitários:**
   - Adicionar testes de unidade para as regras de validação de remoção de moradores (proibir auto-remoção, proibir remoção do Admin Geral, autorizar Admin Geral e rejeitar moradores comuns).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  * Consistência absoluta entre PostgreSQL, localStorage e estado React.
  * Elimina race conditions de sincronização via WebSocket.
  * Desassocia tarefas em andamento do usuário removido, evitando tarefas órfãs.
  * Interface despoluída: separação clara entre acompanhamento de status do dia a dia e governança administrativa em Configurações.
- **Desvantagens / Riscos:**
  * Caso o morador seja removido acidentalmente, ele precisará reinserir o código de convite da casa (`invite_code`) para ingressar novamente como Morador regular.

---

## 4. Critérios de Aceitação
- [x] Endpoint `POST /api/house/remove-member` desvincula o morador no PostgreSQL (`house_id = null`).
- [x] O Admin Geral não pode ser removido (retorna 403 `CANNOT_REMOVE_GENERAL_ADMIN`).
- [x] Morador comum (MEMBER) é impedido com 403 de remover outros usuários.
- [x] O frontend chama a API no `handleRemoveMember`, limpa o cache local e atualiza a interface.
- [x] Ao recarregar a aplicação ou sair e reentrar, o morador removido **não** reaparece.
- [x] O contador de moradores no Dashboard e nas Configurações reflete a quantidade real instantaneamente.
- [x] O drawer de status (`FamilyMembersDrawer`) não exibe ações de promoção, despromoção ou remoção.
- [x] As promoções, despromoções e remoções operam exclusivamente em Configurações (`SettingsView`).
- [x] `rtk npx tsc --noEmit` e `rtk npx vite build` no frontend sem erros.
- [x] Testes unitários do backend aprovados sem regressões.

---

## 5. Plano de Implementação (Passo a Passo)
1. Backend: Implementar método `removeMember` em `houses.service.ts`.
2. Backend: Implementar handler `removeMember` em `houses.controller.ts` e registrar rotas em `houses.routes.ts`.
3. Backend: Adicionar testes unitários das regras de remoção.
4. Frontend: Adicionar método `removeMember` em `authApi.ts`.
5. Frontend: Conectar `handleRemoveMember` em `App.tsx` com tratamento de erro e limpeza de cache.
6. Frontend: Limpar ações de governança em `FamilyMembersDrawer` (`Modals.tsx` e `App.tsx`).
7. Frontend: Validar contador em `DashboardView.tsx`.
8. Executar testes e build de ponta a ponta.
