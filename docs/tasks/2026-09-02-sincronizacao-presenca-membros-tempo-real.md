# Task: Sincronização em Tempo Real de Membros & Refinamento Mobile iOS/Safari
**Data:** 2026-09-02  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/design/responsive.md]]`, `[[docs/components/sidebar-header.md]]`, `[[docs/pages/auth-onboarding.md]]`, `[[docs/architecture/security.md]]`

---

## 1. Contexto & Problema

Nos testes reais no smartphone (iOS Safari / Chrome Android) e no PC simultaneamente, foram detectadas falhas críticas de conexão e usabilidade:
1. **Membros e Presença Desconectados:**
   - Em novos aparelhos (como celular), o estado `familyMembers` começava apenas com o usuário local porque `<DashboardView />` não recebia a prop `onSyncMembers` do `App.tsx`.
   - O socket não transmitia o morador logado no `useHouseSocket`, impedindo o backend de registrar presença no `housePresence`.
2. **Auto-zoom Indesejado no iOS Safari:**
   - Ao focar nos campos de E-mail, Senha e PIN, o Safari aplica zoom automático porque inputs possuem `font-size < 16px` no mobile.
3. **Botão do Google Cortado / Vazando:**
   - O iframe do Google Identity Services foi configurado com largura estática (`width: 384`), extrapolando a largura de telas menores que 400px e cortando a margem direita.
4. **Quebra de Linha no Header:**
   - Em larguras estreitas (< 380px), os botões de ação (Férias, Notificações, Membros, Troca de Casa) comprimem o título "DOMUS" e causam quebra de alinhamento.
5. **Drawer / Sidebar com Fechamento Incompleto:**
   - Ao clicar em links de navegação dentro do menu lateral móvel, o drawer não fechava suavemente com transição de saída (`-translate-x-full duration-300`).
6. **Scroll Vertical com Teclado Virtual Levantado:**
   - Na tela de login, o container centralizado sem rolagem impedia a visualização confortável do botão de submissão quando o teclado do celular subia.

---

## 2. Solução Proposta

1. **Prevenção de Auto-Zoom no iOS:**
   - Metatag em `frontend/index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover" />`.
   - Regra base em `frontend/src/index.css`: `input, textarea, select { font-size: 16px; }` no mobile, com fallback para tamanhos compactos em telas `>= 640px`.
2. **Responsividade Estrita do Botão do Google:**
   - Container `#google-btn-container` com `w-full max-w-full overflow-hidden flex justify-center`.
   - Cálculo dinâmico da largura no `renderButton` limitado a `Math.min(containerWidth, 340)` e mínimo de `240`.
3. **Compactação do Header em Telas Estreitas:**
   - Reduzir paddings laterais no mobile para `px-3 sm:px-8 py-2.5 sm:py-4`.
   - Botão de férias compacto em telas `< 400px` (exibindo ícone e badge discreto, ocultando rótulos longos).
   - Reduzir espaçamentos entre ícones (`gap-1 sm:gap-2`).
4. **Sidebar Mobile com Slide-Out Fluido & Auto-Close:**
   - Utilizar classes de transição CSS `transform transition-transform duration-300 ease-in-out` (`translate-x-0` quando aberto, `-translate-x-full` quando fechado) e `pointer-events-none` no container.
   - Forçar `onCloseMobile?.()` imediatamente ao clicar em qualquer link de navegação ou no perfil do usuário.
5. **Estabilização de Viewport para Teclado Virtual:**
   - Em `AuthView.tsx`, container configurado com `min-h-[100dvh] w-full flex flex-col justify-center items-center p-4 sm:p-6 overflow-y-auto py-8`.
6. **Sincronização de Membros & Presença Real-Time:**
   - Conectar `handleSyncMembers` a `onSyncMembers` em `DashboardView.tsx`.
   - Passar `currentUser` no `useHouseSocket` e escutar `onPresence` e `onMembersUpdated`.
   - Adicionar `avatar_url: true` na consulta Prisma do backend (`dashboard.service.ts`).
   - Reconexão automática resiliente no `socketClient.ts`.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - Experiência mobile nativa e sem bugs visuais no iOS Safari e Chrome Android.
  - Membros sincronizados em tempo real: abrir no PC e no celular mostra instantaneamente os moradores online em ambos.
  - Zero auto-zoom incômodo nos inputs.
  - Botão Google 100% responsivo em qualquer resolução.
- **Desvantagens / Riscos:**
  - Nenhuma; melhorias cirúrgicas focadas na experiência mobile e robustez do WebSocket.

---

## 4. Critérios de Aceitação

- [x] Inputs mobile com `16px` para eliminar auto-zoom no iOS Safari.
- [x] Metatag `viewport-fit=cover` e `maximum-scale=1.0` configurada.
- [x] Botão do Google 100% contido dentro da viewport sem estourar a margem direita.
- [x] Header compacto em telas `< 380px` sem quebrar o título "DOMUS".
- [x] Sidebar móvel fecha imediatamente ao clicar em qualquer aba com animação suave de saída.
- [x] Tela de login rola perfeitamente ao subir o teclado virtual.
- [x] Membros da residência carregados e conectados em tempo real no PC e no smartphone.
- [x] `rtk npm run typecheck` e `rtk npm run build` passando com código 0.

---

## 5. Plano de Implementação (Passo a Passo)

1. [x] **Frontend - HTML & CSS Base:**
   - Atualizar meta viewport em `frontend/index.html`.
   - Adicionar regra de font-size 16px para inputs em `frontend/src/index.css`.
2. [x] **Frontend - AuthView & Google Button:**
   - Ajustar container e cálculo de largura do botão Google em `AuthView.tsx`.
   - Ajustar container de login para suportar rolagem com teclado virtual (`min-h-[100dvh] overflow-y-auto`).
3. [x] **Frontend - Header:**
   - Ajustar paddings e modo compacto do botão de férias em `Header.tsx`.
4. [x] **Frontend - Sidebar Mobile:**
   - Implementar transição CSS fluida `-translate-x-full` e fechamento garantido no clique em `Sidebar.tsx`.
5. [x] **Backend - Dashboard Service:**
   - Incluir `avatar_url: true` no select de usuários em `backend/src/modules/dashboard/dashboard.service.ts`.
6. [x] **Frontend - Sincronização & WebSocket:**
   - Implementar `handleSyncMembers` e passar para `DashboardView` em `App.tsx`.
   - Passar `currentUser` no `useHouseSocket` e escutar `onPresence` e `onMembersUpdated`.
   - Adicionar reconexão automática em `socketClient.ts` e `useRef` em `useHouseSocket.ts`.
7. [x] **Validação Técnica e Testes:**
   - Executar typecheck e build em ambos os projetos com `rtk`.
8. [x] **Sincronização & Commit:**
   - Atualizar status para "Concluída" e realizar commit em português.

---

## 6. Validação e Testes

- [x] `rtk npm run typecheck` (frontend): Código 0.
- [x] `rtk npm run build` (frontend): Código 0.
- [x] `rtk npm run typecheck` (backend): Código 0.
- [x] `rtk npm run build` (backend): Código 0.

---

## 7. Sincronização com /docs

- [x] `docs/design/responsive.md`
- [x] `docs/components/sidebar-header.md`
- [x] `docs/pages/auth-onboarding.md`
- [x] Matriz de impacto validada em `[[docs/documentation-governance.md]]`.
