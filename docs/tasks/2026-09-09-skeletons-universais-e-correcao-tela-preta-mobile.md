# Task: Skeletons Universais de Carregamento & Correção da Tela Preta no Mobile
**Data:** 2026-09-09  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/components/overview.md]]`
- `[[docs/pages/dashboard.md]]`
- `[[docs/pages/tasks-rotation.md]]`
- `[[docs/pages/reports.md]]`
- `[[docs/audits/accessibility-and-performance.md]]`

---

## 1. Contexto & Problema
1. **Tela Preta no Início Mobile:** Ao abrir o aplicativo no celular (especialmente em navegadores móveis e PWA standalone com sistema em Modo Escuro), o utilizador visualiza uma tela preta antes de o aplicativo renderizar. Isto ocorre porque:
   - O `index.html` não declara `<meta name="color-scheme" content="light">` e nem estilos inline de fundo na raiz (`html, body`), fazendo com que o viewport padrão do WebKit/Chromium em sistemas escuros aplique o canvas preto padrão do SO durante a inicialização.
   - O elemento `<div id="root">` encontra-se completamente vazio até que o bundle JavaScript (Vite + React) seja baixado, interpretado e montado, gerando um hiato visual sem qualquer feedback.
2. **Ausência de Skeletons em Fluxos de Processamento:**
   - No `App.tsx`, as chamadas assíncronas centrais de tarefas (`tasksApi.getTasks`), cardápio (`mealsApi.getMealPlan`) e relatórios não repassam estados de `loading` para as telas filhas.
   - Em `TasksRotationsView`, o componente já previa `TasksSkeleton`, porém a prop `loading` nunca era fornecida pelo `App.tsx`, fazendo com que tarefas vazias ou em carregamento não exibissem o skeleton.
   - Em `MealsView`, não existia componente de skeleton para o plano de refeições e horários da semana.
   - Em `StatisticsView`, o carregamento exibia um bloco simples com spinner genérico em vez de um skeleton de métricas estruturadas.
   - Em `ReportsView`, não havia skeleton de tabela/linhas de relatório.
   - Em `HouseSelectionView`, a busca de casas do morador (`loadingMyHouses`) deixava um espaço em branco.

---

## 2. Solução Proposta
1. **Eliminação da Tela Preta no Mobile (`frontend/index.html`):**
   - Configurar `<meta name="color-scheme" content="light">` e definir estilos inline no `<head>` (`html, body { background-color: #F4F9F7 !important; color-scheme: light; }`) para impedir qualquer renderização de canvas preto no SO móvel.
   - Inserir diretamente dentro de `<div id="root">` um **Skeleton Inline Nativo (HTML/CSS puro)** ultra-leve com animação shimmer nas cores oficiais DOMUS (`#F4F9F7`, `#e4f0ee`, `#d0dddb`). Esse skeleton é exibido no instante 0 (First Contentful Paint) e é substituído de forma transparente pelo React quando o bundle é montado.
2. **Expansão da Biblioteca de Skeletons (`frontend/src/components/Skeleton.tsx`):**
   - `Skeleton` (primitivo com suporte a variantes e `prefers-reduced-motion`);
   - `DashboardSkeleton` (banner de boas-vindas e mural de recados);
   - `TasksSkeleton` (filtros, cabeçalho e grade de cartões de tarefas);
   - `MealsSkeleton` (seletor de dias da semana, horários e cartões das 4 refeições diárias);
   - `StatisticsSkeleton` (banner de harmonia, cards de métricas e ranking de moradores);
   - `ReportsSkeleton` (filtros de data/membro, busca e linhas de histórico);
   - `HouseSelectionSkeleton` (cartões de residências salvas).
3. **Integração dos Estados de Loading no `App.tsx` e Views:**
   - Adicionar controle de loading reativo no `App.tsx` (`tasksLoading`, `mealsLoading`) passado para `TasksRotationsView` e `MealsView`.
   - Atualizar `StatisticsView` para usar `StatisticsSkeleton` em vez do spinner textual.
   - Atualizar `HouseSelectionView` com `HouseSelectionSkeleton`.
   - Atualizar `ReportsView` com `ReportsSkeleton`.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Zero Black Screen:** O utilizador vê a identidade visual e o skeleton do DOMUS imediatamente ao tocar no app no celular.
  - **Perceived Performance & CLS < 0.05:** Elimina saltos de layout e sensação de travamento.
  - **Consistência Visual Integral:** Todos os módulos (Dashboard, Tarefas, Refeições, Estatísticas, Relatórios e Seleção de Casa) passam a ter transições de carregamento elegantes.
- **Desvantagens / Riscos:**
  - Manter o CSS inline do `index.html` alinhado ao layout da aplicação.
  - **Mitigação:** O CSS inline utiliza apenas classes mínimas essenciais e variáveis de cor consistentes com os tokens oficiais do DOMUS.

---

## 4. Critérios de Aceitação
- [x] O arquivo `index.html` contém `<meta name="color-scheme" content="light">` e estilos inline que previnem a tela preta no celular.
- [x] O elemento `<div id="root">` contém um skeleton inline puro que surge instantaneamente no First Contentful Paint.
- [x] Componentes de Skeleton criados e exportados em `frontend/src/components/Skeleton.tsx`: `DashboardSkeleton`, `TasksSkeleton`, `MealsSkeleton`, `StatisticsSkeleton`, `ReportsSkeleton`, `HouseSelectionSkeleton`.
- [x] `TasksRotationsView` exibe `TasksSkeleton` quando `tasksLoading` estiver ativo.
- [x] `MealsView` exibe `MealsSkeleton` quando as refeições estiverem em carregamento.
- [x] `StatisticsView` exibe `StatisticsSkeleton` enquanto calcula métricas.
- [x] `HouseSelectionView` exibe `HouseSelectionSkeleton` durante a busca de casas.
- [x] Suporte estrito a `prefers-reduced-motion` em todos os skeletons.
- [x] Validações técnicas executadas com sucesso (`rtk npm --prefix frontend run typecheck`).

---

## 5. Plano de Implementação (Passo a Passo)
1. [x] **Passo 1 (`frontend/index.html`):** Adicionar `<meta name="color-scheme" content="light">`, regras de cor no `<head>` e skeleton inline HTML/CSS no interior de `<div id="root">`.
2. [x] **Passo 2 (`frontend/src/components/Skeleton.tsx`):** Implementar `MealsSkeleton`, `StatisticsSkeleton`, `ReportsSkeleton` e `HouseSelectionSkeleton`.
3. [x] **Passo 3 (`frontend/src/features/meals/components/MealsView.tsx`):** Integrar prop `loading` e renderização condicional do `MealsSkeleton`.
4. [x] **Passo 4 (`frontend/src/features/statistics/components/StatisticsView.tsx`):** Substituir o spinner pelo `StatisticsSkeleton`.
5. [x] **Passo 5 (`frontend/src/features/auth/components/HouseSelectionView.tsx`):** Renderizar `HouseSelectionSkeleton` enquanto `loadingMyHouses` for `true`.
6. [x] **Passo 6 (`frontend/src/features/reports/components/ReportsView.tsx`):** Suportar prop `loading` e renderizar `ReportsSkeleton`.
7. [x] **Passo 7 (`frontend/src/App.tsx`):** Controlar os estados de loading (`tasksLoading`, `mealsLoading`) e passá-los para `TasksRotationsView`, `MealsView` e `ReportsView`.
8. [x] **Passo 8 (Validação & Testes):** Executar `rtk npm --prefix frontend run typecheck` e build do projeto.
9. [x] **Passo 9 (Sincronização de Documentação):** Atualizar `docs/components/overview.md`, `docs/audits/accessibility-and-performance.md` e specs das páginas.

---

## 6. Validação e Testes
- [x] `rtk npm --prefix frontend run typecheck` sem erros.
- [x] Teste de contraste e visualização no modo mobile.
- [x] Verificação de ausência de tela preta ou CLS no carregamento inicial.

---

## 7. Sincronização com /docs
- [x] `docs/components/overview.md` atualizado com o catálogo completo de skeletons.
- [x] `docs/audits/accessibility-and-performance.md` atualizado com a métrica de inicialização mobile.
- [x] Matriz de governança verificada em `docs/documentation-governance.md`.
