# Task: Correção de Layout no Modal de Ajustar Horários das Refeições
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/meals-menu.md]]`

---

## 1. Contexto & Problema
No modal "Ajustar Horários das Refeições" (`EditMealSchedulesModal.tsx`), em telas mobile ou estreitas, o campo de horário **"Término" estava vazando e estourando a margem direita dos cards**.

A causa era a ausência de contenção explícita (`overflow-hidden`, `w-full` e `min-w-0`) no card pai e nos contêineres dos inputs de horário, permitindo que a largura intrínseca do elemento nativo `<input type="time">` ultrapassasse a coluna do Grid CSS.

---

## 2. Solução Proposta

1. **Card Pai de Cada Refeição:**
   - Adicionado `w-full overflow-hidden rounded-xl sm:rounded-2xl border border-[#d9e5e3] p-2.5 sm:p-4 box-border` garantindo contenção estrita e aproveitamento otimizado do espaço no mobile.

2. **Grid de Horários (Início e Término):**
   - Estruturado como `grid grid-cols-2 gap-2 sm:gap-3 w-full min-w-0 pt-0.5`.
   - Célula com `w-full min-w-0 max-w-full overflow-hidden box-border`.

3. **Inputs de Horário (`<input type="time">`):**
   - Dimensões e tipografia reduzidas cirurgicamente no celular (`text-[11px] sm:text-sm`, `h-8 sm:h-10`, `px-1 sm:px-3 py-1 sm:py-2`).
   - Escalonamento do ícone de relógio WebKit em telas pequenas (`[&::-webkit-calendar-picker-indicator]:scale-75 sm:[&::-webkit-calendar-picker-indicator]:scale-100`).
   - Classes aplicadas:
     `w-full min-w-0 max-w-full box-border h-8 sm:h-10 px-1 sm:px-3 py-1 sm:py-2 text-center text-[11px] sm:text-sm font-medium sm:font-semibold rounded-lg sm:rounded-xl border border-teal-100 bg-teal-50/40 focus:outline-none focus:ring-2 focus:ring-teal-500 text-[#16302e] [color-scheme:light] [&::-webkit-calendar-picker-indicator]:p-0 [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:scale-75 sm:[&::-webkit-calendar-picker-indicator]:scale-100`

---

## 3. Análise de Trade-offs
- **Vantagens:** Divisão perfeita 50%/50% entre Início e Término em qualquer largura de tela mobile (inclusive 320px), eliminação total de overflow horizontal, leitura nítida.
- **Desvantagens / Riscos:** Nenhuma. Inputs continuam acionando os seletores nativos de relógio/roda do sistema operacional ao toque.

---

## 4. Critérios de Aceitação
- [x] Card de cada refeição com `w-full overflow-hidden` e padding reduzido no mobile
- [x] Grid de 2 colunas com `gap-2` e `min-w-0` evitando estouro lateral
- [x] Inputs compactos no mobile (`h-8`, `px-1`, `text-[11px]`, indicador escalonado a 75%)
- [x] Campo de Término alinhado à direita perfeitamente contido dentro do card
- [x] `rtk npx tsc --noEmit` ✅
- [x] `rtk npx vite build` ✅
- [x] Testes backend 35/35 ✅

---

## 5. Plano de Implementação (Passo a Passo)
1. Ajustar o card pai e os inputs em `frontend/src/features/meals/components/EditMealSchedulesModal.tsx`.
2. Validar compilação (`tsc --noEmit` e `vite build`).
3. Atualizar documentação e registrar conclusão da sprint.
