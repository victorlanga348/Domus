# DOMUS — Índice Mestre da Documentação (/docs)

Bem-vindo ao centro oficial de especificações e governança técnica do **DOMUS Living System**.

> **Regra Primária de Desenvolvimento:**  
> O diretório `/docs` é a **única fonte oficial da verdade**. Nenhuma linha de código deve ser alterada ou criada sem que a especificação correspondente esteja atualizada e aprovada.

---

## Mapa da Documentação

### 1. Governança e Regras Operacionais
- [AGENTS.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/AGENTS.md) — Guardião na raiz com regras invioláveis para agentes de IA.
- [documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md) — Matriz de Impacto e Checklist de encerramento de tarefas.
- [tasks/template.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/tasks/template.md) — Template padrão para criação de planos de tarefas e sprints.

---

### 2. Arquitetura & Engenharia (`/docs/architecture`)
- [architecture/stack.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/architecture/stack.md) — Monorepo, Clean Architecture, React 19, TypeScript e Express.
- [architecture/data-model.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/architecture/data-model.md) — Diagrama ERD e dicionário de entidades (`House`, `User`, `Task`, `Expense`, `ActivityLog`).
- [architecture/concurrency-and-locks.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/architecture/concurrency-and-locks.md) — Lock temporizado de 45 minutos, stale locks e algoritmo de rodízio.
- [architecture/security.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/architecture/security.md) — Autenticação 2FA (House Code + PIN), JWT e isolamento multi-tenant.

---

### 3. Marca & Identidade Visual (`/docs/brand`)
- [brand/identity.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/brand/identity.md) — Conceito do Living System, tom de voz sereno e cores institucionais.

---

### 4. Design System & Responsividade (`/docs/design`)
- [design/tokens.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/design/tokens.md) — Tokens CSS, paleta cromática de estados, glassmorphism e sombras.
- [design/responsive.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/design/responsive.md) — Breakpoints (Mobile, Tablet de bancada, Desktop) e alvos de toque.

---

### 5. Regras de Negócio & Produto (`/docs/product`)
- [product/overview.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/product/overview.md) — Problemas resolvidos e proposta de valor do DOMUS.
- [product/tasks-rotation.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/product/tasks-rotation.md) — Ciclo de vida da tarefa, turnos operacionais e salto de férias.
- [product/wallet-and-expenses.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/product/wallet-and-expenses.md) — Divisão paritária de despesas e cálculo de balanços devedores/credores.
- [product/reports-and-metrics.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/product/reports-and-metrics.md) — Indicadores de cumprimento, auditoria e equidade.

---

### 6. Estrutura de Telas / Páginas (`/docs/pages`)
- [pages/dashboard.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/pages/dashboard.md) — Visão geral da residência, resumo do turno e feed de atividades.
- [pages/tasks-rotation.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/pages/tasks-rotation.md) — Quadro de tarefas por turno, botões de ação e contadores.
- [pages/wallet.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/pages/wallet.md) — Painel financeiro, saldos líquidos e lista de despesas.
- [pages/reports.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/pages/reports.md) — Estatísticas de cumprimento e gráficos de rotinas.
- [pages/settings.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/pages/settings.md) — Gestão de moradores, modo férias e troca de PIN.

---

### 7. Componentes de Interface (`/docs/components`)
- [components/overview.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/components/overview.md) — Catálogo e hierarquia dos componentes.
- [components/sidebar-header.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/components/sidebar-header.md) — Header superior e Sidebar de navegação.
- [components/modals.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/components/modals.md) — Modais de criação de tarefa, despesa, bloqueio e prompt de PIN.

---

### 8. Copywriting & Microcopy (`/docs/copywriting`)
- [copywriting/microcopy.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/copywriting/microcopy.md) — Rótulos oficiais de botões, mensagens de toast e estados vazios.

---

### 9. Integrações & Contratos de API (`/docs/integrations`)
- [integrations/api-contracts.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/integrations/api-contracts.md) — Schemas de requisição e resposta para endpoints REST.

---

### 10. Auditorias de Qualidade (`/docs/audits`)
- [audits/accessibility-and-performance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/audits/accessibility-and-performance.md) — Padrões WCAG 2.1 AA e metas de Core Web Vitals.

---

### 11. Registro de Tarefas & Sprints (`/docs/tasks`)
- [tasks/2026-08-29-sdd-governance-setup.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/tasks/2026-08-29-sdd-governance-setup.md) — Setup inicial do sistema de governança SDD.
