# Módulo: Relatórios, Auditoria & Métricas de Convivência

## 1. Métricas Principais

### 1.1 Taxa de Conclusão por Turno
Percentual de tarefas planejadas para o turno da Manhã, Tarde e Noite que foram marcadas como `COMPLETED` dentro do horário previsto.

### 1.2 Distribuição de Execuções (Índice de Equidade)
Gráfico comparativo demonstrando quantas tarefas cada membro executou no período (semana/mês), evidenciando se o rodízio está equilibrado.

### 1.3 Histórico de Impedimentos & Bloqueios
Relatório de ocorrências de tarefas em estado `BLOCKED`, listando os motivos frequentes (ex: "Falta de detergente", "Vassoura quebrada") para orientar compras e reposições.

---

## 2. Auditoria e Registro de Atividades (`ActivityLog`)
Todos os eventos críticos são gravados com timestamp preciso, `userId` e payload detalhado:
- `TASK_LOCKED`: Quando uma tarefa foi iniciada e por quem.
- `TASK_COMPLETED`: Quando foi finalizada e qual foi o próximo membro sorteado na rotação.
- `TASK_BLOCKED`: Quando um impedimento foi relatado e qual o motivo.
- `USER_VACATION_TOGGLED`: Quando um morador entrou ou saiu de férias.
