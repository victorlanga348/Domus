# Tela: Configurações & Gestão da Residência

## 1. Objetivo da Tela
Gerenciamento de membros da casa, governança de cargos administrativos, remoção hierárquica, regras de convivência, preferências de rotinas e troca de residência.

---

## 2. Estrutura e Seções do Layout

### 2.1 Preferências Globais da Residência (100% em Português)
- **Código de Acesso da Residência:** Exibição do código único (`invite_code`, ex: `CASA-4892`) com ações de cópia rápida para o clipboard (`Copiar Código`), compartilhamento via Web Share API (`Compartilhar`) e botão `Regenerar Código` protegido por modal de confirmação (exclusivo para o `Admin Geral`), permitindo rotação imediata de credenciais sem depender da memória humana.
- **Modo Noturno:** Agendamento automático de dimmer de iluminação, sensores e economia de energia com horários de início e término.
- **Regras de Convivência:** Cadastro, listagem numerada e exclusão de regras comunitárias.

### 2.2 Gestão de Membros & Governança de Cargos
- **Hierarquia de Cargos:**
  - `👑 Admin Geral`: Único por residência. Possui governança total, promove moradores a `Admin`, destitui admins para `Resident`, remove qualquer membro (exceto a si próprio) ou transfere o cargo de Admin Geral.
  - `Admin`: Administrador auxiliar. Pode convidar novos moradores e remover moradores regulares (`Resident`/`Guest`), mas **não pode** remover outros admins nem o Admin Geral.
  - `Resident` / `Resident Restricted` / `Guest`: Moradores regulares. Não podem adicionar nem remover membros nem alterar papéis.
- **Menu Contextual Dropdown (`MemberActionDropdown` / `more_vert`):**
  - Substitui o alinhamento horizontal de botões em linha por um menu suspenso flutuante acionado por `...` (`more_vert`), fechando em clique externo ou tecla `Escape`.
  - Contém ações dinâmicas segundo o RBAC: "Promover a Admin", "Despromover a Morador", "Passar Admin Geral" e "Remover da Casa".
- **Botão Convidar Membro (`+`):** Visível exclusivamente para quem possui cargo `Admin Geral` ou `Admin`.

### 2.3 Troca de Residência
- Ação de troca rápida de casa ("Trocar Residência") sem deslogar a conta de usuário.

### 2.4 Sair da Residência, Sucessão Obrigatória & Exclusão de Casa Vazia
- Botão "Sair da Residência" no rodapé de membros, permitindo desvincular o usuário da casa ativa.
- **Regra de Ouro da Liderança:** Se o solicitante for o `Admin Geral` e existirem outros membros na casa, o sistema bloqueia a saída direta e exige a seleção de um sucessor (`newAdminId`), promovendo o novo líder de forma atômica antes de desvincular o usuário anterior.
- **Exclusão de Casa Vazia:** Se o solicitante for o único morador restante na residência (0 membros restantes), a residência e seus registros associados são excluídos automaticamente em definitivo do banco de dados para evitar registros órfãos.
- **Reset de Cargo:** Todo usuário que sai da residência tem seu cargo resetado para `MEMBER` (`Resident`) e necessita do Código Único da casa para retornar.

