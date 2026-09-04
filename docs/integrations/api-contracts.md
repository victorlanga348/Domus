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

---

## 3. Endpoints de Tarefas (`/api/tasks`)

### `GET /api/tasks`
- Retorna lista de tarefas da casa com estado atualizado e cálculo de expiração de lock.

### `POST /api/tasks/:id/lock`
- Bloqueia a tarefa para execução imediata (45 min).
- **Resposta (200):** Tarefa com status `LOCKED`, `lockedById` e `lockedAt`.

### `POST /api/tasks/:id/complete`
- Conclui a tarefa e roda o algoritmo de rodízio A-Z com salto de férias.
- **Resposta (200):** Tarefa com status `COMPLETED` e novo `currentAssigneeId`.

### `POST /api/tasks/:id/block`
- **Payload:** `{ "reason": "Falta de produto de limpeza" }`
- **Resposta (200):** Tarefa com status `BLOCKED`.

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

### `GET /api/houses/my-houses`
- Lista as residências salvas e vinculadas ao usuário autenticado.
- **Headers:** `x-user-id`, `Authorization: Bearer <jwt>`
- **Resposta (200):** Array de residências com contadores de membros e papel do morador.

### `POST /api/houses/join` (ou `/api/house/join`)
- Ingressa ou reingressa em uma residência existente.
- **Payload:** `{ "houseName": "CASA-4892", "housePassword": "secretPassword123", "user_id": "uuid" }`
- **Regras:**
  - O campo de identificação aceita prioritariamente o Código Único da Casa (`invite_code`, ex: `CASA-4892`) ou o nome da residência.
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
- **`task:locked` / `task:unlocked`:** Sincronização em tempo real de travas de tarefas entre aparelhos.
- **`room:join` / `room:leave` / `room:presence` / `room:new_message`:** Sincronização em tempo real de mensagens e presenças em salas privadas.
