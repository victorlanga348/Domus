# Task: Hierarquia, Salas Protegidas e Papéis de Arquiteto (Rooms & Access Security)
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/architecture/data-model.md]]`, `[[docs/architecture/security.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema
O DOMUS necessitava de um sistema de comunicação e colaboração em tempo real/estruturada em salas com controle de acesso granular:
- **Salas Protegidas:** Salas que exigem autenticação por senha criptografada (`password` via Bcrypt).
- **Hierarquia de Cargos (Roles):** Relação N:N customizada (`Participant`) permitindo que um usuário possua papéis distintos por sala (`ARCHITECT` vs `MEMBER`).
- **Poderes de Governança do Arquiteto:** Apenas o criador inicial da sala (ou membros promovidos) podem gerenciar e promover outros membros a Arquiteto.

---

## 2. Solução Proposta

### 2.1 Modelo de Dados Adaptado ao DOMUS (`schema.prisma`)
Adaptando a estrutura enviada para a convenção canônica do DOMUS (SQLite/PostgreSQL com UUIDs e multi-tenancy):

```prisma
enum Role {
  MEMBER
  ARCHITECT
}

model Room {
  id         String   @id @default(uuid())
  title      String
  password   String   // Hash Bcrypt da senha da sala
  house_id   String?  // Vínculo opcional ou direto ao tenant doméstico
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  house        House?        @relation(fields: [house_id], references: [id], onDelete: Cascade)
  participants Participant[]
  messages     Message[]

  @@map("rooms")
}

model Participant {
  id        String   @id @default(uuid())
  role      Role     @default(MEMBER)
  joined_at DateTime @default(now())

  user_id   String
  room_id   String

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  room Room @relation(fields: [room_id], references: [id], onDelete: Cascade)

  @@unique([user_id, room_id])
  @@map("participants")
}

model Message {
  id         String   @id @default(uuid())
  text       String
  created_at DateTime @default(now())

  user_id String
  room_id String

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  room Room @relation(fields: [room_id], references: [id], onDelete: Cascade)

  @@map("messages")
}
```

### 2.2 Backend (`src/modules/rooms/` & `src/shared/middlewares/checkRole.ts`)
- **`rooms.service.ts`:**
  - `createRoom(title, password, userId, houseId)`: Gera hash da senha via `bcryptjs.hash`, cria a `Room` e associa o `userId` imediatamente como `ARCHITECT` em `Participant`.
  - `joinRoom(roomId, password, userId)`: Valida existência do usuário na sala, compara `bcryptjs.compare(password, room.password)` e, se correto, cadastra em `Participant` com role `MEMBER`.
  - `promoteMember(roomId, targetUserId, requesterUserId)`: Valida se `requesterUserId` é `ARCHITECT` e atualiza o role de `targetUserId` para `ARCHITECT`.
  - `getRoomMessages(roomId, userId)`: Retorna histórico de mensagens se o usuário for membro.
  - `sendMessage(roomId, userId, text)`: Cria mensagem se o usuário for membro.
- **`checkRole.ts`:** Middleware que valida se `req.userId` é `ARCHITECT` na sala especificada por `req.params.id`.

### 2.3 Endpoints REST
- `POST /api/rooms` - Cria nova sala protegida (Criador se torna `ARCHITECT`).
- `POST /api/rooms/:id/join` - Entrada na sala com senha.
- `GET /api/rooms` - Lista salas da casa (com indicação se requer senha / se usuário já é membro).
- `GET /api/rooms/:id/messages` - Lista mensagens da sala.
- `POST /api/rooms/:id/messages` - Envia mensagem na sala.
- `PATCH /api/rooms/:id/members/:userId/role` - Promove membro (requer role `ARCHITECT`).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Modelo de permissões extensível por sala (não global).
  - Segurança de senha de ponta a ponta com `bcryptjs`.
  - Zero risco de duplicidade de membros graças ao índice `@@unique([user_id, room_id])`.
- **Desvantagens / Riscos:**
  - Migração de banco resetará tabelas em desenvolvimento se existirem inconsistências de chaves.
  - Necessidade da dependência `bcryptjs` e `@types/bcryptjs`.

---

## 4. Critérios de Aceitação
- [x] `schema.prisma` atualizado com `Room`, `Participant`, `Message` e `Role` sem quebrar `House`, `User`, `Task`, `ActivityLog`.
- [x] `npx prisma migrate dev` / `prisma:generate` executado com sucesso.
- [x] Módulo `src/modules/rooms/` implementado com todas as 3 camadas (`controller`, `service`, `repository`, `schemas`, `routes`).
- [x] Middleware `checkRole.ts` criado e cobrindo autorização de Arquiteto.
- [x] Typecheck e Build passando sem erros no backend.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Dependências:** Instalar `bcryptjs` e `@types/bcryptjs` no `backend/`.
2. **Database:** Atualizar `backend/src/database/schema.prisma` e rodar `rtk npm --prefix backend run prisma:migrate`.
3. **Módulo Rooms:**
   - Criar `src/modules/rooms/rooms.repository.ts`
   - Criar `src/modules/rooms/rooms.schemas.ts`
   - Criar `src/modules/rooms/rooms.service.ts`
   - Criar `src/modules/rooms/rooms.controller.ts`
   - Criar `src/modules/rooms/rooms.routes.ts`
   - Criar `src/shared/middlewares/checkRole.ts`
4. **App.ts:** Registrar `app.use('/api/rooms', roomRoutes)`.
5. **Validação:** Executar typecheck e testes de build.
