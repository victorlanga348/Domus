# Task: Camada de Animações Modernas e Micro-interações Nativas (Mobile-First UX)
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/design/responsive.md]]`, `[[docs/components/modals.md]]`

---

## 1. Contexto & Problema
A interface atual do Domus funciona de maneira sólida e estável, porém a transição entre telas/abas e o carregamento dos cards de refeições, mural e tarefas ocorre de forma estática instantânea, sem feedback cinemático sutil de aplicação nativa. 

Além disso:
- Ao tocar em botões em dispositivos móveis, navegadores móveis podem exibir um flash cinza indesejado (`-webkit-tap-highlight-color`).
- Modais em smartphones entram centralizados como caixas de diálogo desktop, em vez de deslizar suavemente de baixo para cima como *Bottom Sheets* nativas do iOS/Android.
- A transição entre abas (Dashboard, Tarefas, Cardápio, Relatórios, Estatísticas, Configurações) carece de um efeito de fade com elevação sutil para guiar o olho do morador.

---

## 2. Solução Proposta

A biblioteca **`motion` (`^12.23.24`)** (versão oficial mais recente do Framer Motion) já se encontra instalada no projeto e em uso em `TasksRotationsView.tsx`. Adotaremos uma arquitetura **híbrida de alto desempenho (60/120fps)**:

1. **Transição Suave de Telas e Rotas:**
   - Envolver a renderização das visões em `App.tsx` em um container animado via `motion/react` ou classes de transição GPU:
     * `initial={{ opacity: 0, y: 8 }}`
     * `animate={{ opacity: 1, y: 0 }}`
     * `exit={{ opacity: 0, y: -4 }}`
     * `transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}`
   - Troca suave sem layout shift entre abas.

2. **Efeito Cascata nos Cards (Stagger):**
   - No **Cardápio** (`MealCard`), no **Mural de Recados** (`MuralNote`) e nas **Tarefas**, adicionar animação escalonada onde cada card entra com atraso sequencial suave (~40ms a 50ms) usando variantes ou transições CSS otimizadas por índice (`delay: index * 0.04s`).

3. **Feedback Tátil em Botões e Itens Clicáveis:**
   - Adicionar globalmente no CSS (`index.css`): `-webkit-tap-highlight-color: transparent;` para eliminar qualquer flash cinza no toque mobile.
   - Padronizar nos botões de ação e itens de menu a micro-interação tátil:
     `active:scale-[0.97] transition-transform duration-100 ease-in-out cursor-pointer`.

4. **Menu Lateral (Drawer) e Modais como Bottom Sheet Mobile:**
   - **Drawer Lateral (Sidebar Mobile / FamilyMembersDrawer / NotificationsDrawer):**
     * Deslizamento suave pela esquerda com curva ergonômica `cubic-bezier(0.32, 0.72, 0, 1)`.
     * Overlay escuro com `backdrop-blur-xs` ou `backdrop-blur-sm` animado em fade-in.
   - **Modais Mobile (Bottom Sheet):**
     * Em telas mobile (`max-md`), os modais ganham comportamento de gaveta inferior com cantos arredondados no topo (`rounded-t-3xl sm:rounded-3xl`), animação deslizando da base (`slide-in-from-bottom duration-250 ease-out`).

5. **Acessibilidade e Desempenho (Zero Lag):**
   - Animar exclusivamente propriedades de composição da GPU (`transform` e `opacity`), sem afetar geometria de layout (`width`, `height`, `margin`).
   - Respeitar estritamente a preferência do usuário via `@media (prefers-reduced-motion: reduce)`, desativando qualquer animação para usuários sensíveis.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  * Sensação de aplicativo nativo iOS/Android sem peso extra de biblioteca externa (já instalada).
  * Feedback tátil claro e imediato em cada toque.
  * Respeito integral a acessibilidade e zero impacto de bateria por uso de GPU compositing.
- **Desvantagens / Riscos:**
  * Deve-se evitar animações longas (> 300ms) para não atrasar fluxos de uso frequente.

---

## 4. Critérios de Aceitação
- [x] Troca de abas em `App.tsx` possui fade suave com leve deslocamento vertical (translateY).
- [x] Cards de refeição e mural entram em efeito cascata suave (stagger de ~40-50ms).
- [x] Botões e itens clicáveis possuem feedback tátil `active:scale-[0.97]` e `-webkit-tap-highlight-color: transparent`.
- [x] Modais no mobile comportam-se ergonomicamente como gavetas inferiores (Bottom Sheet).
- [x] `@media (prefers-reduced-motion: reduce)` zera ou minimiza as animações.
- [x] `rtk npx tsc --noEmit` e `rtk npx vite build` sem erros.
- [x] Testes unitários do backend permanecem 48/48 aprovados.

---

## 5. Plano de Implementação (Passo a Passo)
1. CSS Global (`frontend/src/index.css`): Adicionar `-webkit-tap-highlight-color: transparent`, classes utilitárias de bottom-sheet e suporte a animações suaves.
2. `App.tsx`: Adicionar container de transição fluida na alternância de abas (`currentTab`).
3. `MealCard.tsx` e `DashboardView.tsx`: Aplicar stagger suave nos cards de refeição e notas do mural.
4. `EditMealModal.tsx`, `EditMealSchedulesModal.tsx` e modais: Configurar alinhamento e animação responsiva estilo Bottom Sheet no mobile.
5. Botões e componentes: Aplicar padronização de feedback tátil `active:scale-[0.97]`.
6. Testes técnicos e build.
