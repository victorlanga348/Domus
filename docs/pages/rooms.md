# Tela: Salas de Convivência & Governança (Rooms)

## 1. Objetivo da Tela
Proporcionar um espaço de comunicação e coordenação doméstica através de salas temáticas ou gerais, com controle de acesso por senha e gestão hierárquica por "Arquitetos".

---

## 2. Estrutura e Seções do Layout

### 2.1 Lista de Salas (`Rooms Grid`)
- Exibição de cards de salas disponíveis.
- **Indicador de Cadeado:** Ícone visual para salas protegidas por senha onde o usuário logado ainda não é participante.
- **Badge de Cargo:** Indicação do papel do usuário na sala (`ARQUITETO` ou `MEMBRO`).
- **Ação Rápida:** Botão de criar nova sala (com título e senha obrigatória).

### 2.2 Modal de Desafio de Senha (`PasswordPromptModal`)
- Modal disparado ao clicar em uma sala protegida em que o usuário ainda não entrou.
- Validação no backend via `bcrypt.compare` antes de conceder acesso.

### 2.3 Interface da Sala & Chat (`RoomChatView / RoomChatModal`)
- Histórico de mensagens da sala com autor e timestamp.
- Campo de input e envio de novas mensagens.
- **Painel Lateral de Membros:**
  - Lista de participantes da sala com seus respectivos papéis (`ARCHITECT` / `MEMBER`).
  - **Botão "Promover a Arquiteto":** Visível exclusivamente quando o usuário logado for `ARCHITECT` nesta sala.
