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
  - No iOS Safari, qualquer elemento `<input>`, `<textarea>` ou `<select>` com `font-size < 16px` aciona zoom automático ao receber foco, quebrando o layout da tela.
  - No mobile (`< 640px`), todos os campos focáveis devem ter `font-size: 16px !important`, retornando aos tamanhos canônicos da escala tipográfica em telas maiores (`sm:` ou superiores).
- **Metatag Viewport:**
  - Configuração obrigatória: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover" />`.
- **Containers de Autenticação com Teclado:**
  - A tela de autenticação deve operar sob `min-h-[100dvh]` com `overflow-y-auto`, permitindo rolagem vertical suave para que os campos e o botão de ação continuem acessíveis quando o teclado virtual estiver aberto.

---

## 7. Experiência PWA & Instalação em Tela Cheia (Standalone)
- **Modo de Exibição:** `display: "standalone"`, eliminando barras de navegação do browser (Safari e Chrome) para sensação de aplicativo nativo.
- **Área Segura (Safe Area):** Respeitar variáveis de ambiente `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)` com `viewport-fit=cover` ativo.
- **Cor de Tema da Barra de Notificações:** Sincronizada com a marca institucional (`#16302e`) para continuidade visual com o topo da aplicação.
- **Service Worker de App Shell:** Garante renderização ultra-rápida do shell inicial, enquanto o fluxo de tempo real (WebSockets) e endpoints de API (`/api/*`) operam sem intermediação de cache, prevenindo divergências de sincronização entre moradores.

