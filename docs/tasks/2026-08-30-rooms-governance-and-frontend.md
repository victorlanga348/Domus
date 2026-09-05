# Task: Governança de Salas e Interface de Poder (Rooms & Architect Governance)
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/rooms.md]]`, `[[docs/integrations/api-contracts.md]]`, `[[docs/architecture/security.md]]`

---

## 1. Contexto & Problema
Com o schema e banco de dados preparados para suportar `Room`, `Participant` e `Message`:
- Precisamos garantir que o backend exponha rigorosamente o fluxo de governança: `createRoom` (transação com `ARCHITECT`), `joinRoom` (`bcrypt.compare`), `ensureArchitect` middleware e rota `PATCH /api/rooms/:id/promote`.
- No frontend, criar a funcionalidade completa em `src/features/rooms/`:
  - Camada de API (`roomsApi.ts`) para integração HTTP.
  - Componente de listagem com ícones de cadeado para salas protegidas.
  - Modal de autenticação por senha (`PasswordPromptModal.tsx`).
  - Chat da sala com lista de participantes e botão dinâmico "Promover a Arquiteto" visível **apenas** para quem detém o papel de `ARCHITECT`.

---

## 2. Solução Proposta

### 2.1 Backend (`src/modules/rooms/` & `src/shared/middlewares/ensureArchitect.ts`)
- **`ensureArchitect` (Middleware):** Extrai `roomId` dos parâmetros e `userId` da requisição; consulta `Participant` e bloqueia com `403 FORBIDDEN_NOT_ARCHITECT` se o usuário não for Arquiteto.
- **`PATCH /api/rooms/:id/promote`:** Rota que recebe `{ targetUserId }` e promove o participante para `ARCHITECT`.
- **`rooms.service.ts` & `rooms.controller.ts`:** Garantir que o controller apenas orquestre DTOs e repasse para o service (Zero chamadas diretas ao Prisma no controller).

### 2.2 Frontend (`src/features/rooms/`)
- `src/features/rooms/api/roomsApi.ts`: Cliente HTTP com métodos `listRooms`, `createRoom`, `joinRoom`, `promoteMember`, `getMessages`, `sendMessage`.
- `src/features/rooms/types/index.ts`: Tipagens TypeScript sincronizadas com o backend (`RoomItem`, `RoomParticipant`, `RoomMessage`, `Role`).
- `src/features/rooms/components/RoomsView.tsx`: Grid de salas com status de membro, cadeados de bloqueio e botão de criação de sala.
- `src/features/rooms/components/RoomChatModal.tsx`: Visualizador de chat e gestão de membros (com botão "Promover a Arquiteto" condicional ao `my_role === 'ARCHITECT'`).
- `src/features/rooms/components/PasswordPromptModal.tsx`: Modal interativo para desbloquear sala com senha.
- Integração no layout principal (`Sidebar.tsx`, `Header.tsx`, `App.tsx`) com nova aba/seção de Salas.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Experiência completa de colaboração em tempo real/estruturada.
  - Garantia de que privilégios de Arquiteto são validados tanto no frontend (UI defensiva) quanto no backend (middleware rígido).
  - Isolamento limpo da feature dentro de `src/features/rooms/` seguindo a arquitetura feature-based.
- **Desvantagens / Riscos:**
  - Adição de uma nova aba no menu de navegação do frontend (`Sidebar.tsx`), necessitando tipagem em `TabType`.

---

## 4. Critérios de Aceitação
- [x] Middleware `ensureArchitect` criado e acoplado na rota `PATCH /api/rooms/:id/promote`.
- [x] Backend validando senhas via `bcrypt.compare` e criando o primeiro participante como `ARCHITECT`.
- [x] Feature `src/features/rooms/` implementada no frontend com API, componentes e modais.
- [x] Botão "Promover a Arquiteto" visível exclusivamente para usuários com cargo `ARCHITECT`.
- [x] Modal de senha bloqueando o acesso de usuários não participantes.
- [x] Typecheck e Build de ambos os pacotes passando com código 0.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Backend:**
   - Criar `src/shared/middlewares/ensureArchitect.ts` (ou padronizar com `checkRole.ts`).
   - Ajustar rota `PATCH /api/rooms/:id/promote` em `rooms.routes.ts`.
   - Garantir sincronia em `rooms.controller.ts` e `rooms.service.ts`.
2. **Frontend:**
   - Criar `src/features/rooms/types/index.ts`.
   - Criar `src/features/rooms/api/roomsApi.ts`.
   - Criar `src/features/rooms/components/PasswordPromptModal.tsx`.
   - Criar `src/features/rooms/components/RoomChatModal.tsx`.
   - Criar `src/features/rooms/components/RoomsView.tsx`.
   - Criar `src/features/rooms/index.ts`.
   - Adicionar `'rooms'` em `TabType` ([frontend/src/types.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/types.ts)), atualizar [Sidebar.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/layouts/Sidebar.tsx) e [App.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx).
3. **Validação & Testes:**
   - Executar `rtk npm --prefix backend run typecheck` e `build`.
   - Executar `rtk npm --prefix frontend run lint` e `build`.
