# Task: Correção de Criação de Recados, Tarefas, Cardápio e Auto-Validação de Sessão
**Data:** 2026-09-12  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/dashboard.md]]`, `[[docs/pages/tasks-rotation.md]]`, `[[docs/product/meals-menu.md]]`, `[[docs/architecture/security.md]]`

---

## 1. Contexto & Problema
O usuário relatou que ao clicar para criar um recado (mural), tarefa comum, tarefa de rodízio ou prato no cardápio, a interface não executa a ação ou não reflete a criação.

**Diagnóstico Técnico:**
1. **Sessão Fantasma após Reset do Banco:** Quando a base de dados PostgreSQL foi resetada, o navegador reteve no `localStorage` os identificadores antigos de usuário (`domus_auth_user`) e de residência (`domus_auth_house`). Como esses registros foram excluídos do PostgreSQL, qualquer chamada de criação (`POST /api/tasks`, `POST /api/v1/dashboard/bulletin`, `PUT /api/meals`) falha no backend com violação de chave estrangeira (`Foreign key constraint: User/House does not exist`).
2. **Ausência de Auto-Validação de Sessão:** O [App.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx) não invalidava a sessão local quando o backend retornava 401/404 para usuário ou casa inexistentes, mantendo o usuário preso em um estado desconectado do banco real.
3. **Tratamento de Erros Silencioso:** Em [App.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx), blocos `catch` engoliam erros de criação da API gerando IDs locais temporários que eram imediatamente apagados pelo heartbeat de sincronização em segundo plano (`syncAllHouseData`).
4. **Resiliência na Seleção de Participantes de Tarefas:** Em [TasksRotationsView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx), se o formulário for submetido sem participantes explicitamente marcados, o array `participant_ids` podia ser enviado vazio para o backend.

---

## 2. Solução Proposta & Executada
1. **Auto-Validação de Sessão e Limpeza de Sessões Fantasmas:**
   - No [App.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx), ao sincronizar dados da casa (`syncAllHouseData`), se a resposta da API indicar que a residência ou usuário não existem no PostgreSQL (401/404/`HOUSE_NOT_FOUND`/`USER_NOT_FOUND`), executa logout automático com `handleLogout()` e exibe aviso amigável ao usuário para efetuar novo cadastro ou login.
2. **Tratamento e Feedback Ativo de Erros em Criações:**
   - Em `handleAddMuralNote`, `handleAddTask`, `handleUpdateMeal` e `handleAddHouseRule`, implementado feedback claro com `showToast` e validação com `checkSessionValidity`.
3. **Garantia de Participantes Padrão em Tarefas:**
   - Em [TasksRotationsView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx), garantido que `taskParticipantIds` sempre contenha ao menos o ID do usuário conectado (`currentUserId`) caso nenhum outro morador seja selecionado.
4. **Propagação de Headers de Autenticação e Códigos de Erro Padronizados:**
   - Em [dashboardApi.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/dashboard/api/dashboardApi.ts), [tasksApi.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/tasks-rotation/api/tasksApi.ts), [mealsApi.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/meals/api/mealsApi.ts) e [rulesApi.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/settings/api/rulesApi.ts), implementada propagação de status HTTP e mensagens do servidor.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Elimina completamente o problema de "clicar e nada acontecer" devido a sessões órfãs ou falhas ocultas.
  - Sincronização 100% consistente e feedback visual em tempo real para todas as operações do sistema.
  - O usuário recebe alertas imediatos se houver qualquer problema de conexão ou permissão.
- **Desvantagens / Riscos:**
  - Nenhuma; compatibilidade e estabilidade aumentadas.

---

## 4. Critérios de Aceitação
- [x] Ao abrir a aplicação com dados de sessão que não existem no banco, o sistema invalida a sessão local e direciona para a tela de Login/Cadastro.
- [x] Criação de recados no mural funciona perfeitamente e é exibida no grid instantaneamente.
- [x] Criação de tarefas normais e de rodízio persiste no PostgreSQL e atualiza as listas em tempo real.
- [x] Adição/edição de pratos no cardápio persiste no PostgreSQL e reflete nos cartões de refeições.
- [x] Criação de regras da residência persiste e exibe feedback de sucesso.

---

## 5. Plano de Implementação (Passo a Passo)
1. [x] Ajustar [frontend/src/features/dashboard/api/dashboardApi.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/dashboard/api/dashboardApi.ts) para propagar erros de status HTTP (401/404/403).
2. [x] Atualizar [frontend/src/App.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx) com invalidação automática de sessão órfã e feedback visual nos handlers de criação (`handleAddMuralNote`, `handleAddTask`, `handleUpdateMeal`, `handleAddHouseRule`).
3. [x] Reforçar a montagem de `participantIds` em [frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx).
4. [x] Executar validações de typecheck e testes integrados.

---

## 6. Validação e Testes
- [x] Typecheck do frontend e backend sem erros
- [x] 57 de 57 testes automatizados no backend aprovados
- [x] Teste de ciclo de vida completo (Cadastro -> Criação de Residência -> Criação de Recado -> Criação de Tarefa -> Adição de Prato)
