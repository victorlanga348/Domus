# Task: Auditoria de Performance Mobile, Viewport Dinâmico (dvh) & Eliminação de Overflow
**Data:** 2026-09-02  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/design/responsive.md]]`, `[[docs/components/sidebar-header.md]]`

---

## 1. Contexto & Problema

Em dispositivos móveis (especialmente iOS Safari e Chrome Android), a aplicação apresentava instabilidades típicas de layout responsivo:
1. **Scrolls Horizontais Indesejados & Vazamento de Tela:**
   - Elementos em linha e grids sem contenção de largura mínima (`min-w-0`), fazendo com que colunas ou cards empurrassem o container além de 100% da viewport.
   - Filtro de turno ao lado de abas de tarefas em telas menores que 480px gerando estouro horizontal.
   - Ausência de contenção estrita de `overflow-x: hidden` e `max-width: 100%` nos nós raiz (`html`, `body`, `#root` e `<main>`).
2. **Layout Shifts (CLS) e Saltos de Viewport (`100vh` vs `100dvh`):**
   - Uso de `h-screen` (`100vh`) no container raiz da aplicação (`App.tsx`), barra lateral (`Sidebar.tsx`) e gavetas modais (`Modals.tsx`), causando deslocamentos verticais fantasmas quando as barras de endereço e navegação dos navegadores móveis se retraem/expandem.
3. **Comportamento do Drawer Mobile:**
   - Gavetas modais e menu lateral sem calibração para `100dvh`, ocultando os botões inferiores (como fechar, logout ou trocar residência) atrás da barra de navegação dos aparelhos.

---

## 2. Solução Proposta

1. **Estabilização de Viewport Dinâmico (`100dvh` com fallback):**
   - No CSS base (`frontend/src/index.css`), declarar classes de utilidade e regras base para viewport dinâmico: `h-[100dvh]`, `min-h-[100dvh]`, `max-h-[100dvh]`.
   - Em `App.tsx`: Atualizar o container principal para `h-screen h-[100dvh] max-h-[100dvh] w-full max-w-full overflow-hidden`.
   - Em `Sidebar.tsx`: Atualizar a sidebar desktop e o drawer mobile para `h-screen h-[100dvh] max-h-[100dvh]`.
   - Em `Modals.tsx`: Atualizar `ActivityNotificationsDrawer` e `FamilyMembersDrawer` para `h-full max-h-[100dvh]`.
   - Em `AuthView.tsx`, `HouseSelectionView.tsx`, etc.: Atualizar `min-h-screen` para `min-h-[100dvh]`.
2. **Contenção Estrita de Overflow Horizontal:**
   - Em `frontend/src/index.css`: Aplicar `box-sizing: border-box`, `max-width: 100%` e `overflow-x: hidden` no `html`, `body` e `#root`.
   - Em `App.tsx`: Garantir que `<main>` e o wrapper de visualização dinâmica possuam `min-w-0 max-w-full overflow-x-hidden`.
   - Em `TasksRotationsView.tsx`: Refatorar o container de navegação/turnos de `flex flex-row` estático para `flex flex-col sm:flex-row items-stretch sm:items-center`, permitindo que o select de turnos se acomode sem romper os 360px de largura.
   - Em `WalletView.tsx`: Tornar a barra de busca e filtros responsiva (`w-full sm:w-auto min-w-0`) e transformar a lista de despesas em `flex flex-col sm:flex-row` para prevenir estouro em telas estreitas.
   - Em `Header.tsx`: Garantir `min-w-0` nos agrupamentos de texto e ícones.
3. **Script de Detecção Imediata de Overflow:**
   - Injetar utilitário `window.__auditMobileOverflow()` acessível no console para inspeção em tempo real de qualquer elemento que ultrapasse a largura da janela:
     ```javascript
     document.querySelectorAll('*').forEach(el => {
       if (el.offsetWidth > document.documentElement.offsetWidth) {
         console.warn('Elemento causando overflow:', el);
       }
     });
     ```

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - Experiência fluida e nativa em smartphones (sem rolagem lateral acidental).
  - Eliminação de Layout Shift (CLS) causado pelas barras de ferramentas do Safari/Chrome mobile.
  - Alinhamento tátil e visual impecável em todas as resoluções (320px até 4K).
  - Facilidade de auditoria contínua através do script no console.
- **Desvantagens / Riscos:**
  - Nenhuma perda visual no desktop; o uso de `dvh` mantém paridade com desktop (`100dvh` == `100vh` em navegadores desktop modernos) e melhora mobile.

---

## 4. Critérios de Aceitação

- [x] `html`, `body` e `#root` com `overflow-x: hidden` e `box-sizing: border-box`.
- [x] Nenhum elemento da aplicação causa scroll horizontal em larguras entre 320px e 480px.
- [x] Uso de `100dvh` com fallback em `App.tsx`, `Sidebar.tsx`, `Modals.tsx` e telas de autenticação.
- [x] Select de turnos em `TasksRotationsView.tsx` não quebra a tela em 320px-360px.
- [x] Script de auditoria `window.__auditMobileOverflow` disponível no console para verificação imediata.
- [x] `rtk npm run typecheck` e `rtk npm run build` no frontend passam com código 0.
- [x] Specs afetadas em `/docs` atualizadas.

---

## 5. Plano de Implementação (Passo a Passo)

1. [x] **Documentação & Governança:**
   - Atualizar `docs/design/responsive.md` e `docs/components/sidebar-header.md`.
2. [x] **CSS Base & Reset Global (`frontend/src/index.css`):**
   - Garantir contenção de overflow horizontal em `html`, `body` e `#root`.
   - Adicionar classes utilitárias de viewport dinâmico (`dvh`).
3. [x] **Estabilização de Viewport no Layout Raiz (`frontend/src/App.tsx`):**
   - Atualizar container para `h-screen h-[100dvh] max-h-[100dvh] w-full max-w-full overflow-hidden`.
   - Adicionar `min-w-0 max-w-full overflow-x-hidden` a `<main>` e containers filhos.
4. [x] **Ajuste em Componentes de Navegação (`Sidebar.tsx` e `Header.tsx`):**
   - Atualizar drawer mobile e sidebar para `h-screen h-[100dvh] max-h-[100dvh]`.
   - Adicionar `min-w-0` em `Header.tsx` para evitar deslocamentos em telas estreitas.
5. [x] **Ajuste em Gavetas e Modais (`frontend/src/components/Modals.tsx`):**
   - Atualizar drawers para `max-h-[100dvh]` garantindo visibilidade dos botões inferiores.
6. [x] **Ajuste Responsivo em Telas Específicas (`TasksRotationsView.tsx`, `WalletView.tsx`, etc.):**
   - Ajustar flex containers e selects que quebram em larguras `< 380px`.
7. [x] **Script de Detecção de Overflow (`frontend/src/main.tsx`):**
   - Registrar `window.__auditMobileOverflow()` para depuração no console.
8. [x] **Validação Técnica e Testes:**
   - Executar typecheck e build no frontend via terminal com prefixo `rtk`.
9. [x] **Sincronização e Commit:**
   - Atualizar status da tarefa para "Concluída" e realizar commit em português.

---

## 6. Validação e Testes

- [x] `rtk npm run typecheck` concluído com código 0.
- [x] `rtk npm run build` concluído com código 0.
- [x] Execução do script `window.__auditMobileOverflow()` confirmando zero elementos estourando a viewport.

---

## 7. Sincronização com /docs

- [x] `docs/design/responsive.md`
- [x] `docs/components/sidebar-header.md`
- [x] Matriz de impacto validada em `[[docs/documentation-governance.md]]`.
