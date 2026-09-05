# Task: Correção do Indicador Deslizante da Sidebar (Hover para Click & Alinhamento Vertical)
**Data:** 2026-09-02  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/components/sidebar-header.md]]`

---

## 1. Contexto & Problema

O indicador deslizante da barra lateral desktop (`Sidebar.tsx`) apresenta três falhas visuais e de interação críticas:
1. **Gatilho Incorreto (`hover` vs `click`):** O efeito estava atrelado a `hoveredTab` via `onMouseEnter`/`onMouseLeave`, fazendo com que o indicador pulasse e as cores dos botões alternassem apenas passando o cursor perto, sem que houvesse clique ou navegação real.
2. **Desalinhamento Vertical (`translateY`):** O elemento indicador (`.sidebar-curve-top`/`.sidebar-curve-bottom`) não possuía a âncora `top-0` (ou `top: 0`), herdando a posição estática centrada pelo flex container (`justify-center`). Ao aplicar `transform: translateY(${targetEl.offsetTop}px)`, o deslocamento somava o centro do container com o offset do item, projetando o indicador muito abaixo do item clicado (indo parar próximo a Configurações/Membros).
3. **Efeito de "Ícone Órfão":** A cor do ícone e do texto mudava no evento de hover antes do clique, gerando desacoplamento visual onde o ícone escurecia flutuando fora do bloco de fundo correspondente.

---

## 2. Solução Proposta

1. **Remoção de Interações de Hover no Indicador:**
   - Eliminar o estado `hoveredTab`, `setHoveredTab` e a variável intermediária `activeTabTarget` em `Sidebar.tsx`.
   - Remover os manipuladores `onMouseEnter` e `onMouseLeave` da navegação.
   - O indicador responderá exclusivamente à prop `currentTab`, reagindo somente ao clique (`onTabChange`) ou alternância programática de aba.
2. **Correção do Alinhamento Vertical:**
   - Adicionar a classe `top-0` ao container do indicador deslizante absoluto, fixando seu ponto de origem vertical no topo de `<nav>`.
   - O deslocamento `translateY` calculado a partir de `targetEl.offsetTop` partirá rigorosamente de 0px até o topo relativo do botão correspondente, coincidindo altura (`offsetHeight`) e posição com precisão cirúrgica de pixels.
3. **Fixação da Classe Ativa e Cores Sincronizadas:**
   - Adicionar explicitamente a classe CSS `.active` no botão cujo `item.id === currentTab`.
   - A cor do texto (`text-[#16302e]`) e ícone preenchido dourado (`text-[#7b5800] filled`) serão ativados estrita e exclusivamente quando `item.id === currentTab`.
   - Efeitos de hover nos botões não selecionados serão restritos a uma transição sutil de opacidade/cor (`hover:text-white`, `group-hover:text-[#ffca5e]`), sem afetar o fundo ou mover o indicador.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - Estabilidade e previsibilidade total na navegação: zero pulos erráticos ao mover o mouse.
  - Alinhamento pixel-perfect do fundo branco recortado com as curvas de borda invertida (`.sidebar-curve-top` e `.sidebar-curve-bottom`) diretamente sobre a aba selecionada.
  - Eliminação total do efeito de ícone órfão.
- **Desvantagens / Riscos:**
  - Nenhum risco arquitetural ou de regressão. O comportamento móvel permanece desacoplado e funcional via drawer nativo.

---

## 4. Critérios de Aceitação

- [x] O elemento indicador move-se exclusivamente mediante clique (`onClick` / `onTabChange`) ou alteração de `currentTab`.
- [x] Nenhum movimento ou salto de indicador ocorre no `:hover` ou `mouseenter`/`mouseleave`.
- [x] A posição vertical (`translateY`) do indicador coincide perfeitamente com a coordenada e altura do botão ativo (`offsetTop` e `offsetHeight`), sem sobras para cima ou para baixo.
- [x] A classe `.active` permanece fixada no item selecionado.
- [x] O ícone só assume cor ativa (`text-[#7b5800] filled`) e o texto só assume cor escura (`text-[#16302e] font-bold`) no item que possui a classe ativa.
- [x] `rtk npm run typecheck` e `rtk npm run build` no frontend executam com código 0.
- [x] `docs/components/sidebar-header.md` sincronizado.

---

## 5. Plano de Implementação (Passo a Passo)

1. [x] **Documentação & Specs:**
   - Atualizar `docs/components/sidebar-header.md` refletindo o comportamento restrito por clique/ativação e alinhamento vertical estrito.
2. [x] **Sidebar Component (`frontend/src/layouts/Sidebar.tsx`):**
   - Remover `hoveredTab`, `setHoveredTab` e `activeTabTarget`.
   - Adicionar `top-0` no container absoluto do indicador deslizante.
   - Fixar classe `.active` e estilização ativa nos itens baseada unicamente em `currentTab === item.id`.
   - Limpar listeners de hover nos botões e no container `<nav>`.
3. [x] **Validação Técnica:**
   - Executar `rtk npm run typecheck`.
   - Executar `rtk npm run build`.
4. [x] **Finalização e Commit:**
   - Sincronizar task para "Concluída".
   - Executar testes e commit da sprint conforme `AGENTS.md`.

---

## 6. Validação e Testes

- [x] `rtk npm run typecheck` concluído com sucesso.
- [x] `rtk npm run build` concluído com sucesso.
- [x] Teste de clique nas 5 abas da barra lateral validando transição suave e alinhamento.
- [x] Teste de movimentação do cursor sobre os links verificando ausência total de pulos.

---

## 7. Sincronização com /docs

- [x] `docs/components/sidebar-header.md`
- [x] Matriz de impacto validada em `[[docs/documentation-governance.md]]`.
