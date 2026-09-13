# Task: Ajuste de Layout, Scroll e Validação do Modal de Checklist no Mural
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/dashboard.md]]`, `[[docs/design/responsive.md]]`

---

## 1. Contexto & Problema
1. **Modal Estourando a Tela (Overflow sem Scroll):**
   - O modal de novo recado não possuía `max-h-[90vh]` nem `flex flex-col` com área rolável interna.
   - Ao alternar para o modo Checklist, a quantidade de campos (tipo, título, observação, input de novo item, lista de itens, autor, paleta de cores) fez o modal ultrapassar a altura da viewport em telas de celulares e notebooks, empurrando o botão "Fixar Recado" para fora da tela.
   - O scroll existia apenas na listinha interna de itens, e não no modal como um todo.
2. **Erro de "Não pode estar vazia" ao Submeter:**
   - Se o morador digitasse o nome de um item no campo de texto e clicasse direto em "Fixar Recado" (sem clicar antes no botão "Inserir" ou dar Enter), o item pendente era descartado e a lista enviada vazia para o backend.
   - O backend rejeitava com a mensagem de erro: `"Conteúdo ou itens do recado não podem estar vazios."`.
   - Não havia validação preventiva no frontend com feedback claro caso o morador tentasse salvar uma lista com 0 itens.

---

## 2. Solução Proposta
1. **Layout Responsivo e Scroll Inteligente no Modal (`DashboardView.tsx`):**
   - Aplicar `max-h-[90dvh]` com estrutura flexbox (`flex flex-col`):
     - Cabeçalho fixo no topo (`shrink-0`).
     - Rodapé com botões "Cancelar" e "Fixar Recado" fixo na base (`shrink-0`).
     - Corpo do formulário com scroll suave (`overflow-y-auto scrollbar-thin flex-1 min-h-0`).
   - Isso garante que os botões de ação permaneçam sempre visíveis e acessíveis em qualquer resolução (mobile, tablet e desktop), com scroll aparecendo naturalmente quando o conteúdo crescer.
2. **Auto-Inclusão de Item Pendente & Validação Amigável:**
   - Ao clicar em "Fixar Recado", se houver texto digitado no campo de novo item (`newItemText.trim()`), incluí-lo automaticamente na lista antes de enviar.
   - Se a lista continuar vazia (`items.length === 0`), interceptar no frontend e exibir toast claro: `"Adicione pelo menos um item à sua lista antes de fixar."`, focando automaticamente no campo de digitação sem disparar erro no backend.
   - Compactar os espaçamentos internos para deixar o formulário mais enxuto e ágil.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Experiência mobile e desktop perfeita: modal nunca mais transborda a tela.
  - O botão de confirmação fica sempre acessível ao alcance do polegar.
  - Elimina o erro frustrante de lista vazia quando o morador digita o item e clica direto em salvar.
  - Previne requisições inválidas de listas vazias ao servidor.
- **Desvantagens / Riscos:**
  - Nenhuma. Melhoria de usabilidade e contenção de layout pura.

---

## 4. Critérios de Aceitação
- [x] O modal de recado respeita o limite de altura da tela (`max-h-[90dvh]`), com rodapé e cabeçalho fixos e corpo rolável.
- [x] Ao digitar um item no campo de texto e clicar direto em "Fixar Recado", o item é inserido e a lista é criada com sucesso.
- [x] Se o morador tentar salvar uma lista sem nenhum item digitado, recebe aviso amigável: `"Adicione pelo menos um item à sua lista antes de fixar."`.
- [x] A inserção de itens com tecla Enter continua funcionando de forma fluida.
- [x] Typechecks e testes unitários passam com 0 erros via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Frontend (`DashboardView.tsx`):**
   - Ajustar a estrutura do modal para `max-h-[90dvh] flex flex-col`, separando cabeçalho (`shrink-0`), corpo rolável (`flex-1 overflow-y-auto`) e rodapé de ações fixo (`shrink-0`).
   - No `handleCreateNoteSubmit`:
     - Se `noteType === 'checklist'`: capturar `newItemText.trim()`, adicioná-lo à lista caso exista.
     - Se a lista final continuar vazia, disparar `onShowToast?.('Adicione pelo menos um item à sua lista antes de fixar.')` e impedir submissão.
   - Adicionar `ref` ao input para focar após inserção.
2. **Validação & Testes:**
   - Executar `rtk npm run typecheck` no frontend e backend.
   - Executar `rtk npm run test:unit` no backend.
   - Testar build de produção (`rtk npm run build`).
3. **Governança & Commit:**
   - Atualizar documentação e realizar commit em português.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` (Frontend)
- [x] `rtk npm run typecheck` (Backend)
- [x] `rtk npm run test:unit` (Backend)
- [x] `rtk npm run build` (Frontend)

---

## 7. Sincronização com /docs
- [x] Documento `docs/tasks/2026-09-13-ajuste-modal-checklist-scroll-e-validacao.md` criado
- [x] Matriz de governança verificada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
