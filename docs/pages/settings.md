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
- **Aplicativo DOMUS (Instalação PWA & Standalone):**
  - **Identificação Automática:** Detecta se o aplicativo já opera em tela cheia / nativo (`display-mode: standalone` ou `navigator.standalone`), exibindo badge verde `"✓ Instalado"` e feedback informativo.
  - **Instalação com 1 Toque (Android / Chrome / Edge / Desktop):** Intercepta o evento `beforeinstallprompt` e aciona a instalação nativa do sistema operacional com confirmação automática.
  - **Guia Passo a Passo para iOS (Safari) e Navegadores Manuais:** Em navegadores sem suporte ao evento nativo ou quando o prompt do navegador falha, aciona um modal modal ilustrado e acessível em 3 passos (*1. Compartilhar; 2. Adicionar à Tela de Início; 3. Adicionar*).
- **Modo Noturno & Preferências Globais:** Agendamento automático de dimmer de iluminação, sensores e economia de energia com horários de início e término, persistidos centralizadamente no PostgreSQL (`HousePreference`).
- **Regras de Convivência da Casa:**
  - **Criação e Gestão:** Apenas moradores com cargo de administrador (`Admin Geral` ou `Admin`) visualizam botões e formulários para criar novas regras.
  - **Exclusão com Confirmação e Acessibilidade Mobile:** O botão de exclusão de regras (lixeira) é visível no mobile com alvo de toque ergonômico (`min-h-[38px] min-w-[38px]`) e hover elegante no desktop. Ao ser acionado, abre o modal `Excluir Regra da Casa?` para confirmação explícita antes da remoção definitiva.
  - **Sincronização e Auditoria:** A exclusão propaga em tempo real via WebSocket (`house:rule_deleted`), atualiza o PostgreSQL (`DELETE /api/rules/:id`), emite notificação Toast e registra auditoria imutável em `ActivityLog`.
  - **Histórico:** `[[docs/tasks/2026-09-13-exclusao-regras-residencia-admin.md]]`.

### 2.2 Gestão de Membros & Governança de Cargos
- **Hierarquia de Cargos:**
  - `👑 Admin Geral`: Único por residência. Possui governança total, promove moradores a `Admin`, destitui admins para `Resident`, remove qualquer membro (exceto a si próprio) ou transfere o cargo de Admin Geral.
  - `Admin`: Administrador auxiliar. Pode convidar novos moradores e remover moradores regulares (`Resident`/`Guest`), mas **não pode** remover outros admins nem o Admin Geral.
  - `Resident` / `Resident Restricted` / `Guest`: Moradores regulares. Não podem adicionar nem remover membros nem alterar papéis.
- **Menu Contextual Dropdown (`MemberActionDropdown` / `more_vert`) & Modais Obrigatórios:**
  - Substitui o alinhamento horizontal de botões em linha por um menu suspenso flutuante acionado por `...` (`more_vert`), fechando em clique externo ou tecla `Escape`.
  - Contém ações dinâmicas segundo o RBAC: "Promover a Admin", "Despromover a Morador", "Passar Admin Geral" e "Remover da Casa".
  - **Modais Obrigatórios de Confirmação:** Nenhuma ação de alteração de cargo ou desligamento é executada de forma direta:
    - **Promover:** Exibe diálogo de confirmação com ícone `shield_person`;
    - **Despromover:** Exibe diálogo de confirmação com ícone `arrow_downward`;
    - **Passar Admin Geral:** Exibe `LeadershipTransferModal` notificando a conversão para Admin Normal;
    - **Remover da Casa:** Exibe diálogo de confirmação com ícone `person_remove` e variante danger.
- **Botão Convidar Membro (`+`):** Visível exclusivamente para quem possui cargo `Admin Geral` ou `Admin`.
- **Trava de Segurança:** A adição de membros é bloqueada para moradores comuns tanto no visual (botões e drawers ocultos) quanto no handler da aplicação (`handleAddFamilyMember`), emitindo mensagem explicativa caso tentada.

### 2.3 Troca de Residência & Sucessão Inteligente de Liderança
- Ação de troca rápida de casa ("Trocar Residência") sem deslogar a conta de usuário, acessível tanto pelo cabeçalho global quanto pela barra lateral e rodapé da tela de Configurações.
- **Governança Estrita para o Admin Geral:**
  - Se for o único morador na residência (1 pessoa): a troca ocorre diretamente para o seletor de casas.
  - Se existirem 2 pessoas no total na residência: o outro morador é designado automaticamente como sucessor e é exibido o modal de confirmação para transferir a liderança geral antes de prosseguir com a troca.
  - Se existirem 3 ou mais pessoas no total: é exibido o card de integrantes (`SwitchHouseSuccessorModal`) para que o líder escolha o sucessor, seguido do modal de confirmação para transferência de liderança.
- Ao alternar, o usuário é redirecionado para a tela de seleção de casas (`HouseSelectionView`), colocando a residência de origem em modo de férias e reativando a residência de destino sem risco de reversão involuntária de tela.

### 2.4 Sair da Residência, Sucessão Obrigatória & Exclusão de Casa Vazia
- Botão "Sair da Residência" no rodapé de membros, permitindo desvincular o usuário da casa ativa.
- **Regra de Ouro da Liderança:** Se o solicitante for o `Admin Geral` e existirem outros membros na casa, o sistema bloqueia a saída direta e exige a seleção de um sucessor (`newAdminId`), promovendo o novo líder de forma atômica antes de desvincular o usuário anterior.
- **Exclusão de Casa Vazia:** Se o solicitante for o único morador restante na residência (0 membros restantes), a residência e seus registros associados são excluídos automaticamente em definitivo do banco de dados para evitar registros órfãos.
- **Reset de Cargo & Isolamento de Credenciais:** Todo usuário que sai da residência tem seu cargo resetado para `MEMBER` (`Resident`), deixa de ter acesso ao código de convite da casa e necessita obrigatoriamente preencher o Código Único (`CASA-XXXX`) para retornar. Não há senha de casa e não há bypass de 1 clique.

