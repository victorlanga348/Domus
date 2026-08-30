# Task: Sprint 2 - Modelagem de Dados (Database Schema & Repositories)
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/architecture/data-model.md]]`, `[[docs/architecture/stack.md]]`

---

## 1. Contexto & Objetivos
Validar e garantir que a inteligência do banco de dados e os repositórios canônicos estejam 100% prontos para alimentar a lógica de negócio do DOMUS:
- `schema.prisma`: Entidades `User`, `House`, `Task`, `TaskParticipant` (M:N para rodízio seletivo), `ActivityLog`, `BulletinBoard`, `Room`, `Participant`, `Message` e Enums (`Shift`, `Frequency`, `TaskStatus`, `ActionType`, `Role`).
- `prisma.ts`: Instância singleton do PrismaClient com logs estruturados.
- Repositórios com métodos canônicos:
  - `UserRepository`: `create`, `findById`, `findByEmail`, `findByHouseId` / `findByHouse`, `updateVacationMode`, `findParticipantsByIds`.
  - `TaskRepository`: `create`, `findById`, `findByHouseId` / `findByHouse`, `findActiveTasksByShift(houseId, shift)`, `updateStatus`, `updateRotationIndex`.

---

## 2. Critérios de Aceitação
- [x] `schema.prisma` modelado com todas as entidades e restrições de integridade referencial (`Cascade`, `Restrict`, `SetNull`).
- [x] Prisma Client singleton configurado em `src/database/prisma.ts`.
- [x] Repositórios `UserRepository` e `TaskRepository` implementados e exportados.
- [x] Método `findActiveTasksByShift(houseId, shift)` filtrando tarefas não concluídas do turno.
- [x] Typecheck e build executando com código 0.
