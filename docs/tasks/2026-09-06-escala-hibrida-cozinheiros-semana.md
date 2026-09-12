# Task: Escala Híbrida de Cozinheiros da Semana
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/meals-menu.md]]`

---

## 1. Contexto & Problema
O módulo de Cardápio da Casa permite atribuir **um único cozinheiro** por refeição (`chefId`, `chefName`, `chefAvatar`). Na prática, a cozinha de uma casa/república funciona com:

- **Seg-Sex:** Rodízio automático entre os moradores (ninguém precisa trocar manualmente).
- **Fim de semana:** Regra diferente — pode ser pessoa fixa, "livre/cada um por si", ou outro esquema.
- **Vários cozinheiros numa mesma refeição** (ex: 2 pessoas cozinham o almoço de quarta).

O sistema precisa suportar **multi-chef** por refeição e um **assistente "Gerar Escala da Semana"** que distribui automaticamente os cozinheiros com base numa configuração de rotação, sem apagar os pratos já cadastrados.

---

## 2. Solução Proposta

### Sprint 1: Multi-Chef no MealItem (refatoração de tipo + UI)
Refatorar `MealItem` de campos singulares para array de cozinheiros e atualizar todos os componentes consumidores.

**Antes (atual):**
```ts
chefId?: string;
chefName?: string;
chefAvatar?: string;
```

**Depois:**
```ts
chefs?: { id: string; name: string; avatar?: string }[];
```

**Ficheiros impactados:**
1. `frontend/src/types.ts` — Alterar interface `MealItem`.
2. `frontend/src/features/meals/components/EditMealModal.tsx` — Trocar dropdown de chef singular por **seleção múltipla** (chips toggle dos membros da casa).
3. `frontend/src/features/meals/components/MealCard.tsx` — Renderizar **grupo de avatares** (avatar stack) em vez de avatar único.
4. `frontend/src/App.tsx` — Migração inline: se `chefId` existir no localStorage antigo, converter para `chefs[]` no carregamento.

### Sprint 2: Configuração de Escala + Wizard "Gerar Escala da Semana"
Criar tipo de configuração e modal wizard.

**Novo tipo `CookingScheduleConfig`:**
```ts
interface ChefAssignment {
  id: string;
  name: string;
  avatar?: string;
}

interface CookingScheduleConfig {
  weekdayPool: MealChef[];           // Moradores que participam do rodízio
  weekdayMeals: MealType[];          // Quais refeições entram no rodízio (ex: ['lunch', 'dinner'])
  weekendMode: 'fixed' | 'free';    // Fixo (pessoa definida) ou Livre (sem cozinheiro)
  weekendChefs?: MealChef[];         // Pessoas fixas do fim de semana (quando weekendMode === 'fixed')
  weekendMeals?: MealType[];         // Refeições do fim de semana
}
```

**Novo componente `GenerateScheduleModal.tsx`:**
- Wizard de 3 passos:
  1. **Pool de Rodízio (Seg-Sex):** Multi-select dos membros da casa que entram na rotação + quais refeições (almoço, jantar, etc.).
  2. **Regra de Fim de Semana:** Toggle entre "Livre" e "Pessoa Fixa" + seletor de pessoa(s).
  3. **Pré-visualização & Confirmação:** Tabela mostrando a distribuição gerada antes de aplicar.
- Botão "Gerar Escala" no header do `MealsView` (ao lado de "Limpar Cardápio"), visível apenas para quem possui permissão de edição.
- A geração **sobrescreve apenas os campos `chefs`** das refeições existentes — **nunca apaga pratos**.
- Se não existir refeição para um slot, cria uma refeição placeholder com título vazio e os chefs atribuídos.

**Algoritmo de Distribuição Round-Robin:**
- Ordenar `weekdayPool` alfabeticamente (determinístico).
- Iterar Seg→Sex × refeições selecionadas, atribuindo ciclicamente.
- Distribuição equilibrada: cada pessoa cozinha aproximadamente o mesmo número de vezes.

**Persistência:**
- `CookingScheduleConfig` salvo em `localStorage` com chave `${houseKey}_cookingSchedule`.

---

## 3. Análise de Trade-offs

### Vantagens
- **Separa pratos de cozinheiros:** Usuário cadastra pratos independentemente; escala preenche quem cozinha.
- **Multi-chef nativo:** Suporta 1 ou N cozinheiros por refeição sem hacks.
- **Determinístico e justo:** Round-robin garante distribuição equilibrada.
- **Sem breaking change no fluxo manual:** Quem preferir atribuir cozinheiros manualmente continua usando o `EditMealModal`.

### Desvantagens / Riscos
- **Migração de dados:** localStorage antigo com `chefId`/`chefName`/`chefAvatar` precisa de migração inline (baixo risco — sanitizer já existe no App.tsx).
- **Complexidade de UI:** Wizard de 3 passos adiciona ~300 linhas ao módulo meals.
- **Sem swap manual no rodízio:** Por design (pedido do user), não há UI para trocar a escala de um dia específico depois de gerada — edita-se manualmente via EditMealModal.

---

## 4. Critérios de Aceitação
- [x] `MealItem.chefs` aceita array de `{ id, name, avatar? }` (campo antigo compatibilizado)
- [x] `EditMealModal` permite selecionar 0 a N cozinheiros via chips toggle
- [x] `MealCard` renderiza avatar stack para múltiplos cozinheiros
- [x] Migração inline converte `chefId`→`chefs[]` no carregamento sem perda de dados
- [x] Botão "Gerar Escala da Semana" visível no cabeçalho do Cardápio
- [x] Wizard de 3 passos: pool → regra fim-de-semana → preview
- [x] Geração sobrescreve apenas `chefs`, nunca apaga `title`/`description`/`tags`
- [x] `CookingScheduleConfig` persiste em localStorage por residência
- [x] Typecheck `tsc --noEmit` ✅
- [x] Build `vite build` ✅
- [x] Testes backend 35/35 ✅
- [x] Responsivo: Mobile, Tablet, Desktop validados

---

## 5. Plano de Implementação (Passo a Passo)

### Sprint 1 — Multi-Chef (Refatoração de Tipo + UI)
1. **`types.ts`** — Substituir `chefId/chefName/chefAvatar` por `chefs?: { id: string; name: string; avatar?: string }[]` no `MealItem`.
2. **`App.tsx`** — Adicionar sanitizer de migração no carregamento do mealPlan (converter formato antigo → novo).
3. **`EditMealModal.tsx`** — Refatorar seletor de chef: chips toggle multi-select dos `familyMembers`.
4. **`MealCard.tsx`** — Refatorar exibição de chef: avatar stack (até 3 avatares + "+N").
5. Validar: `rtk npx tsc --noEmit && rtk npx vite build`.
6. Commit Sprint 1 (`4e232b9`).

### Sprint 2 — Wizard "Gerar Escala da Semana"
1. **`features/meals/types.ts`** — Adicionar `CookingScheduleConfig`.
2. **`GenerateScheduleModal.tsx`** — Criar wizard 3 passos com preview e stats.
3. **`MealsView.tsx`** — Adicionar botão "Gerar Escala" no header + state management do modal.
4. **`App.tsx`** — Adicionar estado `cookingSchedule`, persistência localStorage, handler `handleGenerateSchedule`.
5. Validar: `rtk npx tsc --noEmit && rtk npx vite build`.
6. Commit Sprint 2.

---

## 6. Validação e Testes
- [x] Typecheck / Lint sem erros (`rtk npx tsc --noEmit`)
- [x] Build de produção executado com sucesso (`rtk npx vite build`)
- [x] Teste responsivo Mobile / Tablet / Desktop
- [x] Migração de dados: localStorage com formato antigo carrega sem erros
- [x] Testes backend 35/35 ✅ (`rtk npx tsx --test tests/unit/**/*.test.ts`)

---

## 7. Sincronização com /docs
- [x] `docs/product/meals-menu.md` atualizado com seção "Escala de Cozinheiros" e "Multi-Chef"
- [x] Matriz de impacto validada em [[docs/documentation-governance.md]]

