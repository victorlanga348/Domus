# Task: Remoção de Despesas, Criação de Tabelas no Banco e Visibilidade Universal de Tarefas

**Data:** 2026-09-08  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/product/tasks-rotation.md]]`
- `[[docs/pages/tasks-rotation.md]]`
- `[[docs/product/meals-menu.md]]`
- `[[docs/pages/settings.md]]`
- `[[docs/architecture/data-model.md]]`
- `[[docs/integrations/api-contracts.md]]`
- `[[docs/copywriting/microcopy.md]]`
- `[[docs/pages/wallet.md]]` (Descontinuado/Removido)
- `[[docs/product/wallet-and-expenses.md]]` (Descontinuado/Removido)

---

## 1. Contexto & Problema

1. **Módulo Indesejado de Despesas e Reembolso:**
   - O Domus possui atualmente uma aba e módulo de "Carteira / Despesas / Reembolso" (`WalletView`, `CreateExpenseModal`, `ExpenseItem`) que o usuário determinou explicitamente que **não deve fazer parte do produto**.
2. **Dados Críticos Fora do Banco de Dados (Dependência Frágil de `localStorage`):**
   - Entidades como **Refeições / Cardápio Semanal** (`MealPlan` / `meals`), **Regras da Casa** (`houseRules`), **Preferências da Residência** (`preferences`) e **Status de Presença** operam salvas em `localStorage` individual do navegador.
   - Quando um morador acessa de outro dispositivo, navegador limpo ou um novo morador entra na casa, ele não enxerga essas configurações porque elas não estão persistidas no PostgreSQL centralizado.
3. **Problema Crítico de Visibilidade para Novos Moradores:**
   - Quando um morador novo ingressa na residência, as tarefas e rodízios existentes na casa não aparecem para ele até que o Admin Geral edite manualmente a tarefa e o adicione à fila.
   - Além disso, o histórico de atividades e o que já foi feito na residência deve ser universalmente visível para **todos os membros que pertencem àquela casa**, sem exceções: qualquer um na residência deve poder ver tudo o que foi feito, o que está pendente e o que será feito no futuro, mesmo que não seja participante da tarefa.

---

## 2. Solução Proposta

### 2.1 Remoção Completa de Despesas e Reembolso
- Excluir o módulo de Carteira do frontend:
  - Remover a aba `'wallet'` da navegação principal em `App.tsx` (Menu Desktop, Menu Mobile, atalhos).
  - Remover `WalletView.tsx` e referências a despesas em `types.ts` (`ExpenseItem`).
  - Remover o modal `CreateExpenseModal` de `Modals.tsx`.
  - Remover chamadas a `domus_expenses` e funções `handleAddExpense` / `handleSettleExpense`.
  - Descontinuar e remover specs de documentação: `docs/pages/wallet.md` e `docs/product/wallet-and-expenses.md`.

### 2.2 Visibilidade Universal Irrestrita de Tarefas e Histórico
- **Garantia de Visibilidade Canônica (`house_id`):**
  - Todas as tarefas (passadas, em andamento, concluídas e rodízios) associadas à residência ativa (`house_id`) devem ser retornadas pelo backend e renderizadas no frontend para **qualquer morador da casa**, independentemente de ele participar ou não da escala.
  - O fato de um morador ter entrado depois na casa não oculta nenhuma tarefa ou histórico dele.
- **Correção da Persistência de Participantes em `TasksRotationsView.tsx`:**
  - Corrigir a criação de tarefas no frontend para enviar a lista completa de `participant_ids` selecionados no modal ao backend (`tasksApi.createTask`).
  - Assegurar que tarefas de rodízio criadas no backend sejam automaticamente mapeadas para a lista de `rotations` no frontend para qualquer usuário que consultar a casa.
  - Na aba de Rodízios: todo morador da casa visualiza todos os rodízios ativos com seus participantes e o indicador da vez, mesmo que o morador autenticado ainda não tenha sido escalado.

### 2.3 Criação das Tabelas Faltantes no Banco de Dados (PostgreSQL via Prisma)
Adicionar ao `backend/src/database/schema.prisma` e gerar migrações para as seguintes entidades:
1. **`HouseRule` (`house_rules`):**
   - `id` (uuid), `house_id` (fk House), `number` (int), `title` (string), `description` (text), `created_at`, `updated_at`.
2. **`HousePreference` (`house_preferences`):**
   - `id` (uuid), `house_id` (fk House, unique), `night_mode` (boolean), `start_time` (string), `end_time` (string), `created_at`, `updated_at`.
3. **`MealPlan` (`meal_plans`) & `MealItem` (`meal_items`):**
   - `MealPlan`: `id` (uuid), `house_id` (fk House, unique), `is_locked` (boolean), `locked_by_id` (fk User?), `locked_at` (datetime?), `schedules_json` (text?), `created_at`, `updated_at`.
   - `MealItem`: `id` (uuid), `meal_plan_id` (fk MealPlan), `day_of_week` (string), `meal_type` (string), `title` (string), `description` (text?), `tags_json` (text?), `updated_by` (string?), `created_at`, `updated_at`.
4. **`MemberStatus` (`member_statuses`):**
   - `id` (uuid), `house_id` (fk House), `user_id` (fk User), `location` (string), `icon` (string), `updated_at`.

### 2.4 Endpoints e Serviços no Backend
- Criar rotas e serviços REST integrados ao PostgreSQL:
  - `/api/rules`: `GET /?houseId=...`, `POST /`, `DELETE /:id`
  - `/api/preferences`: `GET /?houseId=...`, `PUT /`
  - `/api/meals`: `GET /?houseId=...`, `PUT /`, `POST /lock`, `POST /unlock`, `PUT /schedules`
- Conectar o frontend a esses endpoints para sincronização em tempo real e eliminação definitiva do `localStorage` como fonte de dados da residência.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - **Foco e Clareza de Produto:** Elimina o ruído de recursos não desejados (despesas/reembolso), tornando o Domus focado em organização doméstica, rodízios, convivência e rotinas.
  - **Zero Dependência de LocalStorage:** Novos moradores e acessos em novos dispositivos recebem instantaneamente todas as informações da residência a partir do PostgreSQL.
  - **Transparência Total de Convivência:** Nenhum morador fica desinformado sobre a rotina da casa; todos acompanham tarefas futuras e o histórico do que foi feito.
- **Desvantagens / Riscos:**
  - Requer execução de `prisma db push` / migração no banco de dados e atualização de schemas TypeScript em backend e frontend.
  - Remoção de código em múltiplos pontos (rotas, types, modais).

---

## 4. Critérios de Aceitação

- [x] A aba de Carteira / Despesas / Reembolso foi totalmente removida do layout, navegação e código.
- [x] O modal de lançamento de despesas foi removido.
- [x] Um morador recém-entrado na casa visualiza imediatamente todas as tarefas (pendentes e concluídas) e todos os rodízios já criados, sem necessidade de intervenção do Admin.
- [x] Um morador que não faça parte dos participantes de uma tarefa consegue visualizá-la e ver o histórico em Relatórios/Notificações.
- [x] O `schema.prisma` contém os modelos `HouseRule`, `HousePreference`, `MealPlan`, `MealItem` e `MemberStatus`.
- [x] O banco de dados PostgreSQL foi sincronizado via Prisma.
- [x] Endpoints de backend para refeições, regras e preferências implementados e funcionais.
- [x] O frontend consome os dados centralizados do backend para refeições, regras e preferências.
- [x] Documentação `/docs` sincronizada (remoção de wallet, atualização de data-model e tasks-rotation).
- [x] Testes unitários e typecheck passando com 100% de sucesso.

---

## 5. Plano de Implementação (Passo a Passo)

1. **Remoção de Despesas / Wallet:**
   - Excluir diretório `frontend/src/features/wallet/`.
   - Limpar aba `'wallet'` de `frontend/src/App.tsx` e componentes de menu/header.
   - Remover modal `CreateExpenseModal` de `frontend/src/components/Modals.tsx`.
   - Excluir `docs/pages/wallet.md` e `docs/product/wallet-and-expenses.md`.
2. **Correção de Visibilidade Universal de Tarefas:**
   - Em `frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx`: garantir que `onAddTask` repasse `participantIds: participants.map(p => p.id)`.
   - Em `frontend/src/App.tsx`: garantir que `mapBackendTasksToRotations` gere cartões de rodízio mesmo quando o usuário logado não for participante, e mapeie corretamente todas as tarefas ativas da casa.
   - Garantir que `tasksApi.getTasks(houseId)` alimente o estado de tarefas e rodízios na entrada de qualquer usuário na casa.
3. **Database Schema & Prisma:**
   - Adicionar os modelos `HouseRule`, `HousePreference`, `MealPlan`, `MealItem` e `MemberStatus` em `backend/src/database/schema.prisma`.
   - Executar migração do Prisma (`rtk npx prisma db push` ou migration).
4. **Backend Modules (Rules, Preferences, Meals):**
   - Implementar repositories, services, controllers e rotas para `house_rules`, `preferences` e `meals`.
   - Registrar as novas rotas no Express.
5. **Frontend Integration:**
   - Criar serviços de API no frontend para buscar e salvar regras, preferências e refeições no PostgreSQL.
   - Conectar `MealsView.tsx` e `SettingsView.tsx` às APIs.
6. **Testes e Validação:**
   - Testes unitários no backend e typecheck em ambos os pacotes.
   - Validação de build.
7. **Sincronização de Docs e Commit:**
   - Atualizar `/docs` e registrar commit em português.
