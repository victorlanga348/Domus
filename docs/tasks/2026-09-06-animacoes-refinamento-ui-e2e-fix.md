# Task: Integração de Animações (Motion & Confetti), Refinamento de Interface e Correção E2E
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/pages/tasks-rotation.md]]`
- `[[docs/pages/dashboard.md]]`
- `[[docs/design/tokens.md]]`
- `[[docs/audits/accessibility-and-performance.md]]`

---

## 1. Contexto & Problema
1. **Divergência no Teste E2E Legado:** O teste em `backend/tests/e2e/lifecycle.e2e.test.ts:277` falhava porque ainda esperava que uma tarefa concluída retornasse imediatamente a `status: 'OPEN'`. A sprint oficial de `2026-09-05-regras-permissao-concluir-reverter-tarefas.md` definiu que a tarefa permanece em `COMPLETED` para viabilizar auditoria e permitir a reversão por administradores.
2. **Dependências Ociosas no Frontend:** `motion` (`^12.23.24`) estava instalada nas dependências do projeto, porém sem uso real em componentes.
3. **Engenharia de Interface e Feedback Físico:**
   - As listas de tarefas trocam de estado bruscamente sem transições de entrada orquestradas (*staggered animations*).
   - Ausência de feedback tátil (*scale on press* de `0.96`) em cliques de botões e cards interativos.
   - Números e contadores dinâmicos sem `tabular-nums`, gerando pequenos deslocamentos de layout (*layout shift*).
   - O indicador de aba ativa na sidebar desktop necessita de suavização em seu deslocamento vertical pelo eixo Y.
4. **Acessibilidade:** Botões e ícones sem `aria-label` e ausência de contenção explícita para usuários com `prefers-reduced-motion`.

---

## 2. Solução Proposta
1. **Ajuste do Teste E2E (`backend/tests/e2e/lifecycle.e2e.test.ts`):**
   - Atualizar a asserção da linha 277 para esperar `completedTask?.status === 'COMPLETED'` e `completedTask?.locked_by_id === aliceId`.
   - Adicionar validação do endpoint de reversão (`POST /api/tasks/:id/revert`) para confirmar a transição de volta para `OPEN` por um administrador e liberação de lock.
2. **Ativação do `motion` (`motion/react`):**
   - Em `TasksRotationsView.tsx`: envolver a grade de tarefas com `motion.div` e variantes de *stagger* (`staggerChildren: 0.05`), com entrada em mola amortecida (`bounce: 0`, `duration: 0.28`).
   - Adicionar `<AnimatePresence mode="popLayout">` com `layout` para reordenação suave de cards ao filtrar por turnos ou alternar status.
3. **Refinamentos de Interface (`make-interfaces-better` & `impeccable`):**
   - Aplicar `active:scale-[0.96] transition-transform` nos botões primários e de ação rápida.
   - Inserir `font-variant-numeric: tabular-nums` nos contadores de tarefas e badges.
   - Suavizar a transição do indicador ativo da sidebar desktop (`Sidebar.tsx`) com `transition: top 240ms cubic-bezier(0.2, 0, 0, 1)`.
   - Adicionar suporte a `prefers-reduced-motion` no CSS global.
4. **Acessibilidade:**
   - Inserir `aria-label` nos botões de ícone (fechar gavetas, trocar de residência, alternar turno, botões de ação de tarefas e recados).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Experiência Premium & Fluida:** Reduz a sensação estática da aplicação sem introduzir dependências adicionais (usa bibliotecas já existentes no repositório).
  - **100% de Testes Aprovados:** Alinha a suíte E2E às decisões de negócio aprovadas na sprint de governança anterior.
  - **Estabilidade Visual:** `tabular-nums` e `layout` evitam saltos abruptos de tela.
- **Desvantagens / Riscos:**
  - Dispositivos muito antigos ou com aceleração de hardware desativada podem ter pequenos atrasos em animações pesadas.
  - **Mitigação:** Uso de propriedades performáticas compostas pela GPU (`transform`, `opacity`), mola com zero ricochete (`bounce: 0`), e desativação automática quando `prefers-reduced-motion: reduce` estiver ativo.

---

## 4. Critérios de Aceitação
- [x] O teste E2E `lifecycle.e2e.test.ts` passa com 100% de sucesso junto aos 31 testes do backend.
- [x] Ao trocar de turno ou carregar tarefas, os itens entram com animação suave e escalonada (*staggered enter*).
- [x] Botões principais possuem feedback tátil no clique (`active:scale-[0.96]`).
- [x] Números de contagem usam `tabular-nums` sem deslocamento de layout.
- [x] O indicador da sidebar desktop transita fluidamente pelo eixo Y ao alternar de aba.
- [x] Todos os botões interativos de ícone possuem `aria-label` acessível.
- [x] Build de produção (`rtk npm --prefix frontend run build`) e checagem de tipos sem nenhum erro.

---

## 5. Plano de Implementação (Passo a Passo)
1. [x] **Backend Test (`backend/tests/e2e/lifecycle.e2e.test.ts`):**
   - Atualizar a validação pós-conclusão para conferir `status === 'COMPLETED'`, testar a reversão via rota oficial de admin e conferir o retorno para `OPEN`.
2. [x] **Estilos Globais (`frontend/src/index.css`):**
   - Adicionar regras utilitárias para `tabular-nums`, `text-wrap: balance` e respeitar `@media (prefers-reduced-motion: reduce)`.
3. [x] **Sidebar Desktop e Mobile (`frontend/src/layouts/Sidebar.tsx`):**
   - Adicionar transição fluida na coordenada `top` do indicador ativo e rótulos acessíveis `aria-label`.
4. [x] **Tarefas & Rodízio (`frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx`):**
   - Integrar `motion` e `AnimatePresence` na listagem de turnos.
   - Adicionar `active:scale-[0.96]` e feedback tátil em botões de ação e filtros.
5. [x] **Dashboard (`frontend/src/features/dashboard/components/DashboardView.tsx`):**
   - Adicionar transição sutil em cards e recados do mural.
6. [x] **Validação Técnica Geral:**
   - Executar `rtk npm test` no backend e `rtk npm run build` no frontend.
7. [x] **Sincronização de Docs:**
   - Atualizar `docs/pages/tasks-rotation.md`, `docs/design/tokens.md` e `docs/audits/accessibility-and-performance.md`.
