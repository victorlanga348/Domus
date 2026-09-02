# Task: Animação e Estilo Cut-out com Inverted Border-Radius na Sidebar
**Data:** 2026-09-02  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/components/sidebar-header.md]]`, `[[docs/design/tokens.md]]`, `[[docs/design/responsive.md]]`

---

## 1. Contexto & Problema

### 1.1 Desconexão Visual entre Sidebar e Canvas Principal
Atualmente, no layout desktop do DOMUS:
- O container principal `<main>` possuía classes como `md:rounded-tl-[40px]`, `border-l border-[#e4f0ee]` e `shadow-2xl`, o que criava um espaçamento, borda cinza e sombra destacando o painel em relação à sidebar.
- Os botões de navegação da `Sidebar.tsx` tentavam aplicar pseudo-elementos pontuais (`after:shadow-[...]` / `before:shadow-[...]`), porém sem continuidade geométrica nem conexão contínua com o fundo `#f0fcfa` da área principal.
- Como consequência, o item ativo parecia apenas uma pílula isolada (como visto na foto 2 enviada pelo usuário), e não a sensação da foto 1, onde a área do dashboard parece "surgir" diretamente do item ativo e se expandir organicamente.

### 1.2 Ausência de Transição Suave (Sliding Indicator)
- Ao trocar de aba, o estado visual era recriado instantaneamente em outro item, sem animação contínua de transição vertical (`translateY`), gerando quebra visual.

---

## 2. Solução Proposta

### 2.1 Indicador Deslizante Único (Single Animated Indicator)
- Implementado na `<nav>` da Sidebar um indicador flutuante com posição absoluta:
  - Fundo `#f0fcfa` (idêntico ao fundo do canvas principal `main`).
  - Lado esquerdo arredondado em pílula (`rounded-l-full`).
  - Lado direito alinhado a `right: 0`, conectando perfeitamente e sem emendas ao dashboard.
  - Animação vertical suave via `transform: translateY(...)` com transição de `0.35s` e timing `cubic-bezier(0.4, 0, 0.2, 1)`.

### 2.2 Curvatura Invertida (Inverted Border-Radius / Cut-out)
- Integrados ao indicador os cantos curvos côncavos superior e inferior direitos:
  - **Canto Superior Direito (`.sidebar-curve-top`):** Curvatura invertida suave de `20px` conectando a lateral da sidebar escura (`#16302e`) ao topo do indicador claro (`#f0fcfa`).
  - **Canto Inferior Direito (`.sidebar-curve-bottom`):** Curvatura invertida suave de `20px` conectando a base do indicador claro à continuação da sidebar escura.
  - Implementado com `box-shadow` negativo calibrado para `#f0fcfa` em `.sidebar-curve-top` e `.sidebar-curve-bottom` (`index.css`), garantindo nitidez sem subpixel gap.

### 2.3 Integração Seamless com o `<main>`
- Removida a borda divisória esquerda (`border-l`), a sombra de sobreposição (`shadow-2xl`) e o raio de borda superior esquerdo (`rounded-tl-[40px]`) de `<main>` no `App.tsx`, unificando o fundo `#f0fcfa`.

### 2.4 Transição de Cor e Tipografia dos Itens
- Os textos e ícones dos itens de navegação ficam posicionados em camada superior (`z-10`).
- Ao se tornar ativo, o texto e ícone do item transicionam suavemente para a cor ativa escura (`#16302e` / ícone `#7b5800`).
- Os itens inativos mantêm a tonalidade suave (`#98b3b0`) com hover interativo sutil e suporte a pré-visualização fluida ao passar o cursor.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Fidelidade Visual Total:** Reproduz com precisão cirúrgica o padrão de referência da foto 1, onde todo o conteúdo do dashboard parece brotar da aba selecionada.
  - **Alta Fluidez de UX:** Transição física suave de posição via GPU (`transform: translateY`), sem saltos visuais ou repaints pesados.
  - **Robustez Responsiva:** O comportamento do desktop fica refinado e o drawer mobile mantém sua navegação tátil nativa intacta.
- **Desvantagens / Riscos:**
  - Necessidade de medição em tempo de execução via `offsetTop` — mitigada com sincronização via `useLayoutEffect` e listener de redimensionamento de janela.

---

## 4. Critérios de Aceitação
- [x] O item selecionado na sidebar desktop conecta perfeitamente ao fundo do dashboard (`#f0fcfa`), sem linhas divisórias ou sombras separadoras.
- [x] Cantos invertidos (côncavos) visíveis e nítidos nas extremidades superior direita e inferior direita do item ativo.
- [x] Ao clicar em uma nova aba, o indicador de fundo branco desliza verticalmente de forma suave até a nova posição (`0.35s`, `cubic-bezier(0.4, 0, 0.2, 1)`).
- [x] O texto e ícone do item ativo mudam de cor suavemente para o tom destacado, enquanto os inativos mantêm o contraste original da sidebar escura.
- [x] A navegação no mobile (drawer lateral) continua funcionando perfeitamente sem quebras.
- [x] Build e typecheck sem erros (`rtk npm run typecheck:frontend` e `rtk npm run build`).

---

## 5. Plano de Implementação (Passo a Passo)
1. **Ajuste do Layout Principal (`frontend/src/App.tsx`):** Concluído.
2. **Refatoração da Navegação Desktop (`frontend/src/layouts/Sidebar.tsx` e `frontend/src/index.css`):** Concluído.
3. **Validação Técnica e Testes:** Concluído (TypeScript + Vite build ok).
4. **Sincronização de Docs:** Concluído (`docs/components/sidebar-header.md`).

---

## 6. Validação e Testes
- [x] Typecheck sem erros (`rtk npm --prefix frontend run typecheck` e `rtk npm --prefix backend run typecheck`)
- [x] Build de produção sem erros (`rtk npm --prefix frontend run build`)
- [x] Validação visual da animação e curvatura

---

## 7. Sincronização com /docs
- [x] `docs/components/sidebar-header.md` atualizado
- [x] Matriz de impacto validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
