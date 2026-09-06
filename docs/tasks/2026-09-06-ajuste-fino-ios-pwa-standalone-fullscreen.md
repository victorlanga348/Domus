# Task: Ajuste Fino de Tela Cheia iOS PWA, Sino de Notificações e Prevenção de Auto-Zoom

**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/design/responsive.md]]`, `[[docs/components/sidebar-header.md]]`, `[[docs/components/modals.md]]`

---

## 1. Contexto & Problema
1. **Problemas Visuais no iOS (Safari PWA Standalone):**
   - **Faixa/Corte no rodapé:** Sobra um espaço em branco no final da tela, causado por elementos com `100vh`/`h-screen`, ausência de classes de fundo diretamente nos nós de raiz (`html`, `body`, `#root`) e padding do Safe Area inferior inconsistente.
   - **Barra superior/Header estranha no topo:** O header afunda o conteúdo ou exibe separação do relógio/notch porque `viewport-fit=cover` é bloqueado por meta tags sem `maximum-scale=1.0, user-scalable=no` e por contêineres ancestrais com `overflow-x-hidden` (especificamente `App.tsx:1239`). Além disso, o `<header>` precisa cobrir fisicamente o topo absoluto (`sticky top-0 z-50`) com `pt-[env(safe-area-inset-top)]` preenchendo o notch com `#f0fcfa`, mantendo os botões centralizados verticalmente.
2. **Sino de Notificações com Ponto Permanente:**
   - Atualmente, `unreadNotificationCount` é repassado diretamente como `activityLogs.length` em `App.tsx:1230`. Se houver qualquer log de atividade gravado, o sino exibe permanentemente o ponto (badge), sem diferenciar notificações já vistas daquelas pendentes. O ponto deve aparecer estritamente quando existirem notificações novas não visualizadas.
3. **Auto-Zoom Indesejado no iOS ao Digitar Códigos/Focar Inputs:**
   - Ao clicar e digitar o código da casa em campos de input (como em `HouseSelectionView` e `JoinHouseholdView`), o iOS Safari dispara um zoom automático na tela (auto-zoom) porque a tag viewport não possuía `maximum-scale=1.0, user-scalable=no` e os inputs utilizavam classes utilitárias como `text-xs` (12px) e `text-sm` (14px), que sobrescreviam o limite mínimo de 16px exigido pelo WebKit. Uma vez que o iOS dá zoom, a viewport não retorna ao tamanho original, quebrando o layout da aplicação.

---

## 2. Solução Proposta
1. **`index.html` (Prevenção de Zoom e Encaixe de Viewport):**
   - Configurar a meta viewport:
     ```html
     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
     <meta name="apple-mobile-web-app-capable" content="yes" />
     <meta name="apple-mobile-web-app-status-bar-style" content="default" />
     <meta name="theme-color" content="#f0fcfa" />
     ```
   - Aplicar classes de fundo e altura total nas tags raiz:
     `<html lang="en" class="bg-[#f0fcfa] min-h-full min-h-[100dvh]">`
     `<body class="bg-[#f0fcfa] font-['Inter',sans-serif] text-[#131e1d] antialiased min-h-full min-h-[100dvh]">`
     `<div id="root" class="bg-[#f0fcfa] min-h-full min-h-[100dvh] flex flex-col"></div>`
2. **`index.css` (Regra Rígida Anti-Zoom para Mobile):**
   - Adicionar regra de alta especificidade com `!important` para inputs no mobile:
     ```css
     @media screen and (max-width: 768px) {
       input, textarea, select {
         font-size: 16px !important;
       }
     }
     ```
     Isso impede categoricamente que utilitários como `text-xs` ou `text-sm` baixem o tamanho da fonte para menos de 16px em smartphones, anulando o gatilho de auto-zoom do iOS Safari.
3. **`App.tsx` (Viewport & Canvas):**
   - Remover `overflow-x-hidden` da div de canvas dinâmico (linha 1239) para não invalidar o cálculo de `viewport-fit=cover` do WebKit.
   - Padronizar safe area inferior com `pb-[env(safe-area-inset-bottom)]`.
4. **`Sidebar.tsx`:**
   - Substituir `h-screen` por `h-[100dvh]`.
5. **Governança do Sino de Notificações (`App.tsx`):**
   - Criar estado `readNotificationIds: string[]` persistido em `localStorage` por residência (`${houseKey}_read_notifications`).
   - Calcular dinamicamente `unreadNotificationCount`:
     ```ts
     const unreadNotificationCount = useMemo(() => {
       const readSet = new Set(readNotificationIds);
       return activityLogs.filter((log) => !readSet.has(log.id)).length;
     }, [activityLogs, readNotificationIds]);
     ```
   - Ao abrir a gaveta (`handleOpenNotifications` / clique no sino): marcar todos os IDs de `activityLogs` atuais como lidos, gravando no `localStorage` e zerando o badge imediatamente.
   - Ao receber novo log de atividade em tempo real (via Socket.io), o novo ID não estará na lista de lidos, reativando o ponto no sino.
6. **Campos de Código (`HouseSelectionView.tsx` & `JoinHouseholdView.tsx`):**
   - Ajustar classes de fonte dos campos de código para `text-base` (16px) e `font-mono tracking-wider`, assegurando conforto tátil e visual.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Encaixe contínuo na tela cheia do iPhone sem cortes no rodapé nem sobreposição no topo.
  - O site nunca mais aproxima (auto-zoom) ao clicar em campos de código ou qualquer outro formulário.
  - O sino de notificações opera com fidelidade nativa: o ponto só surge se houver novidade não vista.
  - Persistência das notificações vistas no `localStorage` por residência.
- **Desvantagens / Riscos:**
  - `user-scalable=no` suprime o zoom manual por pinça (padrão de experiência de app nativo em PWAs).
  - A remoção de `overflow-x-hidden` no canvas central requer contenção horizontal com `w-full max-w-full min-w-0` (já existente no projeto).

---

## 4. Critérios de Aceitação
- [x] O viewport no iOS PWA não exibe faixa branca no rodapé nem desalinhamento no notch do topo.
- [x] Ao focar e digitar no campo de código (ou qualquer input) no iPhone, o site **não** dá zoom / aproximação na tela.
- [x] `overflow-x-hidden` removido do contêiner de canvas em `App.tsx`.
- [x] O sino de notificações **não** exibe o ponto se todos os alertas já foram visualizados.
- [x] Ao clicar no sino para abrir a gaveta, o ponto é removido imediatamente.
- [x] A chegada de um novo log de atividade em tempo real reativa o ponto do sino.
- [x] Typecheck e build executados com 0 erros.

---

## 5. Plano de Implementação (Passo a Passo)
1. Atualizar [frontend/index.html](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/index.html) com meta viewport rígida (`user-scalable=no, maximum-scale=1.0, viewport-fit=cover`) e tags raiz com `bg-[#f0fcfa] min-h-[100dvh]`.
2. Atualizar [frontend/src/index.css](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/index.css) adicionando a proteção anti-zoom `@media screen and (max-width: 768px) { input, textarea, select { font-size: 16px !important; } }`.
3. Atualizar [frontend/src/layouts/Sidebar.tsx](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/layouts/Sidebar.tsx) (substituir `h-screen`).
4. Atualizar [frontend/src/App.tsx](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx):
   - Remover `overflow-x-hidden` da div de canvas (linha 1239).
   - Implementar estado de `readNotificationIds` e cálculo de `unreadNotificationCount`.
   - Adicionar `handleOpenNotifications` para marcar como lidas ao abrir.
5. Atualizar [frontend/src/features/auth/components/HouseSelectionView.tsx](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/HouseSelectionView.tsx) e [frontend/src/features/auth/components/JoinHouseholdView.tsx](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/JoinHouseholdView.tsx) com `text-base` nos inputs de código.
6. Validar com `rtk npm run typecheck`, `rtk npm run build` e `rtk npm run test:unit`.
7. Sincronizar `/docs` e realizar commit em português.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` (frontend)
- [x] `rtk npm run typecheck` (backend)
- [x] `rtk npm run build` (frontend)
- [x] `rtk npm run test:unit` (backend)

---

## 7. Sincronização com /docs
- [x] `docs/design/responsive.md`
- [x] `docs/components/sidebar-header.md`
- [x] `docs/components/modals.md`
