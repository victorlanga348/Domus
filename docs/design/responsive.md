# Diretrizes de Responsividade & Layout Mobile-First

## 1. Breakpoints Canônicos
- **Mobile (`< 768px`):**
  - Barra de navegação inferior flutuante ou header compacto com drawer menu.
  - Cartões em coluna única (`grid-cols-1`).
  - Alvos de toque (*touch targets*) mínimos de 44x44px para facilidade de uso em smartphones.
- **Tablet / Kitchen Display (`768px` a `1024px`):**
  - Layout otimizado para visualização em modo paisagem (Landscape) em telas de bancada/cozinha.
  - Grids de 2 colunas para tarefas e turnos (`grid-cols-2`).
- **Desktop (`> 1024px`):**
  - Sidebar lateral fixa com navegação expandida.
  - Visualização em 3 colunas para turnos (`Manhã`, `Tarde`, `Noite`).

---

## 2. Acessibilidade de Toque
- Botões de ação rápida (`Lock`, `Concluir`, `Bloquear`) devem possuir área clicável ampla e feedback visual tátil imediato (`active:scale-95 transition-transform`).

---

## 3. Estabilização de Viewport Dinâmico (`100dvh` vs `100vh`)
- **Prevenção de Layout Shifts (CLS):**
  - O uso estático de `100vh` é proibido em containers de tela cheia, pois desconsidera a barra dinâmica de endereços e navegação do Safari iOS e Chrome Android, provocando saltos visuais e rolagem fantasma.
  - Utilizar sempre `100dvh` com fallback para `100vh` (`h-screen h-[100dvh] max-h-[100dvh]`).
  - Gavetas modais e drawers laterais devem respeitar `max-h-[100dvh]` para manter os botões inferiores (fechar, deslogar, etc.) sempre visíveis e táteis.

---

## 4. Contenção de Overflow Horizontal & Regras de Limites Mobile
- **Contenção Global:**
  - `html`, `body` e `#root` devem possuir `overflow-x: hidden`, `max-width: 100%` e `box-sizing: border-box`.
- **Prevenção de Estouro em Flexbox:**
  - Todo container `<main>` ou filho flexível deve declarar `min-w-0 max-w-full overflow-x-hidden` para evitar expansão indevida causada por textos ou filhos rígidos.
  - Quebra de textos longos através de `break-words` e `overflow-wrap: anywhere`.
  - Em larguras menores que 480px, linhas com botões e selects múltiplos devem alternar para `flex flex-col sm:flex-row`.

---

## 5. Script de Auditoria Imediata no Console
- Utilitário disponível globalmente via `window.__auditMobileOverflow()`:
  ```javascript
  document.querySelectorAll('*').forEach(el => {
    if (el.offsetWidth > document.documentElement.offsetWidth) {
      console.warn('Elemento causando overflow:', el);
    }
  });
  ```

---

## 6. Prevenção de Auto-Zoom no iOS Safari & Teclado Virtual
- **Regra de Tamanho de Fonte (16px):**
  - No iOS Safari e navegadores mobile em geral, qualquer elemento `<input>`, `<textarea>` ou `<select>` com `font-size < 16px` aciona zoom automático ao receber foco, quebrando o layout da tela.
  - No mobile (`screen and (max-width: 768px)`), todos os campos focáveis possuem `font-size: 16px !important`, anulando classes utilitárias menores (`text-xs`, `text-sm`) e retornando aos tamanhos canônicos da escala tipográfica apenas em telas maiores (`sm:` ou superiores).
- **Metatag Viewport:**
  - Configuração obrigatória para travar a escala e anular o auto-zoom:
    `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />`.
- **Prevenção de Zoom por Duplo Toque (Touch Action):**
  - Aplicação de `touch-action: manipulation;` em `html, body, #root, input, textarea, select, button`, desativando gestos involuntários de duplo clique que ampliam e travam a viewport no mobile.
- **Containers de Autenticação com Teclado:**
  - A tela de autenticação deve operar sob `min-h-[100dvh]` com `overflow-y-auto`, permitindo rolagem vertical suave para que os campos e o botão de ação continuem acessíveis quando o teclado virtual estiver aberto.

---

## 7. Experiência PWA & Instalação em Tela Cheia (Standalone)
- **Modo de Exibição:** `display: "standalone"`, eliminando barras de navegação do browser (Safari e Chrome) para sensação de aplicativo nativo.
- **Área Segura (Safe Area) & Altura Total:** Respeitar rigorosamente `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)` com `viewport-fit=cover` ativo:
  - **Fundo Global:** `html`, `body` e `#root` configurados com `background-color: #F4F9F7`, `min-h-[100dvh]` e `overscroll-behavior-y: none` para eliminar qualquer faixa branca no rodapé, efeito elástico involuntário ou corte de barras.
  - **Cabeçalho:** Fundo sólido `#F4F9F7` preenchendo até o topo físico (`top: 0`, `z-50`) com `padding-top: env(safe-area-inset-top, 0px)` e altura flex interna `min-h-[56px] sm:min-h-[64px]` centralizando os ícones.
  - **Barras Inferiores & Rodapé:** Elementos fixos (toasts, botões de ação e rodapés de tela) posicionados com `padding-bottom / bottom: calc(... + env(safe-area-inset-bottom, 0px))` para evitar sobreposição pela barra de gestos do sistema (Home Indicator).
- **Barra de Status do Sistema:** Sincronizada com tema do cabeçalho (`theme-color: #F4F9F7` e `apple-mobile-web-app-status-bar-style: default`), garantindo contraste legível dos ícones do SO e fusão visual perfeita com o topo do aplicativo.
- **Arquitetura de Instalação PWA (Android 1-Click & iOS):**
  - **Manifesto Canônico (`/manifest.json`):** Configurado com `name: "DOMUS"`, `short_name: "DOMUS"`, `start_url: "/"`, `id: "/"`, `display: "standalone"`, `background_color: "#F4F9F7"`, `theme_color: "#F4F9F7"`, e ícones em `/icons/icon-192x192.png` (`any`) e `/icons/icon-512x512.png` (`maskable any`).
  - **Android (Chrome):** Service Worker `/sw.js` com ciclo de vida ativo (`skipWaiting`, `clients.claim`) e fetch pass-through padrão com fallback de cache, registrado no evento `load` da janela, liberando o prompt nativo de instalação ("Instalar aplicativo") e splash screen real.
  - **iOS (Safari):** Metatags dedicadas no `<head>` (`apple-mobile-web-app-capable: yes`, `apple-mobile-web-app-title: DOMUS`, `apple-touch-icon`) permitindo instalação em tela cheia via "Compartilhar" -> "Adicionar à Tela de Início".
  - **Pass-through de Rede Total:** O Service Worker repassa requisições via `fetch(event.request).catch(() => caches.match(event.request))` sem reter cache defasado, preservando WebSockets e APIs em tempo real.
- **Estabilidade ao Despertar (Wake from Sleep & Reativação Instantânea):**
  - O estado do painel principal é hidratado imediatamente a partir do cache local (`${houseKey}_dashboard_cache`). Quando a tela do celular é ligada ou reaberta, o conteúdo real é renderizado em < 16ms sem exibição de skeletons transitórios e sem saltos de layout ("pulada"). A sincronização com a API e WebSocket acontece em segundo plano de forma silenciosa.

---

## 8. Micro-interações Nativas, Animações e Modais Bottom Sheet
- **Transição de Telas/Abas:**
  - Alternância de visões em `App.tsx` via `motion` (`AnimatePresence mode="wait" initial={false}`) com curva cinematográfica rápida (`duration: 0.22s, ease: [0.16, 1, 0.3, 1]`) e leve elevação (`y: 8 -> 0`), prevenindo layout shifts.
- **Efeito Cascata (Stagger):**
  - Carregamento de cards em lote (pratos do dia em `MealsView`, recados no mural em `DashboardView`) com atraso sequencial progressivo (`delay: index * 0.04s`), evitando aparições em bloco abruptas.
- **Feedback Tátil Universal:**
  - Remoção de flash de toque nativo do WebKit (`-webkit-tap-highlight-color: transparent`).
  - Botões de ação e itens interativos recebem compressão suave ao toque (`active:scale-[0.97] transition-all`).
- **Modais Mobile (Bottom Sheet):**
  - Em smartphones (`< 640px`), modais abrem alinhados à base (`items-end sm:items-center`), com cantos arredondados no topo (`rounded-t-3xl sm:rounded-3xl`), animação elástica de subida (`animate-sheet-slide-up`), altura máxima de `90dvh` e barra tátil indicadora superior (*grab handle*). Em tablets e desktops, comportam-se como modais flutuantes centralizados (`sm:items-center`).
- **Acessibilidade Motora & Redução de Movimento:**
  - Todas as animações e transições respeitam `@media (prefers-reduced-motion: reduce)`, desativando efeitos para evitar desconforto em usuários com sensibilidade vestibular.

