# Componentes: Modais & Diálogos (`Modals.tsx`)

## 1. Modais Gerenciados

### 1.1 Modal de Criação de Tarefa (`CreateTaskModal`)
- **Campos:** Título, Descrição, Categoria, Turno (`MORNING`, `AFTERNOON`, `NIGHT`), Seleção de Participantes do Rodízio.
- **Validação:** Exige pelo menos 1 participante e título não vazio.

### 1.2 Modal de Reportar Impedimento (`BlockTaskModal`)
- **Campos:** Texto descritivo do motivo do bloqueio (`reason`).
- **Validação:** Bloqueia envio de justificativa vazia.

### 1.3 Modal de Lançamento de Despesa (`CreateExpenseModal`)
- **Campos:** Descrição, Valor em R$, Categoria, Pagador e Membros incluídos na divisão.

### 1.4 Modal de Verificação de PIN (`PinPromptModal`)
- **Campos:** Teclado numérico virtual ou input de PIN com máscara de pontos.
- **Segurança:** Oculta dígitos digitados e bloqueia múltiplos cliques.

### 1.5 Modal de Transferência de Liderança Única (`LeadershipTransferModal`)
- **Objetivo:** Confirmar a transferência de cargo de `Admin Geral` para outro morador.
- **Estilo Visual:** Design premium institucional com fundo `#16302e`, detalhes em `#ffca5e` (ouro) e ícone de coroa `crown`.
- **Regra de Negócio:** Notifica com clareza que o usuário atual deixará a liderança geral e passará a ser um `Admin Normal` (Administrador auxiliar).

### 1.6 Modal de Convidar Membro (`AddMemberModal`)
- **Campos:** Nome Completo, E-mail, Categoria / Cargo de Acesso.
- **Governança:** Apenas o `Admin Geral` pode convidar alguém como `Admin` ou `👑 Admin Geral` (disparando o diálogo de transferência). Admins Normais convidam como `Resident` ou `Guest Access`.

### 1.7 Gaveta de Membros da Família (`FamilyMembersDrawer`)
- **Exibição:** Lista em tempo real de status, localização e papéis com layout anti-sobreposição.
- **Privacidade & Salvamento Resiliente de Status:** Apenas o próprio usuário autenticado visualiza o botão de editar seu status e localização ("Meu Status"). A gravação opera via `upsert` com suporte a `id` e `name`, transmitindo imediatamente via WebSocket (`house:status_changed`) para todos os dispositivos na mesma residência.
- **Ações Administrativas & Remoção:**
  - Admin Geral: Pode promover residentes a Admin, destituir Admins para Residentes, transferir liderança geral e remover moradores/admins da residência.
  - Admin Normal: Pode remover apenas moradores regulares (`Resident`/`Guest`).

### 1.8 Modal de Saída & Sucessão Obrigatória de Admin Geral (`LeaveHouseModal`)
- **Objetivo:** Permitir que moradores saiam da residência ativa de forma segura e transparente.
- **Regra de Sucessão Mandatória:** Se o morador solicitante for o `Admin Geral` e existirem outros moradores cadastrados na residência, o modal obriga a seleção prévia de um sucessor (outro morador ou subadmin) antes de habilitar a confirmação de saída.
- **Componentes:**
  - Lista interativa dos moradores elegíveis com foto, nome e tag de cargo (`Subadmin` ou `Morador`);
  - Banner institucional alertando sobre a regra de que a residência não pode ficar órfã;
  - Botão de ação: "Nomear Sucessor e Sair da Residência" (com indicador de loading durante a transação atômica no backend).
- **Casos Especiais:** Moradores regulares e o Admin Geral quando for o único morador na residência visualizam confirmação direta sem necessidade de seletor de sucessor.



