# Task: Cardápio Informativo, Horários Customizáveis & Permissões Restritas
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/meals-menu.md]]`

---

## 1. Contexto & Problema
A gestão de refeições da residência possui duas necessidades essenciais:
1. **Refeição como Informação Pura (Sem Tarefa/Responsáveis):**
   - As refeições devem ser apenas informativas (prato, ingredientes, observações, tags dietéticas, dia e turno), sem atribuição de cozinheiro(s) responsável(is) nem escala direcionada.
2. **Horários Personalizáveis por Residência:**
   - Cada casa possui sua própria rotina de horários para *Café da Manhã*, *Almoço*, *Lanche* e *Jantar*. O aplicativo deve permitir editar os horários de início e término de cada refeição.
3. **Hierarquia e Permissões Rígidas de Escrita:**
   - **Admin Geral:** Acesso total (adicionar, editar, excluir refeições, alterar horários dos turnos, trancar/destrancar o cardápio mesmo em modo bloqueado).
   - **Sub-Admin (Admin):** Pode adicionar, editar, excluir refeições e alterar os horários dos turnos **somente quando o cardápio estiver destrancado**. Quando trancado, tem permissão de escrita bloqueada.
   - **Residente / Outros:** **Apenas visualização** (somente leitura). Nunca podem criar, editar, apagar pratos nem alterar horários.

---

## 2. Solução Proposta

### 2.1 Contrato de Dados Atualizado (`types.ts` & `features/meals/types.ts`)
```ts
export interface MealPeriodSchedule {
  startTime: string; // Ex: "07:00"
  endTime: string;   // Ex: "09:30"
}

export interface MealItem {
  id: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  title: string;
  description?: string;
  tags?: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface HouseMealPlan {
  houseId: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedByName?: string;
  lockedAt?: string;
  meals: MealItem[];
  schedules?: Record<MealType, MealPeriodSchedule>;
}
```

### 2.2 Horários Padrão e Dinâmicos (`features/meals/types.ts`)
```ts
export const DEFAULT_MEAL_SCHEDULES: Record<MealType, MealPeriodSchedule> = {
  breakfast: { startTime: '06:00', endTime: '10:00' },
  lunch: { startTime: '11:30', endTime: '14:30' },
  snack: { startTime: '15:30', endTime: '18:00' },
  dinner: { startTime: '19:00', endTime: '22:30' },
};
```
- Criar a função `getMealPeriods(schedules)` para resolver dinamicamente os rótulos, faixas de horários (`timeRange`), ícones e cores para todos os componentes.

### 2.3 Modal de Edição de Horários (`EditMealSchedulesModal.tsx`)
- Modal intuitivo com formulário para os 4 turnos (Café da Manhã, Almoço, Lanche, Jantar) com inputs de tempo (`HH:mm`).
- Botão "Restaurar Padrões".
- Acessível via botão **"Ajustar Horários"** (`schedule` icon) no cabeçalho do Cardápio, visível para Admin Geral e Sub-Admin (quando destrancado).

### 2.4 Remoção do Conceito de Chef / Tarefas
- `EditMealModal.tsx`: Foco direto no prato, descrição e tags (sem seletor de cozinheiros).
- `MealCard.tsx`: Exibição limpa do prato, descrição, badges e do horário atualizado do turno.
- `MealsView.tsx`: Remoção do botão de gerar escala.

### 2.5 Matriz de Permissões
| Ação | Admin Geral | Sub-Admin (Destrancado) | Sub-Admin (Trancado 🔒) | Residente / Convidado |
| :--- | :---: | :---: | :---: | :---: |
| **Visualizar Cardápio & Horários** | Sim | Sim | Sim | Sim |
| **Adicionar / Editar / Excluir Pratos** | Sim | Sim | Bloqueado ❌ | Bloqueado ❌ |
| **Alterar Horários dos Turnos** | Sim | Sim | Bloqueado ❌ | Bloqueado ❌ |
| **Limpar Cardápio** | Sim | Sim | Bloqueado ❌ | Bloqueado ❌ |
| **Trancar / Destrancar Global** | **Exclusivo** | Bloqueado ❌ | Bloqueado ❌ | Bloqueado ❌ |

---

## 3. Análise de Trade-offs

### Vantagens
- **Flexibilidade total para a casa:** Cada república/família ajusta os horários de acordo com sua rotina de aulas/trabalho.
- **Governança e Segurança Rígidas:** Proteção total contra edições não autorizadas de moradores ou em cardápio consolidado/trancado.
- **Interface Focada:** Sem mistura indevida de atribuição de tarefas com cardápio gastronômico.

### Desvantagens / Riscos
- Nenhuma desvantagem técnica identificada.

---

## 4. Critérios de Aceitação
- [x] `MealItem` focado puramente no prato, descrição, tags dietéticas, dia e turno
- [x] Horários de Café da Manhã, Almoço, Lanche e Jantar editáveis por Admin Geral e Sub-Admin
- [x] Horários personalizados refletem em tempo real no `MealCard`, `EditMealModal` e Kanban semanal
- [x] Sub-Admins e Moradores comuns impedidos de alterar horários ou pratos quando o cardápio estiver trancado
- [x] Moradores comuns sempre em modo Somente Leitura
- [x] Seleção automática do dia atual da semana ao entrar na tela do cardápio
- [x] Persistência dos horários no `localStorage` sob a chave da residência
- [x] `rtk npx tsc --noEmit` ✅
- [x] `rtk npx vite build` ✅
- [x] Testes backend 35/35 ✅

---

## 5. Plano de Implementação (Passo a Passo)

1. **`frontend/src/types.ts`:**
   - Adicionar `MealPeriodSchedule` e `HouseMealPlan.schedules`.
   - Limpar `MealItem` (remover campos de chefs).
2. **`frontend/src/features/meals/types.ts`:**
   - Adicionar `DEFAULT_MEAL_SCHEDULES` e helper `getMealPeriods(schedules)`.
   - Atualizar `MealsViewProps` com `onUpdateSchedules`.
3. **`frontend/src/features/meals/components/EditMealSchedulesModal.tsx`:**
   - Criar modal para configuração dos horários de início e fim dos 4 turnos.
4. **`frontend/src/features/meals/components/EditMealModal.tsx`:**
   - Remover seleção de chefs e usar `getMealPeriods(schedules)` para exibir os horários corretos no select de turnos.
5. **`frontend/src/features/meals/components/MealCard.tsx`:**
   - Remover rodapé de chefs e exibir o `timeRange` atualizado do período.
6. **`frontend/src/features/meals/components/MealsView.tsx`:**
   - Adicionar botão "Ajustar Horários" no cabeçalho.
   - Renderizar `EditMealSchedulesModal`.
   - Remover referências a escala de cozinheiros.
7. **`frontend/src/features/meals/index.ts`:**
   - Exportar `EditMealSchedulesModal`.
8. **`frontend/src/App.tsx`:**
   - Adicionar handler `handleUpdateMealSchedules` para persistir e sincronizar os horários.
   - Limpar handlers residuais de escala.
9. **Sincronização com `/docs`:**
   - Atualizar `docs/product/meals-menu.md`.
   - Marcar task como Concluída.
