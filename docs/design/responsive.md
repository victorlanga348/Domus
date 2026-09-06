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
  - **Fundo Global:** `html`, `body` e `#root` configurados com `background-color: #f0fcfa` e `min-h-[100dvh]` para eliminar qualquer faixa branca no rodapé ou overscroll.
  - **Cabeçalho:** Fundo sólido `#f0fcfa` preenchendo até o topo físico (`top: 0`, `z-50`) com `padding-top: env(safe-area-inset-top, 0px)` e altura flex interna `min-h-[56px] sm:min-h-[64px]` centralizando os ícones.
  - **Barras Inferiores & Rodapé:** Elementos fixos (toasts, botões de ação e fim de página) posicionados com `padding-bottom / bottom: calc(... + env(safe-area-inset-bottom, 0px))` para evitar sobreposição pela barra de gestos do sistema.
- **Barra de Status do Sistema:** Sincronizada com tema do cabeçalho (`theme-color: #f0fcfa` e `apple-mobile-web-app-status-bar-style: default`), garantindo contraste legível dos ícones do SO e fusão visual perfeita com o topo do aplicativo.
- **Arquitetura de Instalação PWA (Android 1-Click & iOS):**
  - **Android (Chrome):** Service Worker pass-through `/sw.js` registrado no evento `load`, viabilizando o disparo do evento `beforeinstallprompt` e instalação nativa com 1 clique direto para a tela inicial.
  - **iOS (Safari):** Orientação visual clara através de modal ilustrado instruindo o usuário a tocar em "Compartilhar" -> "Adicionar à Tela de Início" (conforme restrição nativa do WebKit da Apple).
  - **Pass-through de Rede Total:** O Service Worker repassa 100% das requisições via `fetch(event.request)` direto para a rede, garantindo que APIs, WebSockets e rotas em tempo real nunca exibam dados defasados.

