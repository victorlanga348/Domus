# Task: Saguão de Salas Privadas & Acesso por Credenciais (Private Rooms Lobby)
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/rooms.md]]`, `[[docs/integrations/api-contracts.md]]`, `[[docs/architecture/security.md]]`

---

## 1. Contexto & Problema
Para máxima privacidade e segurança de convivência:
- As salas não devem ser expostas em diretórios públicos ou listas abertas a qualquer membro sem autorização.
- O acesso a novas salas deve ocorrer em uma **Lobby (Saguão)** com entrada "cega" via **Nome Exato da Sala** e **Senha da Sala**.
- Para evitar colisões de acesso, os títulos de salas passam a ser tratados como únicos (`unique` validation).
- Usuários que já ingressaram com sucesso em salas passam a vê-las em sua seção VIP/recente ("Minhas Salas"), dispensando redigitar senhas.

---

## 2. Solução Proposta

### 2.1 Backend (`src/modules/rooms/`)
- **Unicidade de Título (`rooms.service.ts` / `rooms.repository.ts`):** Na criação de sala (`createRoom`), verificar se já existe sala com o mesmo título (case-insensitive trim). Se existir, lançar `409 Conflict (ROOM_ALREADY_EXISTS)`.
- **Entrada Cega por Credenciais (`joinRoomByCredentials`):**
  - Endpoint: `POST /api/rooms/join` com payload `{ title, password }`.
  - Busca da sala por título.
  - Mensagem genérica anti-enumeração (`401 Unauthorized - Credenciais da sala inválidas`) caso a sala não exista ou a senha não coincida via `bcrypt.compare`.
  - Se o usuário já for membro, retorna a sala diretamente sem duplicar registro.
  - Se for nova entrada, cria `Participant` com role `MEMBER`.
- **Listagem de Salas Ativas (`listMyRooms`):**
  - Endpoint: `GET /api/rooms/my-rooms` para listar apenas as salas onde o usuário já é participante.

### 2.2 Frontend (`src/features/rooms/`)
- **Saguão Principal (`LobbyView.tsx`):**
  - Dois cards limpos de ação:
    1. **Fundar Nova Sala:** Campos `Nome da Sala` e `Senha da Sala` ➔ Ao criar, redireciona diretamente para o chat da sala com papel de Arquiteto.
    2. **Entrar em Sala Existente:** Campos `Nome da Sala` e `Senha da Sala` ➔ Ao entrar, valida e redireciona direto para o chat.
  - Zero listas de salas públicas expostas.
- **Seção "Minhas Salas" (Acesso Rápido):**
  - Lista de salas salvas onde o usuário logado é participante ativo.
  - Permite abrir o chat com 1 clique.
- **Chat & Gestão de Membros (`RoomChatModal.tsx`):**
  - Mantém chat e botão "Promover a Arquiteto" funcional.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Privacidade completa: salas invisíveis para quem não detém as credenciais exatas.
  - Proteção anti-enumeração de salas.
  - Navegação fluida: salas já desbloqueadas ficam salvas em "Minhas Salas".
- **Desvantagens / Riscos:**
  - Erros de digitação no nome da sala exigem atenção do usuário, pois o sistema não sugere nomes existentes.

---

## 4. Critérios de Aceitação
- [x] Backend validando unicidade de nome na criação de salas.
- [x] Rota `POST /api/rooms/join` validando `title` + `password` com mensagem genérica em caso de erro.
- [x] Rota `GET /api/rooms/my-rooms` retornando apenas as salas do usuário.
- [x] Frontend exibindo a Lobby com os 2 formulários e seção de "Minhas Salas".
- [x] Redirecionamento automático para o chat após criar ou entrar em uma sala.
- [x] Typecheck e Build passando sem erros.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Backend:**
   - Adicionar busca por `title` no `rooms.repository.ts` e método `listMyRooms`.
   - Atualizar `rooms.service.ts` com validação de unicidade de título e `joinRoomByCredentials`.
   - Adicionar rotas `POST /join` e `GET /my-rooms` no `rooms.routes.ts` e `rooms.controller.ts`.
2. **Frontend:**
   - Atualizar `roomsApi.ts` com `joinByCredentials` e `listMyRooms`.
   - Atualizar `RoomsView.tsx` para atuar como o **Saguão (Lobby)** com os formulários de Criar e Entrar por credenciais, mais a seção de "Minhas Salas".
3. **Validação & Testes:**
   - Executar `rtk npm --prefix backend run typecheck` e `build`.
   - Executar `rtk npm --prefix frontend run lint` e `build`.
