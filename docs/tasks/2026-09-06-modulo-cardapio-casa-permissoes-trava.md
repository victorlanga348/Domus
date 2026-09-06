# Task: Módulo Cardápio da Casa, Hierarquia de Permissões e Trava Global do Admin Geral
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/product/meals-menu.md]]`
- `[[docs/components/sidebar-header.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
A convivência em uma residência compartilhada ou república exige planejamento alimentar conjunto para reduzir desperdício, sincronizar compras de mercado e organizar quem cozinha cada refeição. Atualmente, o Domus dispõe de gestão de tarefas, finanças, mural e regras, mas carece de um **Módulo de Cardápio da Casa (Menu Semanal)** dedicado.

### Dores Atuais:
1. **Desorganização de Refeições:** Falta de um local centralizado para planejar o cardápio da semana (Café da Manhã, Almoço, Lanche e Jantar).
2. **Conflitos de Edição e Governança:** Qualquer alteração inadvertida pode desestruturar o planejamento do mês ou as compras de mercado. É fundamental uma hierarquia clara com uma **Trava Global de Edição (Lock Mode)** que apenas o **Admin Geral** possa acionar.
3. **Multi-dispositivos (Mobile, Tablet, Desktop):** Os moradores consultam o cardápio no celular na cozinha ou no supermercado, enquanto os administradores costumam planejar a semana inteira no computador ou tablet. A experiência visual precisa ser exemplar em todas as resoluções.

---

## 2. Solução Proposta

### 2.1 Hierarquia de Acesso & Matriz de Permissões

| Papel / Perfil | Visualizar Cardápio | Editar Refeições (Destrancado) | Editar Refeições (Trancado 🔒) | Trancar / Destrancar 🔒 |
| :--- | :---: | :---: | :---: | :---: |
| **Admin Geral** | Sim | Sim | Sim | **Exclusivo** |
| **Sub-Admin (Admin)** | Sim | Sim | Bloqueado (403 / Oculto) | Sem permissão |
| **Residente / Convidado** | Sim | Somente Leitura | Somente Leitura | Sem permissão |

### 2.2 Comportamento da Trava Global (Lock Mode)
1. **Estado Destrancado (Padrão):**
   - Admin Geral e Sub-Admins podem adicionar, editar e remover pratos de qualquer refeição da semana.
   - Moradores comuns possuem experiência de consulta rica (leitura).
2. **Estado Trancado (🔒 Ativado pelo Admin Geral):**
   - Faixa de aviso destacada no cabeçalho: `🔒 Cardápio trancado pelo Administrador Geral`.
   - Botões de adição, edição e exclusão são bloqueados ou desabilitados para Sub-Admins, com aviso explicativo.
   - Apenas o Admin Geral mantém a capacidade de editar itens e o botão de ação rápida para **Destrancar Cardápio**.

---

### 2.3 Estrutura de Dados & Modelo (`types.ts`)
```typescript
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface MealItem {
  id: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  title: string;
  description?: string;
  tags?: string[]; // e.g. "Vegetariano", "Sem Lactose", "Sem Glúten", "Rápido"
  chefName?: string;
  chefAvatar?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface HouseMealPlan {
  houseId: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  meals: MealItem[];
}
```

---

### 2.4 Design Responsivo & Ergonomia Multi-Telas

#### Mobile (< 640px)
- **Seletor Horizontal de Dias:** Carrossel suave com os 7 dias da semana (Segunda a Domingo), destacando o dia selecionado e indicador de refeições cadastradas.
- **Visualização Diária Focada:** Cards limpos e expansíveis para as 4 refeições do dia:
  - 🌅 Café da Manhã
  - ☀️ Almoço
  - 🥪 Lanche / Sobremesa
  - 🌙 Jantar
- **Acessibilidade Touch:** Áreas de clique de no mínimo 44x44px, tipografia legível e respeito às Safe Areas (`env(safe-area-inset-*)`).

#### Tablet (640px a 1023px)
- Layout em grid de 2 colunas para as refeições do dia selecionado.
- Navegação de dias compacta no topo com badges de prato principal.

#### Desktop (>= 1024px)
- **Alternador de Visualização (View Mode):**
  - **Visão Diária:** Foco detalhado no dia com cards expandidos, lista de ingredientes/observações e indicação do cozinheiro/chef da vez.
  - **Visão Semanal Completa (Grade Kanban 7 Dias):** Panorama geral dos 7 dias lado a lado com rolagem horizontal controlada, facilitando o planejamento de compras e a visão global da semana.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Clareza absoluta sobre o que será consumido em cada refeição, evitando desperdício de alimentos.
  - Segurança com a trava do Admin Geral: impede alterações acidentais de outros moradores após fechamento das compras da semana.
  - Interface responsiva de alto padrão visual adaptada ao contexto de uso (celular na cozinha, computador no escritório).
- **Desvantagens / Riscos:**
  - Necessidade de preenchimento contínuo pelos moradores.
  - *Mitigação:* Template com pratos sugeridos prévios e botão de "Limpar Semana" ou "Duplicar para Próxima Semana".

---

## 4. Critérios de Aceitação
- [x] Nova aba **"Cardápio da Casa"** (`meals`) adicionada à Sidebar e ao fluxo de rotas do app.
- [x] Visualização responsiva completa validada em Mobile (< 640px), Tablet (768px) e Desktop (1024px+).
- [x] Alternância entre visualização Diária e Semanal no Desktop.
- [x] Matriz de permissões estritamente respeitada (Admin Geral, Sub-Admin, Residente).
- [x] Trava Global (Lock Mode) controlada exclusivamente pelo Admin Geral.
- [x] Modal de Adicionar / Editar Prato com título, descrição, tags dietéticas e seleção de cozinheiro responsável.
- [x] Sincronização em tempo real via WebSockets (`meal:updated`, `meal:lock_toggled`) e cache local em `localStorage`.
- [x] Build de produção (`rtk npm run build`) e typecheck (`rtk npm run typecheck`) executados com 0 erros.
- [x] Documentação em `/docs` devidamente sincronizada.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Tipos & Contratos (`frontend/src/types.ts`):**
   - Adicionar `TabType = ... | 'meals'`.
   - Adicionar interfaces `MealItem`, `HouseMealPlan`, `MealType`, `DayOfWeek`.
2. **Navegação (`frontend/src/layouts/Sidebar.tsx` & `App.tsx`):**
   - Adicionar item de navegação "Cardápio da Casa" (ícone `restaurant`).
   - Configurar estado de aba e renderização do módulo principal.
3. **Criação do Módulo Cardápio (`frontend/src/features/meals/`):**
   - `MealsView.tsx`: View principal com controles, trava global, seletor de dias e alternador diário/semanal.
   - `MealCard.tsx`: Card de refeição estilizado com badges dietéticos, tags e botões de ação condicionados à permissão.
   - `EditMealModal.tsx`: Modal para adicionar/editar prato com suporte a tags (Vegetariano, Sem Lactose, etc.) e cozinheiro.
4. **Sincronização em Tempo Real (`socketClient.ts`, `useHouseSocket.ts`, `App.tsx`):**
   - Adicionar eventos `emitMealUpdated` e `emitMealLockToggled`.
5. **Validação Técnica:**
   - Testar renderização responsiva nos 3 breakpoints (Mobile, Tablet, Desktop).
   - Validar bloqueio de edição para Sub-Admins com trava ativada e para Residentes.
   - Executar `rtk npm run typecheck` e `rtk npm run build`.
6. **Sincronização de Docs:**
   - Criar `docs/product/meals-menu.md`.
   - Atualizar governança em `/docs/documentation-governance.md`.

---

## 6. Validação e Testes
- [x] Typecheck do frontend (`rtk npm run typecheck`)
- [x] Build do frontend (`rtk npm run build`)
- [x] Validação mobile (< 640px), tablet (768px) e desktop (1200px)
- [x] Validação de permissões: Admin Geral tranca/destranca; Sub-Admin bloqueado quando trancado; Residente somente leitura

---

## 7. Sincronização com /docs
- [x] `docs/tasks/2026-09-06-modulo-cardapio-casa-permissoes-trava.md`
- [x] `docs/product/meals-menu.md`
- [x] `docs/documentation-governance.md`
