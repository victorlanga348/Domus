# Task: Correção de Tela em Branco ao Criar ou Entrar em Residência
**Data:** 2026-09-02  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/components/sidebar-header.md]]`, `[[docs/pages/auth-onboarding.md]]`

---

## 1. Contexto & Causa-Raiz

Ao criar uma nova casa ou entrar em uma residência existente no celular, a aplicação apresentava uma tela completamente branca.
A análise técnica profunda identificou a causa-raiz exata:
1. **Violação da Regra dos Hooks do React (Hooks após Early Return):**
   - No arquivo `frontend/src/App.tsx`, a chamada `const activeMembersForSidebar = useMemo(...)` foi declarada na linha 815, **após** os retornos antecipados:
     - Linha 781: `if (!authUser) return <AuthView ... />;`
     - Linha 796: `if (!currentHouse) return <HouseSelectionView ... />;`
   - Enquanto o usuário estava no seletor de casas (`!currentHouse` verdadeiro), o componente finalizava a renderização no retorno da linha 796 sem executar o `useMemo`.
   - No instante em que o usuário criava ou ingressava em uma casa (`onHouseSelected`), `currentHouse` tornava-se verdadeiro, permitindo que a execução ultrapassasse a linha 812 e executasse o `useMemo`.
   - O motor do React detectou a variação do número de hooks entre renders consecutivos e disparou a exceção fatal:
     `Rendered more hooks than during the previous render`.
   - Como não havia um `ErrorBoundary` envolvendo a aplicação raiz, a exceção desmontou todo o DOM do React, resultando na temida tela em branco.
2. **Prop `token` Omitida em `HouseSelectionView`:**
   - O estado `authToken` não estava sendo repassado para `<HouseSelectionView token={authToken || undefined} ... />`.

---

## 2. Solução Proposta

1. **Reordenação Obrigatória dos Hooks em `App.tsx`:**
   - Mover `const activeMembersForSidebar = useMemo(...)` para o topo de `App.tsx`, junto aos demais hooks e antes de qualquer retorno condicional (`if (!authUser)` ou `if (!currentHouse)`).
   - Com isso, o número e a ordem dos hooks permanecem 100% consistentes em qualquer fluxo de navegação e autenticação.
2. **Passagem de Token para o Seletor de Casas:**
   - Passar `token={authToken || undefined}` na renderização de `<HouseSelectionView />`.
3. **Criação de ErrorBoundary Global (`src/components/ErrorBoundary.tsx`):**
   - Implementar componente de proteção contra falhas inesperadas de renderização, com visual amigável no padrão DOMUS e botão de restauração/recarregamento.
   - Envolver `<App />` no `main.tsx`.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - Resolução definitiva da tela em branco: transição instantânea de `HouseSelectionView` para a aplicação principal (`App`) após criar ou entrar em residências.
  - Conformidade estrita com as Regras dos Hooks do React (*Rules of Hooks*).
  - Resiliência global com `ErrorBoundary`, evitando telas brancas em qualquer falha de tempo de execução.
- **Desvantagens / Riscos:**
  - Nenhuma; reordenação pura de hooks e adição de barreira de erro.

---

## 4. Critérios de Aceitação

- [x] `useMemo` posicionado no topo de `App.tsx` antes de qualquer `if (...) return`.
- [x] Usuário consegue criar ou entrar em uma residência no celular sem ocorrência de tela em branco.
- [x] Transição imediata para o Dashboard da casa criada ou selecionada.
- [x] `ErrorBoundary` protege a raiz da aplicação.
- [x] `rtk npm run typecheck` e `rtk npm run build` passando com código 0.

---

## 5. Plano de Implementação (Passo a Passo)

1. [x] **Frontend - App.tsx:**
   - Mover `activeMembersForSidebar = useMemo(...)` para antes das funções auxiliares e dos early returns de autenticação e residência.
   - Passar `token={authToken || undefined}` para `<HouseSelectionView />`.
2. [x] **Frontend - Error Boundary:**
   - Criar `frontend/src/components/ErrorBoundary.tsx`.
   - Envolver `<App />` no `frontend/src/main.tsx`.
3. [x] **Validação Técnica e Testes:**
   - Executar typecheck e build com `rtk`.
4. [x] **Sincronização & Commit:**
   - Atualizar status para "Concluída" e realizar commit em português.

---

## 6. Validação e Testes

- [x] `rtk npm run typecheck` (frontend): Código 0.
- [x] `rtk npm run build` (frontend): Código 0.
