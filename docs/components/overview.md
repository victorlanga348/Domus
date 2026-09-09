# Visão Geral dos Componentes de Interface

## 1. Organização dos Componentes
Os componentes de UI residem em `frontend/src/components/` e são divididos em:

1. **Estruturais / Navegação:**
   - [Header.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/components/Header.tsx): Cabeçalho com indicador de usuário logado, status da casa e alternador de perfil.
   - [Sidebar.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/components/Sidebar.tsx): Menu lateral de navegação entre visões (Dashboard, Tarefas, Carteira, Relatórios, Configurações).
2. **Visões / Páginas:**
   - [DashboardView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/components/DashboardView.tsx)
   - [TasksRotationsView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/components/TasksRotationsView.tsx)
   - [WalletView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/components/WalletView.tsx)
   - [ReportsView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/components/ReportsView.tsx)
   - [SettingsView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/components/SettingsView.tsx)
3. **Modais & Diálogos:**
   - [Modals.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/components/Modals.tsx): Centraliza diálogos de criação de tarefa, registro de despesa, bloqueio de tarefa com motivo e prompt de PIN.
4. **Estados de Carregamento & Feedback:**
   - [Skeleton.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/components/Skeleton.tsx): Primitivo de skeleton com shimmer suave (`Skeleton`) e layouts dedicados:
     - `DashboardSkeleton`: Banner de boas-vindas, status da residência e mural de recados.
     - `TasksSkeleton`: Barra de turnos, filtros e cartões de tarefas.
     - `MealsSkeleton`: Seletor de dias da semana, horários e cartões das refeições diárias.
     - `StatisticsSkeleton`: Indicador do Índice de Harmonia, cartões de métricas e ranking de moradores.
     - `ReportsSkeleton`: Barra de pesquisa, seletores e linhas de histórico de tarefas.
     - `HouseSelectionSkeleton`: Cartões de residências do usuário.
   - **Skeleton Inline de Inicialização (`frontend/index.html`):** Skeleton em HTML/CSS puro inserido diretamente no interior de `<div id="root">`, com `<meta name="color-scheme" content="light">` e estilos imediatos, eliminando a tela preta no carregamento em navegadores móveis e PWA standalone.

