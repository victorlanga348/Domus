# Contratos de Integração & Endpoints da API REST

## 1. Padrões Globais
- **Base URL:** `/api`
- **Autenticação:** Header `Authorization: Bearer <jwt_token>`
- **Content-Type:** `application/json`

---

## 2. Endpoints de Autenticação (`/api/auth`)

### `POST /api/auth/verify-house`
- **Payload:** `{ "houseCode": "DOMUS-9021" }`
- **Resposta (200):**
  ```json
  {
    "house": { "id": "uuid", "name": "Residência Alameda" },
    "members": [
      { "id": "uuid-1", "name": "Alice", "avatar": "avatar-url" }
    ]
  }
  ```

### `POST /api/auth/login-pin`
- **Payload:** `{ "userId": "uuid-1", "pin": "1234" }`
- **Resposta (200):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": { "id": "uuid-1", "name": "Alice", "role": "MEMBER" }
  }
  ```

### `POST /api/auth/google`
- **Descrição:** Valida o ID Token do Google Identity Services, realiza upsert no banco e retorna sessão JWT.
- **Payload:**
  ```json
  {
    "credential": "eyJhbGciOiJSUzI1NiIs..."
  }
  ```
- **Resposta (200):**
  ```json
  {
    "status": "success",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "uuid",
        "name": "Nome do Usuário",
        "email": "usuario@gmail.com",
        "avatar": "https://lh3.googleusercontent.com/...",
        "role": "MEMBER",
        "vacation_mode": false,
        "house_id": null
      }
    }
  }
  ```
- **Erros:**
  - `400 Bad Request`: Token Google (`credential`) ausente ou malformatado.
  - `401 Unauthorized`: Token Google inválido ou expirado.

### `POST /api/auth/register`
- **Descrição:** Registra uma nova conta de morador. O campo `pin` é estritamente opcional (se omitido, o sistema aplica hash Bcrypt padrão `0000`).
- **Payload:**
  ```json
  {
    "name": "Nome Completo",
    "email": "morador@exemplo.com",
    "password": "senha_segura_min_6",
    "pin": "1234" // Opcional (4 a 6 dígitos). Omitido no formulário padrão web/mobile.
  }
  ```
- **Resposta (201):**
  ```json
  {
    "status": "success",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "uuid",
        "name": "Nome Completo",
        "email": "morador@exemplo.com",
        "role": "MEMBER",
        "vacation_mode": false,
        "house_id": null
      }
    }
  }
  ```
- **Erros:**
  - `400 Bad Request`: Nome, e-mail inválido, senha curta (< 6 caracteres) ou PIN inválido (< 4 ou > 6 dígitos quando fornecido).
  - `409 Conflict`: E-mail já cadastrado.

---

## 3. Endpoints de Tarefas (`/api/tasks`)

### `GET /api/tasks`
- Retorna lista de tarefas da casa com estado atualizado e cálculo de expiração de lock.

### `POST /api/tasks/:id/lock`
- Bloqueia a tarefa para execução imediata (45 min).
- **Resposta (200):** Tarefa com status `LOCKED`, `lockedById` e `lockedAt`.

### `POST /api/tasks/:id/complete` (ou `PATCH /api/tasks/:id/complete`, alias `/api/tasks/:id/concluir`)
- **Autorização:** Apenas o morador designado (tarefa direcionada) ou o membro da vez no rodízio.
- **Headers:** `x-user-id`
- **Payload:** `{ "user_id": "uuid-user", "pin": "opcional" }`
- **Resposta (200):** Tarefa com status `COMPLETED`, `locked_by_id` atualizado e novo `nextAssignee` (se rodízio).
- **Erros:**
  - `403 Forbidden`: `"Apenas a pessoa designada para esta tarefa pode marcá-la como concluída."` caso chamado por terceiro.
  - `400 Bad Request`: `"Tarefa já foi concluída."` caso já esteja finalizada.

### `POST /api/tasks/:id/revert` (ou `PATCH /api/tasks/:id/revert`, alias `/api/tasks/:id/reverter`)
- **Autorização:** Exclusivo para o **Admin Geral** e **Sub-Admins** (`ADMIN`, `SUB_ADMIN`, `Admin`, `Admin Geral`).
- **Headers:** `x-user-id`, `x-user-role`
- **Payload:** `{ "user_id": "uuid-user", "user_role": "ADMIN" }`
- **Resposta (200):** Tarefa restaurada para o status `OPEN`, com `locked_by_id: null`, `locked_at: null`.
- **Erros:**
  - `403 Forbidden`: `"Apenas administradores e o Admin Geral têm permissão para reverter uma tarefa concluída."` para moradores comuns (`MEMBER`, `Resident`).

### `POST /api/tasks/:id/block`
- **Payload:** `{ "reason": "Falta de produto de limpeza" }`
- **Resposta (200):** Tarefa com status `BLOCKED`.

### `PUT /api/tasks/:id` (e `PATCH /api/tasks/:id`)
- **Descrição:** Atualiza título, descrição, turno, frequência e sincroniza a lista de participantes da tarefa, recalculando o `rotation_index` com preservação determinística da vez da escala e salto de membros em férias.
- **Autorização:** Exclusivo para **Admin Geral** e **Sub-Admins** (`role === 'ADMIN' | 'SUB_ADMIN'`).
- **Headers:** `x-user-id`, `x-user-role`
- **Payload:**
  ```json
  {
    "title": "Lavar a louça do jantar",
    "shift": "MORNING",
    "frequency": "DAILY",
    "participant_ids": ["uuid-1", "uuid-2", "uuid-3"]
  }
  ```
- **Resposta (200):**
  ```json
  {
    "status": "success",
    "message": "Tarefa atualizada com sucesso.",
    "task": {
      "id": "uuid-task",
      "title": "Lavar a louça do jantar",
      "rotation_index": 1,
      "shift": "MORNING",
      "frequency": "DAILY",
      "participants": [
        { "id": "uuid-tp-1", "user_id": "uuid-1", "user": { "id": "uuid-1", "name": "Ana", "vacation_mode": false } }
      ]
    }
  }
  ```
- **Erros:**
  - `403 Forbidden`: `FORBIDDEN_TASK_UPDATE` para moradores sem papel de administração.
  - `404 Not Found`: `TASK_NOT_FOUND` se o ID da tarefa não existir.

---

## 4. Endpoints de Salas Privadas & Governança (`/api/rooms`)

### `GET /api/rooms/my-rooms`
- Lista exclusivamente as salas onde o usuário logado já é um `Participant` confirmado.
- **Headers:** `x-user-id`
- **Resposta (200):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid-room",
        "title": "Planejamento Financeiro",
        "is_protected": true,
        "is_member": true,
        "my_role": "ARCHITECT",
        "members_count": 3,
        "messages_count": 15
      }
    ]
  }
  ```

### `POST /api/rooms` (Fundar Nova Sala)
- Cria uma nova sala protegida e vincula o criador como `ARCHITECT`.
- **Regra:** Título da sala deve ser único (retorna `409 Conflict` caso já exista).
- **Payload:** `{ "title": "ProjetoX", "password": "secretPassword123" }`
- **Headers:** `x-user-id`, `x-house-id`
- **Resposta (201):** Objeto da sala criada com o criador em `Participant` (`role: ARCHITECT`).

### `POST /api/rooms/join` (Entrada Privada por Credenciais)
- Valida o par `title` e `password` via `bcrypt.compare`.
- **Segurança Anti-Enumeração:** Retorna `401 Unauthorized` com mensagem `"Credenciais da sala inválidas"` tanto para título inexistente quanto para senha incorreta.
- **Payload:** `{ "title": "ProjetoX", "password": "secretPassword123" }`
- **Headers:** `x-user-id`
- **Resposta (200):** Objeto da sala com participantes e confirmação de entrada.

### `PATCH /api/rooms/:id/promote`
- Promove um membro da sala para o cargo de `ARCHITECT`.
- **Proteção:** Middleware `ensureArchitect` (Requer que o solicitante seja `ARCHITECT` nesta sala).
- **Payload:** `{ "targetUserId": "uuid-user-2" }`
- **Headers:** `x-user-id`
- **Resposta (200):** Registro atualizado em `Participant`.

### `GET /api/rooms/:id/messages`
- Retorna o histórico de mensagens da sala para participantes autorizados.
- **Headers:** `x-user-id`
- **Resposta (200):** Array de mensagens com dados do autor.

### `POST /api/rooms/:id/messages`
- Envia mensagem na sala para participantes autorizados.
- **Payload:** `{ "text": "Reunião de compras às 18h!" }`
- **Headers:** `x-user-id`
- **Resposta (201):** Mensagem criada.

---

## 5. Endpoints de Gestão de Residências (`/api/houses` / `/api/house`)

### `POST /api/houses/create` (ou `/api/house/create`)
- Cria uma nova residência, gera código de convite único e vincula o usuário como `ADMIN` (Admin Geral).
- **Payload:** `{ "houseName": "Mansão DOMUS", "user_id": "uuid" }`
- **Regras:**
  - Não exige senha de residência (Opção A).
  - Gera `invite_code` único determinístico no formato `CASA-XXXX`.
- **Resposta (201):** `{ "status": "success", "data": { "house": { "id": "uuid", "name": "...", "invite_code": "CASA-4892" }, "user": {...} } }`

### `GET /api/houses/my-houses`
- Lista as residências ativas vinculadas ao usuário autenticado (retorna vazio caso `house_id` seja `null`).
- **Headers:** `x-user-id`, `Authorization: Bearer <jwt>`
- **Resposta (200):** Array de residências com contadores de membros e papel do morador.

### `POST /api/houses/join` (ou `/api/house/join`)
- Ingressa ou reingressa em uma residência existente.
- **Payload:** `{ "inviteCode": "CASA-4892", "user_id": "uuid" }`
- **Regras:**
  - Busca prioritariamente pelo Código Único da Casa (`invite_code`, ex: `CASA-4892`), tolerando maiúsculas e minúsculas.
  - Não exige senha (Opção A).
  - **Reset Mandatório de Cargo:** Qualquer usuário que ingressar ou reingressar na residência recebe estritamente a role `MEMBER` (`Resident`), sem restauração de cargos administrativos anteriores.
- **Resposta (200):** `{ "status": "success", "data": { "house": {...}, "user": {...} } }`

### `POST /api/houses/switch`
- Alterna a residência ativa do usuário sem destruir a sessão de autenticação.
- **Payload:** `{ "targetHouseId": "uuid-house" }`
- **Headers:** `x-user-id`
- **Resposta (200):** `{ "house": {...}, "user": {...} }`

### `POST /api/houses/leave` (ou `/api/house/leave`)
- Desvincula o morador da residência atual mantendo o login ativo (`house_id = null`, `role = 'MEMBER'`).
- **Payload:** `{ "userId": "uuid-user", "newAdminId": "uuid-sucessor-opcional" }`
- **Regras Obrigatórias:**
  - Se for o `Admin Geral` e houver outros moradores, `newAdminId` é obrigatório (`ADMIN_TRANSFER_REQUIRED`).
  - **Exclusão de Casa Vazia:** Se o solicitante for o único morador na residência (0 membros restantes), a residência e todos os seus registros são excluídos em definitivo do banco de dados de forma atômica para evitar registros órfãos.
- **Resposta (200):** `{ "status": "success", "data": { "user": {...}, "newAdmin": {...}, "houseDeleted": boolean } }`

### `POST /api/houses/remove-member` (ou `/api/house/remove-member`)
- Remove e desvincula um morador da residência no PostgreSQL (`house_id = null`, `role = 'MEMBER'`), remove participações de tarefas e registra auditoria.
- **Payload:** `{ "houseId": "uuid-house", "memberId": "uuid-member", "requesterId": "uuid-requester", "requesterRole": "Admin Geral | Admin" }`
- **Autorização (RBAC):**
  - Apenas `Admin Geral` (`ADMIN`) ou `Admin` auxiliar podem remover membros.
  - Bloqueado com `403 CANNOT_REMOVE_GENERAL_ADMIN` caso o alvo seja o Administrador Geral da casa.
  - Bloqueado com `400 CANNOT_REMOVE_SELF` caso o usuário tente se auto-remover (deve usar `POST /api/houses/leave`).
- **Resposta (200):** `{ "status": "success", "data": { "success": true, "removedUser": {...} } }`
- **Broadcast:** Emite eventos WebSocket `house:member_removed` e `house:members_updated`.

### `POST /api/houses/:id/regenerate-code` (ou `PATCH /api/houses/:id/code`)
- Invalida o código de convite anterior e gera um novo código no padrão `CASA-XXXX` garantindo unicidade `@unique`.
- **Autorização:** Apenas o `Admin Geral` (`ADMIN`) ativo da residência pode executar esta operação.
- **Headers:** `x-user-id` ou `Authorization: Bearer <jwt>`
- **Resposta (200):**
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid-house",
      "name": "Residência Alameda",
      "invite_code": "CASA-9821"
    }
  }
  ```
- **Broadcast:** Emite evento WebSocket `house:code_regenerated` para sincronização instantânea de todos os clientes conectados.

---

## 6. Eventos em Tempo Real (Socket.io)
- **`house:join`:** Entrada na sala da residência com payload `{ houseId, user: { id, name, avatar } }`.
- **`house:leave`:** Saída da sala da residência com `{ houseId }`.
- **`house:presence`:** Broadcast emitido para todos os dispositivos conectados à residência contendo `onlineCount`, `onlineUserIds` e lista de usuários.
- **`house:code_regenerated`:** Broadcast emitido quando o Admin Geral regenera o código de convite da casa (`{ houseId, invite_code }`).
- **`house:members_updated`:** Broadcast emitido quando ocorre alteração de membros (promoção, rebaixamento, adição, remoção ou transferência de liderança) com payload `{ houseId, members }`, atualizando cargos e permissões de todos os aparelhos conectados sem reload.
- **`task:locked` / `task:unlocked`:** Sincronização em tempo real de travas de tarefas entre aparelhos.
- **`room:join` / `room:leave` / `room:presence` / `room:new_message`:** Sincronização em tempo real de mensagens e presenças em salas privadas.
