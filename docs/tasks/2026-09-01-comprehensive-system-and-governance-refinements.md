# Task: Refinamentos Abrangentes de Governança, Notificações em Tempo Real, Tradução Integral e UX
**Data:** 2026-09-01  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/dashboard.md]]`, `[[docs/pages/settings.md]]`, `[[docs/components/modals.md]]`, `[[docs/layouts/navigation.md]]`, `[[docs/architecture/security.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema
1. **Logs de Acesso Desnecessários:** A tela de configurações e modais ainda carregavam a funcionalidade de logs de acesso.
2. **Glitch de Estado ao Trocar e Reentrar de Residência:** Ao reentrar em uma residência existente, o frontend temporariamente atribuía o usuário como "Admin Geral" e inseria uma notificação local de fundação.
3. **Sobreposição Visual de Tags de Cargo e E-mail:** O badge de classificador (`👑 Admin Geral` / `Admin` / `Morador`) sobrepunha o texto do e-mail no card de membros.
4. **Localização Incompleta (Inglês Residual):** Diversos textos, botões, modais e títulos estavam em inglês.
5. **Dashboard com Conteúdo Duplicado de Tarefas:** O Dashboard continha tarefas/rodízios duplicados em vez de focar estritamente no **Mural de Recados**.
6. **Edição de Status Irrestrita:** Um morador conseguia editar o status de outros membros no Drawer.
7. **Promoção e Despromoção de Cargos:** O Admin Geral precisava de controle intuitivo para promover `Resident` -> `Admin`, despromover `Admin` -> `Resident` e transferir liderança única.
8. **Remoção Hierárquica de Membros:** O Admin Geral pode remover qualquer membro (morador ou admin), enquanto Admins específicos só podem remover moradores comuns.
9. **Notificações Desconectadas Entre Dispositivos:** As notificações de atividades (`activityLogs`) eram armazenadas isoladamente no navegador de cada usuário sem sincronização via WebSocket.

---

## 2. Solução Proposta

### 2.1 Limpeza & Foco de Telas
- **Remover Logs de Acesso:** Excluído `AccessLogsModal` e referências em `SettingsView.tsx`, `Header.tsx` e `App.tsx`.
- **Dashboard 100% Focado no Mural de Recados:** Reestruturada `DashboardView.tsx` para apresentar com destaque o Mural de Recados interativo da residência.

### 2.2 Correção de Papéis & Estado de Entrada em Residência
- `handleHouseSelected` em `App.tsx` agora preserva dados da residência e o papel exato do usuário sem criar logs de fundação indevidos.

### 2.3 Ajuste Visual e Anti-Sobreposição em Cards de Membros
- Reestruturado o card de membros em `SettingsView.tsx` e `FamilyMembersDrawer` com layout flexível, garantindo que o badge de papel nunca sobreponha o e-mail ou o nome.

### 2.4 Tradução Integral para Português (PT-BR / PT-PT)
- Tradução de 100% dos textos do projeto em modais, cabeçalhos, formulários e abas.

### 2.5 Permissões Estritas de Status e Remoção
- **Edição de Status:** No `FamilyMembersDrawer`, o botão de alterar status só é exibido para o próprio usuário autenticado (`member.id === authUser.id`).
- **Remoção Hierárquica:**
  - `Admin Geral`: Pode remover moradores (`Resident`) e outros `Admin`.
  - `Admin Normal`: Pode remover apenas moradores (`Resident`/`Guest`).
  - `Resident`: Não possui botões de remoção.

### 2.6 Notificações Sincronizadas em Tempo Real (WebSocket)
- Adicionado evento `house:log` e `house:activity_log` no servidor WebSocket (`socketServer.ts`) e cliente (`socketClient.ts`, `useHouseSocket.ts`).
- Notificações de atividades são sincronizadas em tempo real entre todas as contas conectadas.

---

## 3. Análise de Trade-offs & Desvantagens
- **Vantagens:**
  - Experiência do usuário limpa, consistente, moderna e 100% em português.
  - Eliminação de inconsistências visuais e comportamentais de cargos e logs.
  - Sincronização multi-dispositivo completa (presença + chat + tarefas + notificações em tempo real).
- **Desvantagens & Riscos:**
  - **Restrição de Edição de Status:** Ao limitar a edição estritamente ao próprio usuário, se um morador esquecer de atualizar seu status ao sair de casa, outros moradores ou administradores não poderão atualizá-lo em seu lugar (privacidade estrita).
  - **Remoção Irreversível:** A remoção de um morador por um Admin remove seus acessos imediatos e exige que ele use um novo convite para retornar.
  - **Tráfego WebSocket Adicional:** O broadcast em tempo real de logs consome tráfego contínuo nas conexões ativas.

---

## 4. Critérios de Aceitação
- [x] Logs de acesso completamente removidos da interface e do código.
- [x] Ao alternar entre residências e reentrar, o usuário preserva seu papel exato sem aparecer temporariamente como Admin Geral nem gerar notificações de fundação fantasmas.
- [x] Cards de membros exibem nome, e-mail e badges de cargos sem sobreposição visual em qualquer tamanho de tela.
- [x] Toda a interface do sistema está 100% traduzida para Português.
- [x] A tela de Dashboard contém exclusivamente o Mural de Recados institucional.
- [x] Cada morador só consegue alterar o seu próprio status/localização.
- [x] O Admin Geral consegue promover e despromover admins e moradores.
- [x] Admin Geral e Admins normais podem remover membros, respeitando a trava de que apenas o Admin Geral pode remover outros admins.
- [x] Notificações de atividades são sincronizadas em tempo real via WebSocket entre todos os moradores da mesma residência.
- [x] Typecheck e builds de frontend e backend passam com 100% de sucesso.

---

## 5. Validação e Testes
- [x] Typecheck Frontend (`tsc --noEmit`): **0 erros**.
- [x] Typecheck Backend (`tsc --noEmit`): **0 erros**.
- [x] Build de Produção Frontend (`vite build`): **Sucesso**.
- [x] Build de Produção Backend (`tsc`): **Sucesso**.

---

## 6. Sincronização com /docs
- [x] `docs/pages/dashboard.md` atualizado.
- [x] `docs/pages/settings.md` atualizado.
- [x] `docs/components/modals.md` atualizado.
- [x] Matriz de impacto validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)

---

## 5. Plano de Implementação (Passo a Passo)

### Passo 1: Backend - Broadcast de Notificações em Tempo Real
1. Atualizar `backend/src/shared/socket/socketServer.ts` para escutar e repassar eventos de `house:activity_log`.

### Passo 2: Frontend - Camada de Socket e Sincronização de Notificações
1. Atualizar `frontend/src/shared/socket/socketClient.ts` e `useHouseSocket.ts` com o listener `onActivityLog`.
2. Em `frontend/src/App.tsx`, conectar o evento para atualizar `activityLogs` em tempo real em todas as sessões conectadas.

### Passo 3: Limpeza de Logs de Acesso e Ajuste do Dashboard
1. Remover `AccessLogsModal` e referências em `SettingsView.tsx`, `Header.tsx` e `App.tsx`.
2. Reestruturar `DashboardView.tsx` para focar exclusivamente no Mural de Recados.

### Passo 4: Governança de Membros, Remoção e Status Pessoal
1. Adicionar funcionalidade de remoção hierárquica em `SettingsView.tsx` e `FamilyMembersDrawer`.
2. Travar edição de status apenas para o usuário atual no `FamilyMembersDrawer`.
3. Ajustar o layout dos cards de membros para eliminar sobreposição de texto.
4. Corrigir `handleHouseSelected` em `App.tsx` para evitar atribuição incorreta de Admin Geral e logs de fundação indevidos.

### Passo 5: Tradução Completa de Todas as Telas para Português
1. Traduzir todos os textos em `Sidebar.tsx`, `Header.tsx`, `SettingsView.tsx`, `Modals.tsx`, `TasksRotationsView.tsx`, `ReportsView.tsx` e `StatisticsView.tsx`.

### Passo 6: Validação Técnica e Governança de Documentação
1. Executar `rtk npm run typecheck:frontend` e `rtk npm run build:frontend`.
2. Sincronizar todos os documentos em `/docs`.
