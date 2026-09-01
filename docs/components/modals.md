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
- **Exibição:** Lista em tempo real de status, localização e papéis.
- **Ações Administrativas:** Permite ao Admin Geral promover residentes a Admin ou destituir admins para residentes diretamente pela interface.
