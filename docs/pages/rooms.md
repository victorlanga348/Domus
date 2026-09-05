# Tela: Salas Privadas & Lobby de Governança (Rooms & Lobby)

## 1. Objetivo da Tela
Proporcionar um saguão (Lobby) seguro e privativo para criação e entrada em salas temáticas da residência. As salas não são expostas publicamente em diretórios abertos; o acesso ocorre estritamente por credenciais privadas (Nome Exato + Senha).

---

## 2. Estrutura e Seções do Layout

### 2.1 Saguão Principal (`Lobby`)
- **Ação 1: "Fundar Nova Sala" (Arquiteto):**
  - Formulário com campos `Nome da Sala` (único) e `Senha da Sala`.
  - Ao submeter, cria a sala e redireciona imediatamente para o chat com cargo `ARCHITECT`.
- **Ação 2: "Entrar em Sala Existente" (Convidado):**
  - Formulário cego com campos `Nome da Sala` e `Senha da Sala`.
  - Validação discreta contra enumeração: "Credenciais da sala inválidas".
  - Ao autenticar, registra o vínculo em `Participant` (`MEMBER`) e abre o chat.

### 2.2 Barra Lateral / Atalhos VIP (`Minhas Salas`)
- Exibe estritamente as salas onde o usuário logado já possui participação ativa confirmada.
- Permite alternância rápida entre chats sem necessidade de reintroduzir senhas.

### 2.3 Interface do Chat & Governança (`RoomChatView / RoomChatModal`)
- Histórico em tempo real de mensagens com auto-scroll.
- Painel de membros com papéis (`ARCHITECT` / `MEMBER`).
- **Botão "Promover a Arquiteto":** Exibido exclusivamente para membros com status `ARCHITECT` na sala ativa.
