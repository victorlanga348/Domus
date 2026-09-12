# Task: Correção de Inicialização do Container Docker API (CRLF no Entrypoint e Migração PostgreSQL)
**Data:** 2026-09-12  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/architecture/stack.md]]`

---

## 1. Contexto & Problema
Ao subir os containers com Docker Compose, o banco `domus_postgres` inicializava normalmente (`healthy`), porém o container da API (`domus_api` / `backend-api`) ficava em estado de reinicialização contínua (`Restarting (255)`).

Diagnósticos identificados:
1. `exec ./docker-entrypoint.sh: no such file or directory`: Finais de linha no formato Windows (CRLF) no script shell montado via bind volume no Linux Alpine.
2. `P3019`: Histórico antigo de migrações SQLite em conflito com o schema configurado para PostgreSQL (`migration_lock.toml` com `provider = "sqlite"`).

---

## 2. Solução Implementada
1. Normalização dos finais de linha de [backend/docker-entrypoint.sh](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/docker-entrypoint.sh) para Unix (LF - `\n`).
2. Criação de [backend/.gitattributes](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/.gitattributes) com regra `*.sh text eol=lf`.
3. Atualização de [backend/Dockerfile](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/Dockerfile) para invocação explícita: `ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]`.
4. Regeneração da migração inicial nativa do PostgreSQL em [backend/src/database/migrations/20260912000000_init_postgresql/migration.sql](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/database/migrations/20260912000000_init_postgresql/migration.sql) e atualização do `migration_lock.toml` para `provider = "postgresql"`.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Estabilidade garantida na inicialização do container da API em ambiente Windows/WSL2 e Linux.
  - Execução automática e limpa das migrações do Prisma ORM no PostgreSQL.
  - Proteção contra conversão indesejada de quebras de linha via Git.
- **Desvantagens / Riscos:**
  - Nenhuma; compatibilidade e governança mantidas em 100%.

---

## 4. Critérios de Aceitação
- [x] [backend/docker-entrypoint.sh](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/docker-entrypoint.sh) normalizado para LF.
- [x] [backend/.gitattributes](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/.gitattributes) criado com regras `eol=lf` para scripts shell.
- [x] [backend/Dockerfile](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/Dockerfile) atualizado para chamada robusta do entrypoint via `/bin/sh`.
- [x] Migrações do Prisma consolidadas para PostgreSQL (`migration_lock.toml` com `provider = "postgresql"`).
- [x] Containers `domus_postgres` e `domus_api` ativos, migrações aplicadas com sucesso e rota `/api/health` respondendo `status: ok` na porta 3333.

---

## 5. Validação e Testes
- [x] Verificação de bytes do script (ausência do byte 0x0D `\r`)
- [x] Execução do `docker compose up -d --build` com sucesso
- [x] Teste de healthcheck HTTP (`curl http://localhost:3333/api/health`) -> 200 OK
- [x] Typecheck sem erros (`rtk npm run typecheck`)
- [x] Bateria de testes automatizados (`rtk npm test` - 57/57 testes aprovados)

---

## 6. Sincronização com /docs
- [x] Tarefa documentada e sincronizada com `docs/architecture/stack.md`
