# Task: Animações Nativas e Deslizamento Fluido do Sidebar / Drawer Mobile
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/design/responsive.md]]`

---

## 1. Contexto & Problema
Atualmente, a abertura e fechamento do Sidebar mobile em `frontend/src/layouts/Sidebar.tsx` dependem de uma montagem condicional direta (`{isMobileOpen && ( ... )}`), acompanhada de classes CSS utilitárias pontuais (`animate-in slide-in-from-left duration-200`). Isso produz um efeito visual instantâneo ("pisca" na tela sem deslizar na saída, e os itens internos entram de forma estática em bloco sem vida).

O objetivo é transformar o Drawer mobile em uma gaveta nativa fluida idêntica à de aplicativos móveis:
- O painel lateral desliza suavemente com física de desaceleração suave (`cubic-bezier(0.32, 0.72, 0, 1)`).
- O backdrop escuro surge e some com transição progressiva de opacidade (`transition-opacity duration-300`).
- Os itens de navegação interna entram em cascata sequencial suave (*stagger* de 30ms) ao abrir.
- O container respeita integralmente as margens de segurança físicas do dispositivo (`env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`).

---

## 2. Solução Proposta

1. **Arquitetura de Transição Contínua (Sem Desmontagem Brusca):**
   - Manter a estrutura do Drawer mobile montada na árvore do DOM com visibilidade e alternância controladas por classes de transição aceleradas por hardware GPU:
   - **Backdrop Overlay:**
     * Fechado: `opacity-0 pointer-events-none`
     * Aberto: `opacity-100 pointer-events-auto bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out`
     * Clique em qualquer ponto do overlay aciona `onCloseMobile()`.
   - **Gaveta Lateral (`aside`):**
     * Fechado: `fixed inset-y-0 left-0 -translate-x-full pointer-events-none`
     * Aberto: `translate-x-0 pointer-events-auto`
     * Transição: `transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform`
   - O uso de `will-change-transform` e `translate-x` garante renderização via compositor GPU a 60/120fps sem repaints de layout.

2. **Efeito Cascata nos Links de Navegação (*Stagger*):**
   - Nos itens de navegação (`Mural`, `Tarefas`, `Cardápio`, `Configurações`, `Relatórios`, `Estatísticas`), aplicar transição combinada de deslocamento e opacidade com atraso progressivo:
     * Fechado: `opacity-0 -translate-x-2`
     * Aberto: `opacity-100 translate-x-0` com `transitionDelay: isMobileOpen ? '${60 + index * 30}ms' : '0ms'`
     * Feedback tátil ao toque do usuário: `active:scale-[0.98] transition-all duration-150 rounded-2xl`.

3. **Safe Area e Alinhamento Ergonômico:**
   - Garantir `pt-[calc(1.25rem+env(safe-area-inset-top,0px))]` e `pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]` para isolamento de câmeras/notches e da barra de navegação gestual do sistema operacional.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  * Sensação de aplicativo nativo iOS/Android sem solavancos ou cortes bruscos no fechamento.
  * Interrompível: o usuário pode fechar o menu a qualquer momento sem engasgos.
  * Zero dependências extras e custo de performance desprezível por utilizar propriedades de GPU (`transform`, `opacity`).
- **Desvantagens / Riscos:**
  * É necessário gerenciar `pointer-events-none` rigorosamente quando fechado para evitar bloqueio involuntário de cliques nas telas subjacentes.

---

## 4. Critérios de Aceitação
- [x] O menu lateral desliza suavemente para dentro e para fora com curva `cubic-bezier(0.32, 0.72, 0, 1)`.
- [x] O backdrop escuro faz fade in/out progressivo de 300ms com `backdrop-blur-xs` e fecha o menu ao ser clicado.
- [x] Os itens de navegação entram com stagger suave (atraso escalonado de 30ms) e deslocamento lateral sutil.
- [x] Os itens de menu reagem ao toque com amortecimento tátil `active:scale-[0.98]`.
- [x] Safe Area superior e inferior respeitadas sem cortes no topo do perfil ou nos botões de saída.
- [x] `rtk npx tsc --noEmit` e `rtk npx vite build` no frontend sem erros.
- [x] Testes unitários do backend (48/48) mantidos intactos.

---

## 5. Plano de Implementação (Passo a Passo)
1. Em `frontend/src/layouts/Sidebar.tsx`:
   - Atualizar a camada do Drawer mobile para persistir na árvore com controle de `translate-x` e `opacity` em vez de desmonte condicional seco.
   - Configurar o backdrop com `transition-opacity duration-300 ease-out` e alternância `pointer-events-auto` / `pointer-events-none`.
   - Adicionar classes `transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform` na gaveta `aside`.
   - Implementar o stagger progressivo via `transitionDelay` e micro-interação tátil `active:scale-[0.98]` nos botões de abas móveis.
2. Executar validação técnica:
   - `rtk npx tsc --noEmit`
   - `rtk npx vite build`
   - `rtk npm test`
3. Atualizar especificação em `docs/design/responsive.md` e marcar task como Concluída.
4. Realizar commit em português antes de avançar.

---

## 6. Validação e Testes
- [x] Typecheck sem erros (`rtk npx tsc --noEmit`)
- [x] Build de produção (`rtk npx vite build`)
- [x] Testes backend (`rtk npm test`)

---

## 7. Sincronização com /docs
- [x] Atualizar `[[docs/design/responsive.md]]` com as diretrizes do Drawer Mobile animado.
- [x] Atualizar `[[docs/tasks/2026-09-06-animacoes-drawer-sidebar-mobile.md]]` para status `Concluída`.
