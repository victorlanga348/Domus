# Task: Implementação da Suite de Testes Unitários e End-to-End (E2E)
**Data:** 2026-09-02  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/architecture/testing.md]]`, `[[docs/architecture/concurrency-and-locks.md]]`, `[[docs/architecture/security.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema

O projeto DOMUS atingiu maturidade funcional em autenticação, gestão de residências, rodízio de tarefas, concorrência de locks e WebSockets em tempo real. No entanto, não havia uma suite automatizada de testes para validar continuamente regras de negócio críticas e garantir que regressões não ocorram no futuro.
A demanda atual solicita a criação de:
1. **Testes Unitários:** Para validar regras determinísticas isoladas (cálculo de turnos, lógica matemática de rodízio e pulo de férias, hashing seguro de senhas, validações de payload e integridade de dados).
2. **Testes End-to-End (E2E):** Para validar o ciclo de vida completo da aplicação de ponta a ponta (cadastro de moradores, fundação de residência, ingresso com senha, concorrência de locks de tarefas, agregação do Dashboard BFF e presença via WebSockets).

---

## 2. Solução Proposta

1. **Framework de Testes Nativo com TypeScript (`node:test` + `tsx`):**
   - Utilizar o test runner nativo do Node.js (`node:test` e `node:assert/strict`) executado via `npx tsx --test`.
   - **Vantagem:** Zero dependências externas pesadas ou instáveis; execução ultra-rápida nativa com suporte completo a TypeScript e ESM.
2. **Testes Unitários (`backend/tests/unit/`):**
   - `rotation.service.test.ts`:
     - Progressão cíclica de rodízio (`queue.shift()` -> `queue.push()`).
     - Tratamento do modo férias (`vacation_mode: true`), pulando morador pausado sem perder sua posição.
     - Proteção contra casos de borda (todos os moradores em férias).
   - `dashboard.service.test.ts`:
     - Cálculo temporal de turno (`MORNING`, `AFTERNOON`, `NIGHT`).
     - Estrutura consolidada de métricas do agregador BFF.
   - `houses.service.test.ts`:
     - Geração de código de convite único no formato canônico `CASA-XXXX`.
     - Criptografia de senhas com Bcrypt e verificação.
     - Papéis de usuário (`ADMIN` para fundador, `MEMBER` para ingressante).
3. **Testes End-to-End (`backend/tests/e2e/`):**
   - `lifecycle.e2e.test.ts`:
     - Servidor Express e Socket.io em porta efêmera dedicada para teste.
     - **Fluxo 1 (Autenticação):** Registro de dois usuários, verificação de duplicidade de e-mail e emissão de tokens JWT.
     - **Fluxo 2 (Residência):** Criação da residência pelo Usuário 1, validação de senha e código de convite.
     - **Fluxo 3 (Ingresso):** Usuário 2 ingressa com senha correta e rejeição com senha incorreta.
     - **Fluxo 4 (BFF Dashboard):** Chamada para `/api/dashboard`, validando retorno agregado de moradores e contagens.
     - **Fluxo 5 (Tarefas & Concorrência):** Criação de tarefa, lock exclusivo, bloqueio com erro 409 (Conflict) ao tentar duplo lock concorrente, e conclusão.
     - **Fluxo 6 (WebSocket & Presença Real-Time):** Conexão socket de teste, envio de `house:join` com identificação e verificação do broadcast `house:presence`.
4. **Scripts de Execução (`backend/package.json`):**
   - `"test": "tsx --test tests/**/*.test.ts"`
   - `"test:unit": "tsx --test tests/unit/**/*.test.ts"`
   - `"test:e2e": "tsx --test tests/e2e/**/*.test.ts"`
5. **Documentação Técnica:**
   - Criar `docs/architecture/testing.md` descrevendo a estratégia de testes, execução via terminal (`rtk npm test`) e boas práticas.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - Zero dependências adicionais no `node_modules`.
  - Cobertura completa de unidade e ponta a ponta para backend, API e WebSockets.
  - Velocidade sub-segundo de execução através do `tsx --test`.
  - Confiabilidade total antes de qualquer deploy ou migração.
- **Desvantagens / Riscos:**
  - Testes E2E de banco de dados interagem com a instância do Prisma/PostgreSQL configurada; garantir isolamento e limpeza de registros criados durante a suite com prefixo de teste (`test-user-...`).

---

## 4. Critérios de Aceitação

- [x] Testes unitários cobrem rotação de turnos, modo férias, hashing de senhas e formato de código de casa.
- [x] Testes E2E cobrem o fluxo completo de Auth -> House -> Dashboard -> Tasks/Locks -> WebSockets.
- [x] Scripts `npm test`, `npm run test:unit` e `npm run test:e2e` funcionam via `rtk`.
- [x] Todos os testes executam e passam com 100% de sucesso (Exit Code 0).
- [x] Documentação oficial criada em `[[docs/architecture/testing.md]]`.

---

## 5. Plano de Implementação (Passo a Passo)

1. [x] **Documentação:** Criar `docs/architecture/testing.md`.
2. [x] **Scripts:** Adicionar scripts de teste no `backend/package.json`.
3. [x] **Testes Unitários:** Implementar arquivos em `backend/tests/unit/`.
4. [x] **Testes End-to-End:** Implementar teste integrado de ciclo de vida em `backend/tests/e2e/`.
5. [x] **Validação:** Executar suite completa com `rtk npm test`.
6. [x] **Sincronização & Commit:** Concluir tarefa em `/docs` e comitar em português.

---

## 6. Validação e Testes

- [x] `rtk npm run test:unit` (backend): Código 0.
- [x] `rtk npm run test:e2e` (backend): Código 0.
- [x] `rtk npm test` (backend): Código 0.
