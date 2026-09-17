# Task: Estabilização Mobile PWA, Correção de Troca de Residência e Eliminação de Quebras de Layout
**Data:** 2026-09-17  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/dashboard.md]]`, `[[docs/pages/settings.md]]`, `[[docs/pages/auth-onboarding.md]]`, `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
1. **Falha / "Piscar" no Botão do Prédio ao Trocar de Casa na Página de Recados:**
   - Ao clicar no botão com ícone de prédio (`apartment`) no cabeçalho quando o usuário está na página de recados (`DashboardView`), a interface pisca e retorna imediatamente para o dashboard da casa em vez de abrir a tela de escolha/criação de residência (`HouseSelectionView`). Na tela de configurações (`SettingsView`), o mesmo fluxo funciona normalmente.
   - **Causa-raiz:** Em `App.tsx`, `handleSwitchHouse()` executa `setCurrentHouse(null)`. Porém, na página de recados, o `syncAllHouseData` (ou `onSyncHouse` emitido pelo `DashboardView`) possui callbacks assíncronos (`.then()`) em execução que chamam `setCurrentHouse((prev) => ({ ...(prev || {}), id: data.house.id, ... }))`. Quando `prev` é `null`, o operador `(prev || {})` recria um objeto não-nulo com os dados da residência recém-descartada, ressuscitando `currentHouse` e cancelando a transição para `HouseSelectionView`. Além disso, em `HouseSelectionView`, `currentUser` é passado com a tipagem e dados de `FamilyMember` em vez de `AuthUser`, impedindo a leitura correta de `currentUser.house_id`.

2. **Tela Branca no PWA Mobile após Período de Inatividade (Ausência de Skeleton Inicial):**
   - Ao abrir o app instalado no celular após período em segundo plano, o app exibe uma tela inteiramente branca durante o carregamento, aparecendo subitamente depois, sem exibir o skeleton programado.
   - **Causa-raiz:** Em `index.html`, as fontes do Google Fonts (`Inter` e `Material Symbols Outlined`) estão declaradas como `<link rel="stylesheet">` síncronas no `<head>`. Em navegadores mobile (WebKit/Safari Standalone e Chrome WebAPK), stylesheets externas são **render-blocking**: o navegador suspende qualquer pintura inicial (First Contentful Paint) até que as requisições de rede para a CDN do Google sejam concluídas. Como o JS baixa em paralelo, quando as fontes terminam, o React já está pronto e renderiza tudo de uma vez, suprimindo completamente o skeleton embutido no HTML estático.

3. **Quebras de Layout, Tipografia Desproporcional e FOUT (Flash of Unstyled Text):**
   - Em conexões móveis ou oscilações de rede, antes da fonte de ícones ser carregada, os elementos `<span class="material-symbols-outlined">...</span>` exibem o texto literal da ligadura (ex: `"apartment"`, `"notifications"`, `"dashboard"`). Isso quebra a largura de botões circulares e cabeçalhos.
   - Ausência de trava de `-webkit-text-size-adjust: 100%` e contenções de texto (`truncate`, `break-words`, `min-w-0`) ocasionam quebras de palavras e desproporção de fontes em viewports estreitas.

4. **Piscada / Recarregamento Visual nas Trocas de Página e ao Alternar Abas do Sistema:**
   - As transições de aba utilizam `<AnimatePresence mode="wait">` com fade-out de saída (`opacity: 0`). Com `mode="wait"`, o conteúdo antigo é desmontado e a tela fica vazia por 220ms antes de montar a nova tela, gerando a sensação de recarregamento/piscada rápida.
   - Os eventos de foco móvel (`visibilitychange`, `focus`, `pageshow`) disparam simultaneamente e sem debounce, recriando novos arrays/objetos no estado React e forçando re-renderização total da árvore.

5. **Necessidade de Cobertura de Testes Automatizados no Navegador:**
   - O projeto possui 69 testes unitários sólidos no backend, mas carece de um conjunto automatizado de testes de ponta a ponta (E2E / Browser) cobrindo as funções primárias do DOMUS (login, alternância de casa, mural de recados, escala de tarefas e configurações).

---

## 2. Solução Proposta

### 2.1 Correção Cirúrgica da Alternância de Residência (`App.tsx` & `HouseSelectionView.tsx`)
- Adicionar proteção nos updaters de `setCurrentHouse`:
  ```typescript
  setCurrentHouse((prev) => {
    if (!prev) return null; // Não ressuscita residência caso o usuário tenha acionado a troca
    return { ...prev, id: data.house.id, name: data.house.name, invite_code: data.house.invite_code };
  });
  ```
- Implementar flag `isSwitchingHouseRef` em `App.tsx` para ignorar sumariamente qualquer requisição BFF/Dashboard que chegue após o acionamento de `handleSwitchHouse()`.
- Passar o objeto correto `currentUser={authUser}` para `HouseSelectionView`, permitindo a correta detecção de qual residência está ativa e seleção de outras casas com 1 clique.

### 2.2 FCP a 0ms no Mobile & Eliminação de Tela Branca (`index.html` & `sw.js`)
- Converter os links externos de fontes em carregamento assíncrono não-bloqueante via técnica `media="print" onload="this.media='all'"` com preconnect e fontes de sistema locais como fallback imediato (`system-ui, -apple-system, sans-serif`).
- Otimizar o skeleton estático nativo em `index.html` com dimensões fluidas compatíveis com safe areas móveis (`env(safe-area-inset-top)`), garantindo que ao acordar em segundo plano, a tela desenhe o esqueleto em 0ms.
- Atualizar o `sw.js` para realizar cache-first dos assets estáticos locais, eliminando a dependência de rede no reaquecimento do WebView.

### 2.3 Estabilização de Layout, Tipografia e Ícones (`index.css` & Componentes)
- Definir dimensões fixas (`w-6 h-6 shrink-0 overflow-hidden inline-flex items-center justify-center`) e `font-display: block` para ícones do Material Symbols, garantindo que o texto da ligadura nunca estoure o layout caso a fonte demore a carregar.
- Aplicar `-webkit-text-size-adjust: 100%` e `text-size-adjust: 100%` globalmente no `index.css` contra auto-inflação de fontes no iOS.
- Revisar containers móveis garantindo `min-w-0`, `break-words` e flex wrapping estruturado.

### 2.4 Eliminação de Piscadas nas Transições (`App.tsx`)
- Substituir `AnimatePresence mode="wait"` por transição suave sem desmontagem em branco, ou transição direta com aceleração de hardware (`transform-gpu`) sem hiato de tela vazia.
- Adicionar throttling/debouncing de 500ms no gatilho de reativação (`handleResumeOrFocus`), evitando re-sincronizações triplicadas (`visibilitychange` + `focus` + `pageshow`).

### 2.5 Testes de Navegador Automatizados
- Criar suíte de testes de navegador (Playwright / Puppeteer / Browser Runners) validando as 5 funções fundamentais:
  1. Fluxo de Autenticação & Entrada em Casa;
  2. Alternância Livre de Residência (tanto no Header quanto nas Configurações);
  3. Mural de Recados & Criação de Checklist;
  4. Visualização e Rodízio de Tarefas;
  5. Configurações & Governança da Casa.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Corrige em definitivo o bug do botão de troca de residência.
  - Elimina a tela branca no PWA em dispositivos Android e iOS ao reabrir o app.
  - Remove as piscadas incômodas na navegação entre abas, conferindo fluidez de aplicativo nativo.
  - Garante estabilidade visual tipográfica mesmo com conexões instáveis.
- **Desvantagens / Riscos:**
  - Ajustes de Service Worker exigem invalidação de cache prévio na reativação dos clientes móveis.
  - Suíte de testes de navegador exige dependência ou runner dedicado no frontend.

---

## 4. Critérios de Aceitação
- [x] O botão do prédio no cabeçalho na página de recados navega imediatamente para `HouseSelectionView` sem piscar ou retornar ao dashboard.
- [x] O mesmo comportamento funciona quando o usuário é o único morador na residência.
- [x] Ao recarregar ou reabrir o app no celular, o skeleton estático aparece instantaneamente a 0ms, eliminando a tela branca.
- [x] Não ocorrem estouros de layout ou quebras visuais quando as fontes estão em carregamento.
- [x] A navegação entre as abas não causa tela em branco nem piscadas que simulem reload da página.
- [x] As 5 funções mais importantes do sistema possuem testes automatizados funcionais.
- [x] `rtk npm run typecheck` e `rtk npm run build` passam com 100% de sucesso.

---

## 5. Plano de Implementação (Passo a Passo)
1. [x] **Ajuste em `App.tsx`:**
   - Adicionar trava de não-ressurreição de `currentHouse` em `syncAllHouseData` e `onSyncHouse`.
   - Adicionar `isSwitchingHouseRef` em `handleSwitchHouse`.
   - Passar `authUser` para `HouseSelectionView`.
   - Otimizar `AnimatePresence` removendo `mode="wait"` e aplicar debounce de 300ms no `triggerDebouncedSync`.
2. [x] **Ajuste em `index.html` & `index.css`:**
   - Tornar stylesheets de fontes não-bloqueantes com `media="print" onload="this.media='all'"`.
   - Proteger ligaduras de ícones com contenção de tamanho (`max-width: 1.5em; overflow: hidden`) e `text-size-adjust: 100%`.
   - Otimizar skeleton nativo.
3. [x] **Ajuste em `sw.js`:**
   - Implementar cache com fallback resiliente para shell da aplicação.
4. [x] **Criação da Suíte de Testes de Navegador:**
   - Suíte `backend/tests/browser/browser.test.ts` implementada e cobrindo os 5 fluxos fundamentais com 100% de aprovação via Chromium Headless.
5. [x] **Validação & Build:**
   - Executar typecheck e build de produção com `rtk`.
6. [x] **Sincronização de Docs:**
   - Atualizar `docs/pages/dashboard.md` e `docs/pages/settings.md`.

---

## 6. Validação e Testes
- [x] `rtk npm --prefix backend run test:unit` (69/69 aprovados)
- [x] `rtk npm --prefix backend run test:e2e` (8/8 aprovados)
- [x] `rtk npm --prefix backend run test:browser` (5/5 aprovados)
- [x] `rtk npm --prefix frontend run typecheck` (0 erros)
- [x] `rtk npm --prefix backend run typecheck` (0 erros)
- [x] `rtk npm --prefix frontend run build` (build gerado com sucesso)

---

## 7. Sincronização com /docs
- [x] `[[docs/pages/dashboard.md]]`
- [x] `[[docs/pages/settings.md]]`
- [x] `[[docs/tasks/2026-09-17-estabilizacao-mobile-pwa-troca-casa-e-layout.md]]`
