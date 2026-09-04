# Tela: Configurações & Gestão da Residência

## 1. Objetivo da Tela
Gerenciamento de membros da casa, governança de cargos administrativos, remoção hierárquica, regras de convivência, preferências de rotinas e troca de residência.

---

## 2. Estrutura e Seções do Layout

### 2.1 Preferências Globais da Residência (100% em Português)
- **Código de Acesso da Residência:** Exibição do código único (`invite_code`, ex: `CASA-4892`) com layout mobile adaptativo:
  - **Mobile (< 640px):** Disposição em grid de 2 colunas. Na linha 1, `Copiar Código` e `Compartilhar` dividem o espaço proporcionalmente (50% cada). Na linha 2, o botão `Regenerar Código` ocupa a largura total (`col-span-2`), com touch target confortável (mínimo de 42px) e texto completo `whitespace-nowrap`, eliminando quebras de palavras e desvios de layout.
  - **Desktop (>= 640px):** Disposição flex horizontal unificada.
  - **Compartilhamento Universal:** Utiliza a Web Share API (`navigator.share`) com payload enriquecido de convite. Em contextos HTTP de rede local (LAN) ou dispositivos sem suporte nativo a compartilhamento, executa fallback transparente para a área de transferência com feedback explícito via Toast (*"Mensagem de convite copiada! Cole no WhatsApp ou envie aos moradores."*).
  - **Regeneração de Código:** Protegido por modal de confirmação responsivo (`ConfirmActionModal`), exclusivo para o `Admin Geral`, invalidando o código antigo e gerando um novo em tempo real via PostgreSQL e WebSockets.
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
- **Reset de Cargo & Isolamento de Credenciais:** Todo usuário que sai da residência tem seu cargo resetado para `MEMBER` (`Resident`), deixa de ter acesso ao código de convite da casa e necessita obrigatoriamente preencher o Código Único (`CASA-XXXX`) para retornar. Não há senha de casa e não há bypass de 1 clique.

