# Task: Estabilização iOS PWA, Instalação Android 1-Click e Cargos em Tempo Real
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/design/responsive.md]]`
- `[[docs/components/sidebar-header.md]]`
- `[[docs/integrations/api-contracts.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema

1. **Problema Visual no iOS PWA (Standalone):**
   - **Faixa/Corte no rodapé:** Containers presos a `100vh` tradicional provocam cortes no WebKit do Safari e barra branca no rodapé. Fundo do `html`, `body` e `#root` precisa ter cor unificada e `min-h-[100dvh]` com `min-h-full` e `pb-[env(safe-area-inset-bottom)]`.
   - **Header no topo:** O `<header>` deve ter background sólido `#f0fcfa` (cor idêntica ao header e à meta tag `theme-color`), cobrindo 100% da área do notch com `pt-[env(safe-area-inset-top)]`, `z-50`, e container interno com altura mínima flex (`min-h-[56px] sm:min-h-[64px]`) para que o logo "Domus", ícones e ações fiquem centralizados e confortáveis sem colar no relógio do SO.
2. **Nome do Aplicativo:**
   - Padronizar integralmente como "Domus" (em vez de "DOMUS") em títulos, modais, mensagens de toast e componentes.
3. **Instalação PWA no Android & iOS:**
   - **Android:** Atualmente o `beforeinstallprompt` nunca dispara porque o `main.tsx` e `sw.js` estavam desregistrando ativamente o Service Worker a cada carregamento. O Chromium exige um Service Worker ativo com listener de `fetch` para habilitar a instalação nativa. Sem ele, o botão de instalar falha e cai nas instruções manuais. Com um Service Worker registrado e pass-through, o clique no botão executa `installPromptEvent.prompt()` exibindo diretamente o diálogo nativo do Android em 1 clique para a Home.
   - **iOS:** A Apple não disponibiliza API de instalação programática via JavaScript (`beforeinstallprompt` não existe no WebKit). O usuário do iOS necessariamente precisa usar o botão de Compartilhar -> "Adicionar à Tela de Início". O aplicativo deve apresentar um modal ilustrado e claro com essa instrução exclusiva para iOS.
4. **Governança de Membros & Cargos em Tempo Real:**
   - Ações de promover a Administrador (`handlePromoteToAdmin`) e destituir para Morador (`handleDemoteToResident`) apenas alteravam o estado local do React na máquina local, exigindo recarregar a página para sincronizar.
   - É necessário emitir o evento WebSocket `house:members_updated` para que todos os aparelhos conectados na mesma casa atualizem os cargos dos moradores instantaneamente na tela sem precisar recarregar.

---

## 2. Solução Proposta

### 2.1 Estabilização Visual do Viewport e Header iOS
- No `frontend/index.html`:
  - `theme-color` atualizado para `#f0fcfa` (a cor exata de fundo do header e da tela).
  - Configurar `html, body, #root` com background `#f0fcfa` e `min-h-[100dvh]`.
- No `frontend/src/layouts/Header.tsx`:
  - `<header className="sticky top-0 z-50 bg-[#f0fcfa] border-b border-[#e4f0ee] w-full min-w-0 pt-safe" style={{ backgroundColor: '#f0fcfa', paddingTop: 'env(safe-area-inset-top, 0px)' }}>`
  - Container interno com `min-h-[56px] sm:min-h-[64px] flex items-center justify-between` garantindo alinhamento centralizado e espaçamento perfeito.
- No `frontend/src/App.tsx`:
  - Substituir `h-screen h-[100dvh] max-h-[100dvh]` do container principal por `min-h-[100dvh] w-full bg-[#f0fcfa]`.
  - Garantir que o container do canvas possua `pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]`.

### 2.2 Service Worker para Instalação 1-Click no Android
- Em `frontend/public/sw.js`:
  - Implementar Service Worker de pass-through de rede total (Network-First / Direct fetch), sem bloqueio ou cache de rotas de API `/api/*` e `/socket.io/*`.
- Em `frontend/src/main.tsx`:
  - Registrar formalmente `/sw.js` no evento `window.load` em vez de desregistrá-lo.
  - Isso permite que o Chrome/Android atenda 100% dos critérios PWA e dispare o evento `beforeinstallprompt`.
- Em `frontend/src/features/settings/components/SettingsView.tsx`:
  - No Android, o botão "Instalar App" executa `deferredInstallPrompt.prompt()`, abrindo o diálogo nativo do sistema e adicionando o Domus direto na tela inicial.
  - No iOS, exibir o modal explicativo com ícone de compartilhamento do Safari e opção "Adicionar à Tela de Início".

### 2.3 Sincronização de Cargos e Membros em Tempo Real (WebSocket)
- Em `backend/src/shared/socket/socketServer.ts`:
  - Adicionar listener para `house:members_updated`, retransmitindo o evento para a sala `house:${houseId}`.
- Em `frontend/src/shared/socket/socketClient.ts`:
  - Adicionar helper `emitMembersUpdated(houseId, payload)`.
- Em `frontend/src/shared/socket/useHouseSocket.ts`:
  - Escutar `house:members_updated` e acionar `onMembersUpdated(data)`.
- Em `frontend/src/App.tsx`:
  - Em `handlePromoteToAdmin`, `handleDemoteToResident`, `handleConfirmLeadershipTransfer`, `handleAddFamilyMember` e `handleRemoveMember`:
    - Atualizar o estado local e persistir em `localStorage`.
    - Emitir `emitMembersUpdated(currentHouse.id, { members: updatedMembers })`.
    - Atualizar a lista de membros em tempo real em todas as sessões conectadas.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Corrige em definitivo o corte no rodapé e o topo desalinhado no Safari iOS em modo PWA.
  - Habilita instalação PWA nativa com 1 clique no Android através de Service Worker leve e seguro que não interfere nas requisições da aplicação.
  - Torna a governança de cargos instantânea entre múltiplos aparelhos conectados via WebSocket.
- **Desvantagens / Riscos:**
  - No iOS, a instalação programática em 1 clique não é suportada pela Apple, demandando manter o modal com as instruções nativas do Safari.

---

## 4. Critérios de Aceitação
- [x] `theme-color` no `index.html` ajustado para `#f0fcfa`.
- [x] `html`, `body` e `#root` estilizados com `#f0fcfa` e `min-h-[100dvh]`.
- [x] Header com `z-50`, preenchimento sólido `#f0fcfa`, `pt-safe` e altura interna centralizada `min-h-[56px]`.
- [x] Rodapé e canvas protegidos com `pb-[env(safe-area-inset-bottom)]`.
- [x] Service Worker `/sw.js` registrado no `main.tsx`, possibilitando captura de `beforeinstallprompt` no Android.
- [x] Promoção e rebaixamento de membros emitem `house:members_updated` via Socket.io e atualizam a tela de outros usuários em tempo real sem reload.
- [x] Nome "Domus" padronizado.
- [x] Typecheck e build do frontend e backend aprovados via `rtk`.
- [x] Documentação sincronizada em `[[docs/design/responsive.md]]`, `[[docs/components/sidebar-header.md]]` e `[[docs/integrations/api-contracts.md]]`.

---

## 5. Plano de Implementação (Passo a Passo)
1. Atualizar `index.html` e `index.css` com `theme-color: #f0fcfa` e backgrounds consistentes.
2. Refinar `Header.tsx` e `App.tsx` com `min-h-[100dvh]`, `min-h-[56px]` e safe areas.
3. Ajustar `frontend/public/sw.js` e `frontend/src/main.tsx` para registro do Service Worker PWA pass-through.
4. Adicionar suporte ao evento `house:members_updated` no `socketServer.ts`, `socketClient.ts`, `useHouseSocket.ts` e `App.tsx`.
5. Validar compilação com `rtk npm run build` e `rtk npm run typecheck`.
6. Atualizar a documentação em `/docs`.
