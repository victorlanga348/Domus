# Task: Implementação de Skeletons Shimmer para Estados de Carregamento
**Data:** 2026-09-06  
**Status:** Em Andamento  
**Specs Impactadas:**  
- `[[docs/components/overview.md]]`
- `[[docs/pages/dashboard.md]]`
- `[[docs/pages/tasks-rotation.md]]`
- `[[docs/audits/accessibility-and-performance.md]]`

---

## 1. Contexto & Problema
1. Durante a requisição assíncrona inicial de dados da residência em `DashboardView` (`fetchDashboard`), o componente iniciava com `loading: true`, porém renderizava imediatamente a interface vazia ("Nenhum recado fixado no mural") ou valores padrão desatualizados.
2. Essa ausência de skeleton causava piscamento de layout (*layout flash/jitter*) e dava ao usuário a impressão enganosa de que não existiam dados cadastrados antes da resposta da API.
3. Não existia um componente primitive padronizado de Skeleton no projeto para suportar estados de carregamento elegantes.

---

## 2. Solução Proposta
1. **Componente Base Reutilizável (`frontend/src/components/Skeleton.tsx`):**
   - Criar primitivo `Skeleton` com suporte a variantes: retangular, circular (avatar) e texto.
   - Animação de pulso/shimmer suave integrada aos tokens de cores oficiais do DOMUS (`#e4f0ee` e `#d0dddb`).
   - Implementar `DashboardSkeleton` reproduzindo a geometria exata do banner de boas-vindas e da grade de recados.
   - Implementar `TasksSkeleton` reproduzindo a barra de turnos e os cartões de tarefas.
2. **Integração no `DashboardView.tsx`:**
   - Renderizar o `DashboardSkeleton` enquanto `loading === true`.
3. **Integração no `TasksRotationsView.tsx`:**
   - Adicionar prop opcional `loading?: boolean`.
   - Renderizar `TasksSkeleton` caso `loading` esteja ativo.
4. **Respeito a Acessibilidade (`prefers-reduced-motion`):**
   - Animação de pulso estática caso o utilizador tenha ativado preferência de movimento reduzido.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Perceived Performance:** Reduz significativamente o tempo percebido de resposta.
  - **Eliminação de Falso Estado Vazio:** O morador não visualiza "sem recados" momentaneamente enquanto o backend processa a requisição.
  - **Consistência Visual:** Replica a exata geometria dos componentes finais, prevenindo CLS (*Cumulative Layout Shift*).
- **Desvantagens / Riscos:**
  - Manutenção adicional se o layout dos cards mudar no futuro.
  - **Mitigação:** Componentes de skeleton modulares que refletem as mesmas classes e proporções de grid do layout principal.

---

## 4. Critérios de Aceitação
- [ ] O componente `Skeleton` e os layouts `DashboardSkeleton` e `TasksSkeleton` criados e exportados em `components/index.ts`.
- [ ] `DashboardView` exibe o `DashboardSkeleton` durante o carregamento inicial da API.
- [ ] Efeito shimmer orgânico suave nas cores da paleta DOMUS sem causar travamentos.
- [ ] Usuários com `prefers-reduced-motion` recebem skeleton estático sem animação contínua.
- [ ] Verificação de tipos (`rtk npm --prefix frontend run typecheck`) e build de produção (`rtk npx vite build`) sem erros.

---

## 5. Plano de Implementação (Passo a Passo)
1. Criar `frontend/src/components/Skeleton.tsx` com `Skeleton`, `DashboardSkeleton` e `TasksSkeleton`.
2. Exportar em `frontend/src/components/index.ts`.
3. Atualizar `frontend/src/features/dashboard/components/DashboardView.tsx` para renderizar `DashboardSkeleton` quando `loading === true`.
4. Atualizar `frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx` com suporte a `TasksSkeleton`.
5. Validar compilação e build via terminal com `rtk`.
6. Sincronizar documentação em `/docs`.
