# Módulo: Cardápio da Casa & Planejamento de Refeições

## 1. Visão Geral
O Módulo de **Cardápio da Casa** centraliza o planejamento alimentar semanal dos moradores da residência, organizando refeições, ingredientes, observações de preparo, restrições dietéticas e faixas de horários dos turnos. O módulo atua como um **quadro informativo compartilhado**, sem vínculo com tarefas ou escalas obrigatórias de pessoas.

---

## 2. Refeições, Turnos e Horários Customizáveis
O cardápio opera em ciclo semanal contínuo de 7 dias (Segunda a Domingo) dividido em 4 refeições diárias com horários personalizáveis por residência:
- **Café da Manhã (`breakfast`):** Padrão `06:00` às `10:00` (customizável).
- **Almoço (`lunch`):** Padrão `11:30` às `14:30` (customizável).
- **Lanche / Sobremesa (`snack`):** Padrão `15:30` às `18:00` (customizável).
- **Jantar (`dinner`):** Padrão `19:00` às `22:30` (customizável).

### 2.1 Ajuste de Horários
- O Administrador Geral e os Sub-Administradores (quando destrancado) podem ajustar os horários de início e término de cada refeição de duas formas:
  1. Através do botão global **"Ajustar Horários"** (`schedule` icon) no cabeçalho do módulo.
  2. Clicando **diretamente sobre a faixa de horário** exibida em qualquer card de refeição (`MealCard`).
- Os horários configurados persistem no `localStorage` por residência e refletem em tempo real em todos os cards, modais e visões do cardápio.
- Ao abrir qualquer modal de edição ou confirmação, a rolagem de fundo é automaticamente travada (`useBodyScrollLock`), garantindo foco e prevenindo deslocamentos acidentais.

---

## 3. Matriz de Permissões & Trava Global (Lock Mode)

| Ação / Operação | Admin Geral | Sub-Admin (Destrancado) | Sub-Admin (Trancado 🔒) | Residente / Convidado |
| :--- | :---: | :---: | :---: | :---: |
| **Visualizar Cardápio & Horários** | Sim | Sim | Sim | Sim |
| **Adicionar / Editar / Excluir Pratos** | Sim | Sim | Bloqueado ❌ | Bloqueado (Somente Leitura) |
| **Ajustar Horários dos Turnos** | Sim | Sim | Bloqueado ❌ | Bloqueado ❌ |
| **Limpar Cardápio da Semana** | Sim | Sim | Bloqueado ❌ | Bloqueado ❌ |
| **Trancar / Destrancar Global 🔒** | **Exclusivo** | Sem permissão ❌ | Sem permissão ❌ | Sem permissão ❌ |

### 3.1 Regras de Operação da Trava Global
- **Destrancado (Padrão):**
  - O Admin Geral e os Sub-Admins podem adicionar, editar e excluir pratos, bem como redefinir os horários dos turnos.
  - Indicador neutro com botão para trancar.
- **Trancado (🔒 Ativado pelo Admin Geral):**
  - Banner institucional: `🔒 Cardápio trancado pelo Administrador Geral`.
  - Sub-Admins e Residentes têm todas as ações de escrita bloqueadas.
  - O Admin Geral é o único que mantém permissão irrestrita de edição e botão para destrancar.

---

## 4. Diretrizes de Interface e Usabilidade

### 4.1 Seleção Automática do Dia Atual
- Ao abrir a tela do Cardápio da Casa, o sistema identifica automaticamente o dia da semana atual (`new Date().getDay()`) e inicia com ele selecionado, exibindo um badge discreto `Hoje` no dia correspondente.

### 4.2 Mobile (< 640px)
- Seletor horizontal com rolagem suave contendo os 7 dias da semana e contagem de pratos planejados.
- Navegação vertical focada no dia ativo com 4 cards de turno.
- Áreas de toque confortáveis (mínimo 44px) e respeito total a Safe Areas (`env(safe-area-inset-*)`).

### 4.3 Desktop (>= 1024px)
- **Alternador de Visualização (View Switcher):**
  - **Modo Diário:** Foco nos 4 turnos do dia selecionado, com detalhes de ingredientes e tags.
  - **Modo Semanal (Kanban 7 Dias):** Visão panorâmica dos 7 dias e 4 refeições lado a lado, facilitando planejamento conjunto e lista de compras.

### 4.4 Ergonomia do Card de Refeição (`MealCard`)
- **Estado Vazio (Sem Prato Cadastrado):** Exibe exclusivamente uma ação central clara (`+ Adicionar`), eliminando botões `+` duplicados no cabeçalho do card.
- **Estado Preenchido:** Exibe o botão de edição (`edit`) no canto superior direito do card.
- **Ação de Horário no Card:** O horário do turno possui feedback hover e dispara diretamente o modal de ajuste de turnos para usuários com permissão de edição.

### 4.5 Bloqueio Contextual de Turno no Cadastro/Edição (`EditMealModal`)
- Ao acionar `+ Adicionar` ou `Editar` a partir de um card de refeição específico, o campo de turno no modal permanece rigidamente travado em modo somente leitura (`lockPeriod: true`), exibindo um badge visual com o ícone, nome do turno e faixa de horário correspondente (ex: *Café da Manhã (06:00 - 10:00)*).
- Evita alterações acidentais de turno e elimina poluição visual de dropdown quando o contexto já foi fixado pelo card clicado.
- Caso o modal seja acionado por um gatilho global genérico sem turno pré-determinado (`lockPeriod: false`), o seletor `<select>` permanece desbloqueado para escolha livre.
