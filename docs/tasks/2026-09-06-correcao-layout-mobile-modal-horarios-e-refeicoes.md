# Task: Correção de Layout Mobile e Prevenção de Estouro em Modais de Horários e Refeições
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/meals-menu.md]]`

---

## 1. Contexto & Problema
Ao abrir o modal **"Ajustar Horários das Refeições"** (`EditMealSchedulesModal`) em dispositivos móveis (especialmente iOS Safari / Chrome Mobile), foram identificadas duas quebras de layout críticas:
1. **Estouro dos Inputs de Horário:** A coluna da direita ("Término") do grid de horários vaza lateralmente para fora do card e do modal. A causa-raiz é que em CSS Grid o tamanho padrão dos filhos é `min-width: auto`, impedindo a compressão de elementos nativos como `<input type="time">` no iOS WebKit que possuem largura intrínseca expandida (ex: formato 12h com AM/PM).
2. **Corte e Quebra no Rodapé de Ações:** O rodapé de botões ("Cancelar" e "Salvar Horários") estava inserido no final do fluxo rolável sem fixação ou compensação de Safe Area (`env(safe-area-inset-bottom)`), resultando em botões cortados pela base da viewport no iPhone e em telas compactas.

---

## 2. Solução Proposta

1. **Prevenção de Estouro no Grid e Inputs (`EditMealSchedulesModal.tsx`):**
   - Aplicar `min-w-0` em cada coluna do grid de 2 colunas (`Início` e `Término`).
   - Aplicar `w-full min-w-0 max-w-full box-border [color-scheme:light]` no elemento `<input type="time">`, garantindo que o seletor nativo respeite estritamente os limites da coluna em qualquer densidade de tela.
   - Ajustar o espaçamento interno do card para `p-3 sm:p-4` e `gap-2 sm:gap-3`.

2. **Arquitetura de Modal com Rodapé Fixo (Sticky Actions Footer):**
   - Estruturar o modal em 3 camadas flexbox verticais:
     - **Camada 1 (Header):** Fixo no topo (`shrink-0`).
     - **Camada 2 (Corpo):** Rolável com `flex-1 overflow-y-auto overscroll-contain`.
     - **Camada 3 (Footer de Ações):** Fixo na base (`shrink-0 bg-white border-t border-[#e4f0ee]`), garantindo que "Cancelar" e "Salvar Horários" estejam sempre visíveis, acessíveis e com área de toque mínima de 44px (padrão iOS HIG / Android Material 3).
   - Utilizar altura adaptativa `max-h-[88dvh] sm:max-h-[90vh]` para evitar choque com barras dinâmicas do navegador.

3. **Aplicação Preventiva em `EditMealModal.tsx`:**
   - Padronizar o mesmo container vertical com footer fixo e `min-w-0` nos seletores de dia/turno para evitar estouros semelhantes.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Elimina 100% dos estouros laterais em qualquer aparelho móvel (iPhone SE, Pro Max, Android).
  - Garante que os botões de ação nunca fiquem cortados ou escondidos no final da rolagem.
  - Alinhado com as diretrizes da skill `mobile-app-design` (44px touch targets, Safe Area, zero horizontal scroll).
- **Desvantagens / Riscos:**
  - Nenhum risco de quebra de regras de negócio ou APIs. Mudança puramente de arquitetura CSS/UI.

---

## 4. Critérios de Aceitação
- [x] O input de "Término" não ultrapassa a borda direita do card em nenhuma resolução mobile (<=390px, iPhone SE, etc.).
- [x] O rodapé de ações permanece perfeitamente visível na base do modal, sem cortes inferiores.
- [x] O botão "Restaurar horários padrão" permanece acessível dentro da área de conteúdo.
- [x] Safe area inferior respeitada em dispositivos com barra de gestos.
- [x] Responsividade impecável em Desktop, Tablet e Mobile.

---

## 5. Plano de Implementação (Passo a Passo)
1. **`frontend/src/features/meals/components/EditMealSchedulesModal.tsx`:**
   - Reestruturar container com Header fixo (`shrink-0`), Corpo com `overflow-y-auto` e Footer fixo (`shrink-0`).
   - Adicionar `min-w-0` nas colunas do grid e classes responsivas `min-w-0 max-w-full box-border` nos inputs `type="time"`.
2. **`frontend/src/features/meals/components/EditMealModal.tsx`:**
   - Aplicar a mesma arquitetura de rodapé fixo e `min-w-0`.
3. **Validação & Testes:**
   - Executar `rtk npm run typecheck` e `rtk npm run build`.

---

## 6. Validação e Testes
- [x] Typecheck sem erros (`rtk npm run typecheck`)
- [x] Build do frontend executado com sucesso (`rtk npm run build`)
- [x] Teste de backend sem regressões (`rtk npm test`)
- [x] Testes de layout responsivo em mobile e desktop

---

## 7. Sincronização com /docs
- [x] `docs/product/meals-menu.md` atualizado com as diretrizes mobile de modais.
- [x] Matriz de impacto validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
