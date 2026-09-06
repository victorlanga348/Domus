# Task: Estabilização do App ao Despertar (Wake from Sleep / Reativação Mobile)

**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/components/sidebar-header.md]]`, `[[docs/design/responsive.md]]`

---

## 1. Contexto & Problema
Quando o celular bloqueia a tela, desliga ou coloca o app em segundo plano e depois é desbloqueado/reativado, ocorrem dois fenômenos que degradam a experiência:
1. **Sidebar "se fechando sozinha" sem ter sido aberta:** O drawer móvel em `Sidebar.tsx` permanecia permanentemente montado no DOM com a classe `transform transition-transform duration-300 ease-in-out` e `-translate-x-full`. Ao reativar ou remontar a árvore de renderização do WebKit/Chromium, o navegador renderiza o drawer na posição neutra (0) por um frame e em seguida executa a animação de 300ms até `-translate-x-full`. O usuário vê a barra lateral escura deslizando para fora da tela.
2. **"Site dando uma pulada como se estivesse recarregando":** 
   - Ao suspender e retomar, o WebKit descarta a memória volátil de abas inativas para poupar bateria e recarrega o app.
   - Na inicialização, `DashboardView` inicializa com `dashboardData: null` e `loading: true`, renderizando `DashboardSkeleton`. Quando a requisição da API local/remota responde 150ms depois, o skeleton é abruptamente substituído pelo conteúdo real, provocando o "salto" de layout.
   - A aba ativa também resetava para `dashboard`, perdendo a tela onde o morador estava antes de bloquear o celular.

---

## 2. Solução Proposta
1. **Desmontagem do Drawer Móvel quando Fechado (`Sidebar.tsx`):**
   - Condicionar a renderização do drawer móvel exclusivamente a `isMobileOpen` (ex: `{isMobileOpen && (...) }`) com animação de entrada limpa (`animate-in fade-in` e `slide-in-from-left duration-200`), alinhando com o padrão já utilizado em `NotificationsDrawer` e `FamilyMembersDrawer`.
   - Quando `isMobileOpen === false`, nenhum elemento fixo com transição existe no DOM. Isso anula 100% o bug da barra lateral "se fechando" na reativação do aparelho.
2. **Hidratação Instantânea de Cache no `DashboardView`:**
   - Inicializar `dashboardData` a partir de cache local salvo em `localStorage` (`${houseKey}_dashboard_cache`).
   - Se já houver dados em cache, `loading` não exibe skeleton bloqueante, renderizando a tela de imediato sem saltos ou piscadas visíveis.
3. **Persistência de Aba Ativa (`App.tsx`):**
   - Persistir `currentTab` e `subTab` em `localStorage` (`domus_active_tab`, `domus_active_subtab`).
   - Se o sistema operacional recarregar o WebView após desbloqueio, o usuário retorna exatamente à tela onde estava, sem saltos.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Elimina completamente o efeito fantasma da barra lateral se fechando ao desbloquear o aparelho.
  - Reativação suave e instantânea de tela sem "pulos" de skeleton.
  - O usuário permanece na mesma aba em que estava antes do bloqueio do celular.
- **Desvantagens / Riscos:**
  - Nenhuma desvantagem técnica identificada; alinha o `Sidebar.tsx` ao padrão arquitetural dos demais modais do projeto.

---

## 4. Critérios de Aceitação
- [x] O drawer móvel não renderiza no DOM quando `isMobileOpen === false`.
- [x] Ao desbloquear/ligar o celular com o app aberto, a barra lateral não pisca nem anima fechamento.
- [x] O painel não "pula" nem pisca skeleton na reativação quando já existem dados locais em cache.
- [x] A aba ativa é mantida após o desligamento da tela do aparelho.
- [x] Typecheck e build executados com 0 erros.

---

## 5. Plano de Implementação (Passo a Passo)
1. Atualizar [frontend/src/layouts/Sidebar.tsx](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/layouts/Sidebar.tsx) para renderizar condicionalmente o drawer móvel (`isMobileOpen`).
2. Atualizar [frontend/src/App.tsx](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx) para persistir e restaurar `currentTab` e `subTab`.
3. Atualizar [frontend/src/features/dashboard/components/DashboardView.tsx](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/dashboard/components/DashboardView.tsx) para hidratar cache inicial de dados.
4. Executar validação técnica (`typecheck`, `test:unit`, `build`).
5. Sincronizar `/docs` e registrar commit em português.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` (frontend)
- [x] `rtk npm run typecheck` (backend)
- [x] `rtk npm run build` (frontend)
- [x] `rtk npm run test:unit` (backend)

---

## 7. Sincronização com /docs
- [x] `docs/components/sidebar-header.md`
- [x] `docs/design/responsive.md`
