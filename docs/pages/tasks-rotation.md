# Tela: Quadro de Tarefas & Rodízio

## 1. Objetivo da Tela
Gerenciamento operacional completo das rotinas domésticas, visualização de turnos, atribuições de rodízio e manipulação de locks de execução.

---

## 2. Estrutura e Seções do Layout

### 2.1 Barra de Ferramentas e Filtros
- Filtro por turno (`Todos`, `Manhã`, `Tarde`, `Noite`).
- Filtro por responsável (`Minhas Tarefas`, `Todos os Membros`).
- Botão primário: `[ + Nova Tarefa ]`.

### 2.2 Colunas / Painéis de Turno
Visualização em 3 colunas (Desktop) ou lista segmentada (Mobile):
- **Manhã:** Tarefas matinais com contadores de status.
- **Tarde:** Tarefas do meio do dia.
- **Noite:** Tarefas de encerramento da rotina.

### 2.3 Cartão de Tarefa (`Task Card`)
Cada cartão exibe:
- Título e categoria com ícone temático.
- Avatar e nome do responsável da vez (`currentAssignee`).
- Badge de status (`OPEN`, `LOCKED [Tempo Restante]`, `BLOCKED [Motivo]`, `COMPLETED`).
- Fila de próximos participantes no rodízio (ordem alfabética).
- Botões de ação contextuais:
  - Se `OPEN`: Botão `[ Iniciar ]` e `[ Reportar Impedimento ]`.
  - Se `LOCKED`: Botão `[ Concluir ]` e cronômetro regressivo dos 45 minutos.
  - Se `BLOCKED`: Botão `[ Resolver / Desbloquear ]`.
