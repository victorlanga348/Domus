# Tela: Relatórios & Estatísticas

## 1. Objetivo da Tela
Apresentar métricas consolidadas sobre o cumprimento das rotinas domésticas, índice de equilíbrio nas tarefas e históricos de bloqueios.

---

## 2. Estrutura e Seções do Layout

### 2.1 Gráfico de Conclusão por Membro
- Gráfico de barras ou rosca indicando quantas tarefas cada membro completou na semana/mês atual.

### 2.2 Eficiência por Turno
- Métricas de cumprimento nos turnos da Manhã, Tarde e Noite.

### 2.3 Registro de Impedimentos Frequentes
- Tabela analítica dos motivos de bloqueio mais recorrentes para apoiar a reposição de insumos.

### 2.4 Histórico de Tarefas & Governança de Reversão
- Lista cronológica de tarefas finalizadas com filtros por membro, status e busca textual.
- **Governança de Reversão:** Ação de reverter tarefa para pendente disponível exclusivamente para o **Admin Geral** e **Sub-Admins**, exigindo modal de confirmação antes da chamada à API.
- **Moradores Comuns:** Visualizam os itens com o selo `"Concluída"` sem botões de reversão.

### 2.5 Estados de Carregamento (`ReportsSkeleton`)
- Durante o carregamento e paginação inicial de relatórios e logs de atividade (`loading === true`), a visão renderiza o `ReportsSkeleton` com placeholders de busca, filtros e linhas de tarefas para evitar Layout Shift.
