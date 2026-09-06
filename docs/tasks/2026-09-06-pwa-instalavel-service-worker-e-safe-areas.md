# Task: PWA Instalável Completo, Service Worker Ativo e Safe Areas Nativas (iOS/Android)
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/design/responsive.md]]`
- `[[docs/components/sidebar-header.md]]`
- `[[docs/design/tokens.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
Para que uma aplicação web seja reconhecida pelo Google Chrome / Android como Progressive Web App (PWA) instalável de forma nativa (exibindo a barra/botão nativo "Instalar aplicativo" em vez de apenas "Criar atalho", além de splash screen real), o navegador impõe critérios técnicos estritos:
1. Um **Service Worker** registrado e ativo no escopo da aplicação;
2. Um arquivo de manifesto (`manifest.json`) válido na raiz pública, contendo nome, tema, cores de fundo padronizadas e ícones nos formatos `any` e `maskable` (especificamente 192x192 e 512x512);
3. Configuração canônica de meta tags no `<head>` do `index.html` para iOS Safari e Android Chrome (`viewport-fit=cover`, `theme-color`, ícones touch);
4. Respeito às **Safe Areas (`env(safe-area-inset-*)`)** tanto no topo (evitando sobreposição com relógio, câmera e Dynamic Island) quanto no rodapé (evitando interferência com a barra de gestos do sistema);
5. Estabilização de viewport sem cortes ou rolagem fantasma (`100dvh`, `overscroll-behavior-y: none` e background unificado `#F4F9F7`).

Atualmente no projeto:
- O `manifest.json` e `manifest.webmanifest` possuíam configurações herdadas (`#16302e` e nomes longos) em vez do padrão exato `#F4F9F7` e `DOMUS`;
- No `index.html`, o link de manifesto apontava para `/manifest.webmanifest`, a cor de tema era `#f0fcfa` em vez do padrão `#F4F9F7`, e faltavam propriedades exigidas;
- O `sw.js` necessitava do handler padrão de fetch pass-through com fallback `fetch(e.request).catch(() => caches.match(e.request))` e skipWaiting/claim;
- A regra de `overscroll-behavior-y: none` e fundo uniforme `#F4F9F7` precisava ser consolidada em `html, body, #root`, cabeçalho e rodapé.

---

## 2. Solução Proposta

### 2.1 Configuração Canônica do Manifesto (`public/manifest.json`)
Consolidar `frontend/public/manifest.json` com os atributos especificados:
- `name: "DOMUS"`, `short_name: "DOMUS"`;
- `start_url: "/"`, `id: "/"`;
- `display: "standalone"`, `orientation: "portrait-primary"`;
- `background_color: "#F4F9F7"`, `theme_color: "#F4F9F7"`;
- Ícones em `/icons/icon-192x192.png` (`purpose: "any"`) e `/icons/icon-512x512.png` (`purpose: "maskable any"`).
- Sincronizar também `frontend/public/manifest.webmanifest` para paridade total.

### 2.2 Meta Tags Universais no `<head>` (`frontend/index.html`)
Aplicar as meta tags requeridas para Android e iOS:
- `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />`
- `<link rel="manifest" href="/manifest.json" />`
- `<meta name="theme-color" content="#F4F9F7" />`
- `<meta name="apple-mobile-web-app-capable" content="yes" />`
- `<meta name="apple-mobile-web-app-status-bar-style" content="default" />`
- `<meta name="apple-mobile-web-app-title" content="DOMUS" />`
- `<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />`
- Ajustar classes de `html`, `body` e `#root` para `bg-[#F4F9F7] min-h-full min-h-[100dvh]`.

### 2.3 Service Worker & Registro (`public/sw.js` e `src/main.tsx`)
- Implementar em `frontend/public/sw.js`:
  ```javascript
  self.addEventListener('install', (e) => self.skipWaiting());
  self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
  self.addEventListener('fetch', (e) => {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  });
  ```
- No arquivo de entrada principal `frontend/src/main.tsx`:
  Registrar o Service Worker no evento `load`, garantindo funcionamento resiliente e prevenindo erros de `process is not defined` no ambiente de bundling do Vite.
- Configurar em `frontend/vite.config.ts` o define de `process.env.NODE_ENV` para segurança e interoperabilidade.

### 2.4 Layout, Viewport e Safe Areas (`index.css`, `Header.tsx`, Footers)
- Em `frontend/src/index.css`:
  - Definir em `html, body, #root`: `min-height: 100dvh`, `background-color: #F4F9F7`, `overscroll-behavior-y: none`.
  - Atualizar `--color-domus-surface: #F4F9F7;`.
- No componente `Header.tsx`:
  - Garantir container `sticky top-0 z-50` com cor `#F4F9F7` e `padding-top: env(safe-area-inset-top, 0px)`.
- Nos Footers e elementos de navegação/ações inferiores:
  - Garantir `padding-bottom: env(safe-area-inset-bottom, 0px)` para evitar conflito com a barra de navegação/gestos de iOS e Android.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Habilitação imediata da heurística de instalação nativa do Chromium/Android ("Instalar aplicativo").
  - Remoção de barras de navegação no iOS Safari (Modo Standalone / WebApp).
  - Prevenção total de conteúdo cortado sob o notch/Dynamic Island e sob a barra de gestos do sistema.
  - Eliminação de efeito elástico indesejado no topo/fundo graças a `overscroll-behavior-y: none`.
  - Service Worker não bloqueia dados em tempo real pois opera com pass-through direto à rede.
- **Desvantagens / Riscos:**
  - `overscroll-behavior-y: none` desativa o pull-to-refresh nativo do navegador no mobile, o que é desejável para apps nativos instalados, mas pode ser notado por quem acessa no navegador padrão.
  - Dispositivos antigos que não suportam `env(safe-area-inset-*)` usarão o fallback `0px`, sem efeitos adversos.

---

## 4. Critérios de Aceitação
- [x] `frontend/public/manifest.json` configurado com `DOMUS`, `theme_color: #F4F9F7`, `background_color: #F4F9F7`, `display: standalone` e ícones `192x192` (`any`) e `512x512` (`maskable any`).
- [x] `frontend/index.html` com todas as meta tags iOS/Android, viewport fit cover e link direto para `/manifest.json`.
- [x] `frontend/public/sw.js` com `install (skipWaiting)`, `activate (clients.claim)` e fetch pass-through com fallback de cache.
- [x] `frontend/src/main.tsx` registrando `/sw.js` no evento `load`.
- [x] `frontend/src/index.css` com `html, body, #root` contendo `min-height: 100dvh`, `background-color: #F4F9F7` e `overscroll-behavior-y: none`.
- [x] `Header.tsx` fixado/sticky com fundo `#F4F9F7` e `padding-top: env(safe-area-inset-top, 0px)`.
- [x] Footers e barras de navegação inferiores respeitando `padding-bottom: env(safe-area-inset-bottom, 0px)`.
- [x] `rtk npm run typecheck` e `rtk npm run build` executados com 0 erros.
- [x] Documentação em `/docs` devidamente sincronizada.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Manifesto PWA:** Atualizar `frontend/public/manifest.json` (e espelho `manifest.webmanifest`). [CONCLUÍDO]
2. **Meta Tags do App:** Atualizar `<head>` e classes de `html/body/#root` em `frontend/index.html`. [CONCLUÍDO]
3. **Service Worker:** Atualizar `frontend/public/sw.js` e registro em `frontend/src/main.tsx` + `vite.config.ts`. [CONCLUÍDO]
4. **Layout & Safe Areas:** Ajustar `frontend/src/index.css`, `frontend/src/layouts/Header.tsx` e componentes de rodapé para safe-area-inset-top e safe-area-inset-bottom. [CONCLUÍDO]
5. **Validação Técnica:** Executar testes e build de produção com `rtk`. [CONCLUÍDO]
6. **Sincronização de Docs:** Atualizar `docs/design/responsive.md`, `docs/components/sidebar-header.md` e `docs/design/tokens.md`. [CONCLUÍDO]

---

## 6. Validação e Testes
- [x] Typecheck do frontend (`rtk npm run typecheck`) concluído com 0 erros.
- [x] Build do frontend (`rtk npm run build`) concluído com sucesso em 5.24s.
- [x] Verificação das meta tags e manifest gerado em `dist/index.html` e `dist/manifest.json`.
- [x] Verificação do Service Worker compilado em `dist/sw.js`.

---

## 7. Sincronização com /docs
- [x] `docs/design/responsive.md` atualizado com as regras de PWA, manifesto e overscroll
- [x] `docs/components/sidebar-header.md` atualizado com o fundo `#F4F9F7` e safe area
- [x] `docs/design/tokens.md` atualizado com a cor `#F4F9F7`
- [x] `docs/documentation-governance.md` validado
