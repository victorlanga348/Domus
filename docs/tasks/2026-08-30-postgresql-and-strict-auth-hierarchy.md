# Task: PostgreSQL Real Database & Hierarquia Estrita de Autenticação
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/authentication.md]]`, `[[docs/architecture/database.md]]`, `[[docs/architecture/stack.md]]`

---

## 1. Contexto & Problema
Para uso com dados 100% reais:
1. **Banco de Dados Real:** Foi ativado o PostgreSQL com a string de conexão configurada no arquivo `backend/.env` (`postgresql://postgres:admin377241@localhost:5432/domus_db`), com schema gerado e sincronizado via Prisma.
2. **Eliminação de Mock Data:** Todos os dados estáticos/placeholders foram expurgados de `data.ts`.
3. **Hierarquia de Rotas / Autenticação Estrita:** Bloqueio total de acesso ao Dashboard sem antes passar pelo fluxo obrigatório de:
   - **Nível 1:** Tela de Autenticação (Login ou Cadastro com Nome, Email, Senha e PIN).
   - **Nível 2:** Tela de Seleção de Residência (Fundar Residência como ADMIN ou Entrar em Residência Existente como Membro).
   - **Nível 3:** Aplicação Principal DOMUS com dados reais da casa e usuário autenticado.

---

## 2. Critérios de Aceitação
- [x] Conexão PostgreSQL e schema `domus_db` configurados e sincronizados via Prisma.
- [x] Dados mockados eliminados do frontend.
- [x] Bloqueio de acesso ao dashboard sem login.
- [x] Bloqueio de acesso ao dashboard sem vinculação a uma residência fundada ou ingressada.
- [x] `authApi` conectado às rotas de auth e house do backend.
- [x] Typecheck e builds com código 0 no backend e frontend.
