# Task: Remoção dos Gatilhos de Ausência & Correção do Cálculo em Tempo Real das Estatísticas
**Data:** 2026-09-02  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/settings.md]]`, `[[docs/pages/reports.md]]`, `[[docs/product/reports-and-metrics.md]]`, `[[README.md]]`

---

## 1. Contexto & Problema

### 1.1 Gatilhos de Ausência em Configurações
Na tela de **Configurações & Gestão da Residência** (`SettingsView.tsx`), existe um card redundante intitulado **"Gatilhos de Ausência / Férias"** com opções fictícias ("Iluminação Inteligente Simulada" e "Pausa em Agendamentos Não Críticos") atreladas ao campo `vacationTriggers` de `SystemPreferences`. Esse card não possui utilidade prática no DOMUS e polui visualmente as preferências. O verdadeiro "Modo Férias" do morador (que salta turnos no motor de tarefas) opera de maneira independente no `Header.tsx` e backend, permanecendo intacto.

### 1.2 Estatísticas Permanecem em 0% Após Concluir Tarefas
Ao concluir uma tarefa no sistema (ex: em `TasksRotationsView.tsx`), o usuário navega para a aba de **Estatísticas** (`StatisticsView.tsx`) e encontra:
- "Quadro de Contribuição dos Moradores": exibe **0% (0 tarefas)** para todos os moradores;
- "Maior Contribuidor do Mês": exibe "Aguardando conclusões" / 0%;
- "Concluídas": permanece em 0;
- "Taxa de Conclusão": exibe 100% ou 0% de forma inconsistente.

**Causa-Raiz Técnica:**
1. Em `App.tsx`, o handler `handleTaskStatusChange` atualiza o estado local das `tasks` (`status: 'completed'`), mas não grava quem concluiu a tarefa (`completedBy`/`completedById`) no objeto da tarefa, nem tenta sincronizar a conclusão via `tasksApi.completeTask`.
2. O componente `StatisticsView.tsx` não recebia as propriedades `tasks` nem `activityLogs` de `App.tsx`, dependendo exclusivamente da chamada de rede `statisticsApi.getStatistics()`.
3. Caso a API backend esteja em execução, o banco não possui registros de `ActivityLog` correspondentes às tarefas manipuladas na sessão do frontend. Caso a API backend não esteja disponível ou em modo de desenvolvimento local, `statisticsApi.getStatistics()` capturava o erro e retornava `null`, deixando a tela sem dados locais (exibindo 0% e 0 tarefas).
4. Em `StatisticsView.tsx`, expressões de fallback utilizavam o operador `||` (ex: `(stats?.harmony.completion_rate || 1) * 100`), convertendo `0` incorretamente em `1` (100%).

---

## 2. Solução Proposta

### 2.1 Remoção dos Gatilhos de Ausência
1. Remover o card JSX "Gatilhos de Ausência / Férias", o estado `vacationTriggers` e o método `handleToggleVacationTriggers` em `SettingsView.tsx`.
2. Readequar o grid de preferências para exibir o card "Modo Noturno" de forma expansiva e responsiva.
3. Excluir `vacationTriggers` da interface `SystemPreferences` (`frontend/src/types.ts`) e de `INITIAL_PREFERENCES` (`frontend/src/data.ts`).
4. Atualizar `docs/pages/settings.md` e `README.md`.

### 2.2 Correção e Cálculo em Tempo Real das Estatísticas
1. **Extensão de Tipagem (`frontend/src/types.ts`):**
   - Adicionar os campos opcionais `completedBy?: string`, `completedById?: string` e `completedAt?: string` à interface `HouseTask`.
2. **Registro de Conclusão (`frontend/src/App.tsx`):**
   - No `handleTaskStatusChange`, ao marcar `status: 'completed'`, registrar `completedBy: authUser?.name || 'Morador'`, `completedById: authUser?.id` e `completedAt: new Date().toISOString()`.
   - Disparar de forma assíncrona e segura `tasksApi.completeTask(taskId, authUser.id).catch(...)` para manter o backend atualizado caso a tarefa possua ID no banco.
   - Repassar as props `tasks={tasks}` e `activityLogs={activityLogs}` para `<StatisticsView />` em `App.tsx`.
3. **Cálculo Híbrido & Reativo (`frontend/src/features/statistics/components/StatisticsView.tsx`):**
   - Receber `tasks: HouseTask[]` e `activityLogs: ActivityLog[]`.
   - Implementar um mecanismo de cálculo dinâmico que consolida instantaneamente as tarefas concluídas da residência:
     - Total de tarefas concluídas (`total_completed`);
     - Contagem e porcentagem exata de cada morador (`(concluidas_do_morador / total_concluidas) * 100`);
     - Determinação do Maior Contribuidor do Mês com número de tarefas e porcentagem;
     - Distribuição de tarefas por turno (Manhã, Tarde, Noite);
     - Taxa de conclusão e pontuação de harmonia ajustadas.
   - Mesclar os dados locais com os dados do endpoint `/v1/statistics` (quando disponível), garantindo que conclusões recentes sejam refletidas de imediato sem delay de rede ou perda de dados.
   - Corrigir fallbacks de número para operador de coalescência nula (`??`).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Feedback Imediato:** Concluir uma tarefa atualiza imediatamente o ranking, porcentagens e métricas na aba de Estatísticas.
  - **Resiliência Offline / Híbrida:** As estatísticas passam a funcionar tanto com backend online quanto offline/local, sem telas vazias de 0%.
  - **Interface Coesa:** Remoção de opções fantasmas em Configurações e foco nas funcionalidades reais do sistema.
  - **Rastreabilidade:** Cada tarefa concluída armazena quem a executou e quando.
- **Desvantagens / Riscos:**
  - Tarefas concluídas em sessões anteriores que não possuíam o campo `completedBy` serão atribuídas ao responsável da tarefa (`nextMember`) ou ao autor do log correspondente.

---

## 4. Critérios de Aceitação
- [x] O card "Gatilhos de Ausência / Férias" não é mais exibido em Configurações.
- [x] O card "Modo Noturno" permanece responsivo e funcional.
- [x] Ao concluir qualquer tarefa (em Tarefas ou Dashboard), a aba Estatísticas reflete de imediato:
  - Incremento no contador de "Concluídas";
  - Atualização do ranking com o nome do morador, contagem de tarefas e percentual correto (ex: 1 tarefa = 100% se for a única concluída);
  - Atualização do "Maior Contribuidor do Mês";
  - Atualização da distribuição por turnos.
- [x] Tipos TypeScript (`SystemPreferences`, `HouseTask`) e dados iniciais atualizados sem erro de lint.
- [x] `rtk npm run typecheck` e `rtk npm run build` no frontend executam com código 0.
- [x] `docs/pages/settings.md`, `docs/pages/reports.md`, `docs/product/reports-and-metrics.md` e `README.md` sincronizados.

---

## 5. Plano de Implementação (Passo a Passo)
1. [x] **Documentação & Specs:**
   - Atualizar `docs/pages/settings.md`, `docs/pages/reports.md`, `docs/product/reports-and-metrics.md` e `README.md`.
2. [x] **Tipagem e Inicializadores:**
   - Em `frontend/src/types.ts`: remover `vacationTriggers` de `SystemPreferences`; adicionar `completedBy`, `completedById` e `completedAt` a `HouseTask`.
   - Em `frontend/src/data.ts`: remover `vacationTriggers` de `INITIAL_PREFERENCES`.
3. [x] **Componente de Configurações:**
   - Em `frontend/src/features/settings/components/SettingsView.tsx`: remover o card de gatilhos, estado `vacationTriggers` e método toggle; ajustar layout do Modo Noturno.
4. [x] **Fluxo de Conclusão e Repasse de Estado (`App.tsx`):**
   - Atualizar `handleTaskStatusChange` para persistir os dados de conclusão na tarefa e tentar sincronizar com `tasksApi.completeTask`.
   - Passar `tasks={tasks}` e `activityLogs={activityLogs}` para `StatisticsView`.
5. [x] **Cálculo Reativo em Estatísticas (`StatisticsView.tsx`):**
   - Aceitar as novas props e implementar motor de consolidação local/híbrido.
   - Corrigir os operadores de fallback de porcentagem e taxa de conclusão.
6. [x] **Validação Técnica:**
   - Executar `rtk npm run typecheck` e `rtk npm run build`.
   - Validar o fluxo de pontuação ao concluir tarefa.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` no frontend concluído com sucesso.
- [x] `rtk npm run build` no frontend concluído com sucesso.
- [x] Teste do cálculo de contribuição de moradores (1 tarefa concluída = 100% de contribuição).
- [x] Teste de ausência do card de gatilhos em Configurações.

---

## 7. Sincronização com /docs
- [x] `docs/pages/settings.md`
- [x] `docs/pages/reports.md`
- [x] `docs/product/reports-and-metrics.md`
- [x] `README.md`
- [x] Matriz de impacto validada em `[[docs/documentation-governance.md]]`.
