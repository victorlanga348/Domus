# Task: Sincronização Unificada do Código da Casa (Dashboard vs Configurações)
**Data:** 2026-09-05  
**Status:** Concluída (Consolidada em [[docs/tasks/2026-09-05-botao-instalar-app-configuracoes-e-sync-codigo.md]])  
**Specs Impactadas:**  
- `[[docs/architecture/data-model.md]]`
- `[[docs/integrations/api-contracts.md]]`
- `[[docs/pages/settings.md]]`
- `[[docs/pages/dashboard.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Causa-Raiz do Problema
O usuário identificou que o **código de convite da casa exibido na página de Configurações difere do código exibido ao lado do nome da casa no Mural de Recados (Dashboard)**.

### Investigação Técnica & Diagnóstico da Causa-Raiz:
1. **Duplicidade de Fontes da Verdade:**
   - Em [frontend/src/App.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx), ao efetuar login (`handleAuthSuccess`), se a residência ainda não estiver em cache, o estado `currentHouse` é inicializado com um código temporário estático (`invite_code: 'CASA-DOMUS'`) ou o valor antigo persistido no `localStorage`.
   - O [frontend/src/features/settings/components/SettingsView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/settings/components/SettingsView.tsx) consome `currentHouse?.invite_code`.
   - O [frontend/src/features/dashboard/components/DashboardView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/dashboard/components/DashboardView.tsx) faz uma chamada independente para `dashboardApi.getDashboardData()` e renderiza `dashboardData?.house.invite_code`.
2. **Ausência de Sincronização em `App.tsx`:**
   - No hook de inicialização em `App.tsx` (linhas 388-403), a resposta de `dashboardApi.getDashboardData()` recebia `data.house`, mas **apenas sincronizava membros e recados**, ignorando os dados atualizados de `data.house` (`name` e `invite_code`). Com isso, `currentHouse` permanecia com o valor inicial defasado.
3. **Falta de Atualização Bidirecional em Tempo Real:**
   - Quando o código da casa é regenerado pelo Admin ou via WebSocket (`onCodeRegenerated`), o evento atualiza `currentHouse` em `App.tsx`, mas `DashboardView` não recebia a atualização porque mantinha seu próprio estado interno desvinculado.

---

## 2. Solução Proposta

### 2.1 Centralização da Fonte da Verdade em `currentHouse`
1. **Sincronização Imediata em `App.tsx`:**
   Ao obter `dashboardApi.getDashboardData()` em `App.tsx`, atualizar o estado central `currentHouse`:
   ```typescript
   if (data?.house) {
     setCurrentHouse((prev) => ({
       id: data.house.id,
       name: data.house.name,
       invite_code: data.house.invite_code,
     }));
   }
   ```
2. **Propagação Direta para `DashboardView`:**
   Passar `currentHouse` (ou `houseInviteCode` e `houseName`) como prop para `DashboardView`, assegurando que o banner do Mural consuma exatamente o mesmo estado de `currentHouse` que `SettingsView`.
3. **Tratamento de Regeneração de Código em Tempo Real:**
   Garantir que a regeneração de código emita evento e atualize instantaneamente tanto `SettingsView` quanto o banner do Dashboard em todos os dispositivos conectados.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Consistência Absoluta:** O código de convite será rigorosamente idêntico em todas as telas da aplicação (Dashboard, Settings, Modais de Compartilhamento).
  - **Eliminação de Placeholders:** Remove definitivamente o risco de exibir códigos estáticos como `CASA-DOMUS` ou `CASA-....`.
  - **Zero Requisições Redundantes:** Centraliza a governança dos dados da casa no estado de topo do `App.tsx`.
- **Desvantagens / Riscos:**
  - Nenhum risco arquitetural; trata-se de unificação do fluxo de dados reativo no React.

---

## 4. Critérios de Aceitação
- [x] O código da residência exibido no banner do Dashboard é rigorosamente idêntico ao código exibido em Configurações.
- [x] Ao regenerar o código pelo Admin em Configurações, o código atualiza instantaneamente no Dashboard sem necessidade de refresh manual.
- [x] Ao recarregar a página, os dados da casa persistidos em `localStorage` e os retornados pelo backend mantêm-se em sincronia.
- [x] Typecheck e build do frontend passam sem erros (`rtk npm run typecheck` e `rtk npm run build`).

---

## 5. Plano de Implementação (Passo a Passo)
1. Atualizar `App.tsx` para sincronizar `currentHouse` a partir de `data.house` no retorno de `getDashboardData`.
2. Passar `houseInviteCode` e `houseName` de `currentHouse` para `DashboardView`.
3. Validar a atualização simultânea em `DashboardView` e `SettingsView`.
4. Executar testes automatizados e typecheck.
