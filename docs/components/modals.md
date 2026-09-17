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
- **Foco Estrito em Status & Localização:** A gaveta destina-se exclusivamente à visualização de presença, status e localização em tempo real. Ações administrativas de governança (promover a admin, despromover a morador, transferir liderança e remover membros da residência) ocorrem exclusivamente na aba de **Configurações** (`SettingsView.tsx` através do `MemberActionDropdown.tsx`).

### 1.8 Modal de Saída & Sucessão Obrigatória de Admin Geral (`LeaveHouseModal`)
- **Objetivo:** Permitir que moradores saiam da residência ativa de forma segura e transparente.
- **Regra de Sucessão Mandatória:** Se o morador solicitante for o `Admin Geral` e existirem outros moradores cadastrados na residência, o modal obriga a seleção prévia de um sucessor (outro morador ou subadmin) antes de habilitar a confirmação de saída.
- **Componentes:**
  - Lista interativa dos moradores elegíveis com foto, nome e tag de cargo (`Subadmin` ou `Morador`);
  - Banner institucional alertando sobre a regra de que a residência não pode ficar órfã;
  - Botão de ação: "Nomear Sucessor e Sair da Residência" (com indicador de loading durante a transação atômica no backend).
- **Casos Especiais:** Moradores regulares e o Admin Geral quando for o único morador na residência visualizam confirmação direta sem necessidade de seletor de sucessor.

### 1.9 Gaveta de Alertas & Notificações (`NotificationsDrawer`)
- **Objetivo:** Centralizar alertas operacionais de tarefas pendentes e feed de novidades recentes da residência.
- **Política Híbrida de Retenção (TTL 48h com Preservação de Histórico):**
  - **Histórico & Auditoria (Imutável):** Nenhum log é apagado do banco de dados (`ActivityLog` / PostgreSQL) nem da aba de **Relatórios** (`ReportsView`), preservando 100% dos dados para governança, gráficos e estatísticas.
  - **Feed do Sino:**
    - **Notificações Não Lidas:** Permanecem visíveis independentemente da idade até leitura ou ação expressa do usuário, alimentando o badge vermelho do sino.
    - **Notificações Lidas:** Permanecem visíveis por até **48 horas** (`TTL = 48h * 3600 * 1000`) após sua criação/leitura, sendo filtradas automaticamente depois deste período para manter o drawer limpo e rápido.
    - **Botão "Limpar lidas":** Permite ao morador esvaziar visualmente da gaveta as notificações lidas a qualquer momento sem afetar o histórico.
    - **Botão "Marcar lidas":** Marca todas as notificações visíveis como lidas.
    - **Rodapé Informativo:** Link discreto no rodapé *"Exibindo atividades de 48h • Histórico em Relatórios"*, permitindo navegação direta para o histórico irrestrito.
  - **Aba de Alertas & Governança de Conclusão:**
    - **Props de Autenticação:** Recebe `currentUserId`, `currentUserName` e `currentUserRole`.
    - **Botão "Concluir":** Habilitado unicamente quando `canComplete = isAssignedUser || isGeneralAdmin`.
    - **Proteção Visual contra Execução Indevida:** Para moradores que não sejam os responsáveis nem o Admin Geral, o botão de conclusão é renderizado desabilitado em cinza com ícone de cadeado (`lock`) e tooltip informativo posicionado à direita: `"Aguardando confirmação de [Nome do Responsável]"`.

### 1.10 Card Modal de Sucessão ao Trocar de Casa (`SwitchHouseSuccessorModal`)
- **Objetivo:** Exibir os integrantes da casa ao Admin Geral que solicita a troca de residência ("Trocar Residência") quando houver mais de 2 pessoas na residência.
- **Estrutura:** Card modal em `#16302e` com contorno `#ffca5e`/40, ícone `crown`, lista de moradores elegíveis (com foto, nome, e-mail e cargo), rádio/seleção interativa com destaque dourado.
- **Acessibilidade:** Implementa `role="radiogroup"` e `role="radio"`, `aria-checked`, suporte a navegação por teclado (`Tab`, `Space`, `Enter`) e `Escape`.
- **Fluxo:** Ao selecionar um morador e clicar em "Continuar", dispara o modal de confirmação de transferência de liderança (`LeadershipTransferModal`) antes de executar a troca.
- **Casos Determinísticos na Troca de Casa:**
  - **1 morador (Admin Geral sozinho):** Troca de casa direta sem card.
  - **2 pessoas no total (Admin Geral + 1 morador):** Designação automática desse morador + abertura direta do modal de confirmação para passar cargo.
  - **3 ou mais pessoas no total:** Abertura do card para escolha do sucessor + modal de confirmação.

### 1.11 Modais Obrigatórios de Confirmação (`ConfirmActionModal` / `LeadershipTransferModal` / `LeaveHouseModal`)
- **Regra de Governança Estrita:** Todas as ações de alteração de privilégio, desvinculação ou passagem de cargo exigem modal prévio de confirmação antes de qualquer modificação de estado:
  1. **Passar Cargo Modal (`LeadershipTransferModal`):** Notifica a transição de Admin Geral para Administrador Normal e nomeia o novo líder.
  2. **Sair Modal (`LeaveHouseModal`):** Exige sucessão obrigatória se houver membros, ou alerta sobre exclusão de residência vazia.
  3. **Promover Modal (`ConfirmActionModal`):** Ícone `shield_person`, variante warning, solicitando confirmação antes de promover morador regular para Administrador.
  4. **Despromover Modal (`ConfirmActionModal`):** Ícone `arrow_downward`, variante warning, solicitando confirmação antes de despromover Administrador para Morador regular.
  5. **Remover Morador Modal (`ConfirmActionModal`):** Ícone `person_remove`, variante danger, prevenindo desvinculações acidentais de membros.
