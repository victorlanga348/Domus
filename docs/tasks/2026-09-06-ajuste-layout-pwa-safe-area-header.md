# Task: Correção do Layout do Cabeçalho PWA e Suporte a Safe-Area Insets
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/design/responsive.md]]`
- `[[docs/components/sidebar-header.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
Quando a aplicação Domus é instalada como Progressive Web App (PWA) em dispositivos móveis (especialmente iOS/Safari em modo `standalone`), os elementos da barra de status do sistema (relógio, indicador de bateria, conectividade e recorte do notch / Dynamic Island) sobrepõem diretamente os elementos do cabeçalho da aplicação (logo "Domus", botão de menu hamburguer e botões de notificação/moradores).

As causas identificadas são:
1. No arquivo `frontend/index.html`, a meta tag `apple-mobile-web-app-status-bar-style` estava configurada como `black-translucent`, o que instrui o iOS a sobrepor o conteúdo da página com ícones em branco. Como o cabeçalho do Domus possui fundo claro (`#f0fcfa`), os ícones ficam ilegíveis e sobrepostos ao texto e botões.
2. A tag `theme-color` estava definida como `#16302e`, desarmonizada com o topo claro da aplicação.
3. A meta tag de viewport continha `maximum-scale=1.0` sem a especificação limpa de `viewport-fit=cover`.
4. O componente `Header.tsx` não possuía espaçamento seguro (`safe-area-inset-top`), fazendo com que o conteúdo flex ficasse colado no topo físico do ecrã.
5. Os elementos inferiores (drawer mobile do `Sidebar.tsx`, gavetas modais do `Modals.tsx`, notificações flutuantes e final do canvas em `App.tsx`) careciam de `env(safe-area-inset-bottom)` para evitar sobreposição pela barra de gestos (Home Indicator) do iOS/Android.

---

## 2. Solução Proposta

### 2.1 Ajuste nas Metatags Raiz (`frontend/index.html` e `manifest.webmanifest`)
- Atualizar a meta tag `viewport` para:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  ```
- Atualizar as configurações de barra de status e tema:
  ```html
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Domus" />
  <meta name="theme-color" content="#ffffff" />
  ```
- Atualizar `theme_color` e `background_color` em `frontend/public/manifest.webmanifest` para `"#ffffff"` e nome para `"Domus"`.

### 2.2 Suporte a Safe-Area no Header (`frontend/src/layouts/Header.tsx`)
- Configurar o `<header>` com `pt-[env(safe-area-inset-top,0px)]` e classe `.pt-safe` enquanto mantém o background `bg-[#f0fcfa]/95 backdrop-blur-md` expandindo até o topo (`top-0`).
- Envolver os itens internos (logo "Domus", hamburguer, botões de ação) em container flex dedicado (`px-2.5 sm:px-8 py-2 sm:py-4 flex items-center justify-between w-full min-w-0`), garantindo que permaneçam perfeitamente alinhados e centralizados abaixo da safe area.

### 2.3 Utilitários Globais de Safe Area (`frontend/src/index.css`)
- Declarar classes utilitárias CSS seguras:
  - `.pt-safe { padding-top: env(safe-area-inset-top, 0px); }`
  - `.pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }`
  - `.pl-safe { padding-left: env(safe-area-inset-left, 0px); }`
  - `.pr-safe { padding-right: env(safe-area-inset-right, 0px); }`

### 2.4 Proteção de Barras e Elementos Inferiores (`env(safe-area-inset-bottom)`)
- `Sidebar.tsx`: drawer móvel com padding superior e inferior dinâmicos (`pt-[calc(1.25rem+env(safe-area-inset-top,0px))] pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]`).
- `App.tsx`: container de canvas com `pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]` e banners de toast flutuantes posicionados acima do indicador de gestos (`bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]`).
- `Modals.tsx`: drawers laterais (`NotificationsDrawer` e `FamilyMembersDrawer`) com padding dinâmico superior e inferior.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Resolução definitiva do conflito entre a barra de status/notch nativa e a barra de navegação do Domus em PWA standalone.
  - O cabeçalho preenche elegantemente até o limite superior da tela com blur e fundo uniforme, enquanto textos e ícones ficam 100% legíveis e clicáveis.
  - Zero impacto ou regressão em navegadores normais de desktop ou celulares sem notch, pois `env(..., 0px)` faz fallback transparente para 0.
- **Desvantagens / Riscos:**
  - Aumento de alguns pixels na altura total do cabeçalho apenas em dispositivos móveis que possuem notch ou status bar ativa em standalone.

---

## 4. Critérios de Aceitação
- [x] `frontend/index.html` contém `viewport-fit=cover`, `apple-mobile-web-app-status-bar-style="default"`, `theme-color="#ffffff"` e título "Domus".
- [x] `frontend/public/manifest.webmanifest` atualizado com `theme_color: "#ffffff"` e nome "Domus".
- [x] `Header.tsx` expande o background até o topo e posiciona o conteúdo logo abaixo da safe area (`pt-[env(safe-area-inset-top,0px)]`).
- [x] `Sidebar.tsx` (drawer mobile) e `Modals.tsx` respeitam `safe-area-inset-top` e `safe-area-inset-bottom`.
- [x] `App.tsx` possui espaçamento seguro no rodapé e nos banners de toast.
- [x] Build e checagem de tipos executados sem erros via `rtk`.
- [x] Documentação sincronizada em `docs/design/responsive.md` e `docs/components/sidebar-header.md`.

---

## 5. Plano de Implementação (Passo a Passo)
1. Atualizar meta tags em `frontend/index.html` e manifesto em `frontend/public/manifest.webmanifest`.
2. Adicionar utilitários `.pt-safe` e `.pb-safe` em `frontend/src/index.css`.
3. Ajustar `frontend/src/layouts/Header.tsx` para acomodar `safe-area-inset-top` mantendo fundo contínuo e título "Domus".
4. Ajustar drawers e rodapés em `frontend/src/layouts/Sidebar.tsx`, `frontend/src/App.tsx` e `frontend/src/components/Modals.tsx`.
5. Executar `rtk npm run build` e `rtk npm run typecheck` no frontend para validar tipos e empacotamento.
6. Atualizar as specs em `docs/design/responsive.md` e `docs/components/sidebar-header.md`.

---

## 6. Validação e Testes
- [x] Build de produção (`rtk npm run build`)
- [x] Typecheck sem erros (`rtk npm run typecheck`)
- [x] Validação visual e estrutural do layout móvel

---

## 7. Sincronização com /docs
- [x] `docs/design/responsive.md` atualizado
- [x] `docs/components/sidebar-header.md` atualizado
- [x] `docs/tasks/2026-09-06-ajuste-layout-pwa-safe-area-header.md` marcado como concluído após implementação
