# Módulo: Cardápio da Casa & Planejamento de Refeições

## 1. Visão Geral
O Módulo de **Cardápio da Casa** centraliza o planejamento alimentar semanal dos moradores da residência, organizando refeições, ingredientes, restrições dietéticas e cozinheiros responsáveis.

---

## 2. Refeições e Periodicidade
O cardápio opera em ciclo semanal contínuo de 7 dias (Segunda a Domingo) dividido em 4 refeições diárias:
- **Café da Manhã (`breakfast`):** 06:00 às 10:00
- **Almoço (`lunch`):** 11:30 às 14:30
- **Lanche / Sobremesa (`snack`):** 15:30 às 18:00
- **Jantar (`dinner`):** 19:00 às 22:30

---

## 3. Matriz de Permissões & Trava Global (Lock Mode)

| Papel / Perfil | Visualizar Cardápio | Editar Refeições (Destrancado) | Editar Refeições (Trancado 🔒) | Trancar / Destrancar 🔒 |
| :--- | :---: | :---: | :---: | :---: |
| **Admin Geral** | Sim | Sim | Sim | **Exclusivo** |
| **Sub-Admin (Admin)** | Sim | Sim | Bloqueado (403 / Oculto) | Sem permissão |
| **Residente / Convidado** | Sim | Somente Leitura | Somente Leitura | Sem permissão |

### 3.1 Regras de Operação da Trava Global
- **Destrancado (Padrão):**
  - O Admin Geral e os Sub-Admins podem adicionar, editar e excluir pratos.
  - Indicador neutro com ícone `lock_open`.
- **Trancado (🔒 Ativado pelo Admin Geral):**
  - Acionado exclusivamente pelo Admin Geral após consolidação das compras ou alinhamento com a casa.
  - Banner institucional proeminente: `🔒 Cardápio trancado pelo Administrador Geral`.
  - Sub-Admins têm as ações de escrita desabilitadas/ocultas com tooltip explicativo.
  - O Admin Geral é o único que mantém permissão irrestrita de edição e botão para destrancar.

---

## 4. Diretrizes de Interface e Responsividade

### 4.1 Mobile (< 640px)
- Seletor horizontal com rolagem suave contendo os 7 dias da semana.
- Navegação vertical focada no dia ativo com 4 cards expansíveis.
- Áreas de toque confortáveis (mínimo 44px) e respeito total a Safe Areas (`env(safe-area-inset-*)`).

### 4.2 Tablet (640px - 1023px)
- Grade em 2 colunas com navegação rápida de dias no topo.
- Badges claros de tags dietéticas (`🌱 Vegetariano`, `🥛 Sem Lactose`, `🌾 Sem Glúten`).

### 4.3 Desktop (>= 1024px)
- Alternador de visualização (View Switcher):
  - **Modo Diário:** Foco nos pratos do dia, detalhes de preparo e foto/avatar do cozinheiro.
  - **Modo Semanal (Kanban 7 Dias):** Visão panorâmica dos 7 dias e 4 refeições lado a lado, facilitando planejamento conjunto e lista de compras.
