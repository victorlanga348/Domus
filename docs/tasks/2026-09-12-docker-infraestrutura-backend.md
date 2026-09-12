# Task: Infraestrutura Docker para Backend Node.js com Prisma e PostgreSQL
**Data:** 2026-09-12  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/architecture/stack.md]]`, `[[docs/architecture/security.md]]`

---

## 1. Contexto & Problema
O backend do DOMUS utiliza Express, TypeScript e Prisma ORM conectado ao banco relacional PostgreSQL. Atualmente, a execução local depende de uma instância externa ou local do PostgreSQL configurada manualmente no host do desenvolvedor.

Para garantir paridade entre ambientes de desenvolvimento e produção, inicialização reproduzível com um único comando (`docker compose up --build`), isolamento de dependências e execução segura de migrações do Prisma ORM, é necessário containerizar o serviço de API e orquestrar a base de dados PostgreSQL com healthchecks e volumes persistentes.

---

## 2. Solução Proposta
1. **`backend/Dockerfile`**:
   - Imagem base: `node:20-alpine` (leveza e segurança).
   - Instalação do pacote de sistema `openssl` (obrigatório para os binários do Prisma Query Engine no Linux Alpine).
   - Configuração de `WORKDIR /app`.
   - Cópia otimizada de camadas (`package*.json`, schema do Prisma `src/database/schema.prisma`).
   - Execução de `npm install` e `npx prisma generate --schema=./src/database/schema.prisma`.
   - Cópia do código-fonte e compilação/execução.
   - Script de inicialização (`docker-entrypoint.sh`) com permissão de execução para aguardar disponibilidade do banco, rodar `npx prisma migrate deploy --schema=./src/database/schema.prisma` e iniciar o servidor (`npm run dev`).

2. **`backend/.dockerignore`**:
   - Bloquear transferência de arquivos locais desnecessários: `node_modules`, `dist`, `.git`, `.env`, `npm-debug.log*`, `.DS_Store`.

3. **`backend/docker-compose.yml`**:
   - Serviço `postgres_db`:
     - Imagem: `postgres:16-alpine`.
     - Variáveis parametrizadas com fallbacks seguros (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`).
     - Exposição de porta `5432:5432`.
     - Volume nomeado `postgres_data` montado em `/var/lib/postgresql/data`.
     - Healthcheck com `pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-domus_db}` para garantir que o banco esteja aceitando conexões antes de liberar o container da API.
   - Serviço `api`:
     - Build direcionado ao Dockerfile local.
     - Portas: `"3333:3333"` (e/ou mapeamento conforme `PORT`).
     - Configuração de `DATABASE_URL=postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres_db:5432/${POSTGRES_DB:-domus_db}?schema=public`.
     - Diretiva `depends_on` condicionada a `postgres_db: condition: service_healthy`.
     - Volumes em modo dev: bind mount do código-fonte local (`.:/app`) com volume anônimo `/app/node_modules` para evitar sobrescrever as dependências compiladas para Linux Alpine.
   - Volume nomeado `postgres_data`.

4. **Atualização de Variáveis de Ambiente (`backend/.env.example`)**:
   - Documentação da `DATABASE_URL` para execução em container vs local.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Ambiente 100% reproduzível e isolado sem necessidade de instalar PostgreSQL localmente no host.
  - Eliminação de race conditions na inicialização graças ao healthcheck nativo do PostgreSQL combinado com `service_healthy`.
  - Hot-reload preservado no desenvolvimento através de volumes e preservação do `/app/node_modules` interno.
  - Compatibilidade garantida do Prisma Query Engine em Alpine Linux através do pacote `openssl`.
- **Desvantagens / Riscos:**
  - Em Windows com Docker Desktop / WSL2, bind mounts de volumes podem introduzir pequeno overhead de I/O em diretórios extensos (mitigado isolando `node_modules`).
  - Necessidade de permissões de execução corretas (`chmod +x`) no `docker-entrypoint.sh`.

---

## 4. Critérios de Aceitação
- [x] `backend/Dockerfile` configurado com `node:20-alpine`, `openssl`, geração do Prisma Client e script entrypoint resiliente.
- [x] `backend/.dockerignore` criado excluindo `node_modules`, `dist`, `.git`, `.env` e logs.
- [x] `backend/docker-entrypoint.sh` criado para rodar `prisma migrate deploy` com schema em `./src/database/schema.prisma` antes de subir o servidor.
- [x] `backend/docker-compose.yml` orquestrando `postgres_db` (com healthcheck) e `api` (com `depends_on: service_healthy`).
- [x] `backend/.env.example` atualizado com exemplos claros da `DATABASE_URL` inter-container.
- [x] Governança e documentação em `/docs/architecture/stack.md` atualizada com as instruções do Docker.

---

## 5. Plano de Implementação (Passo a Passo)
1. Criar `backend/.dockerignore`.
2. Criar `backend/docker-entrypoint.sh` com tratamento de inicialização e deploy de migrações do Prisma.
3. Criar `backend/Dockerfile` multi-etapa / otimizado para Alpine e Prisma.
4. Criar `backend/docker-compose.yml` com `postgres_db` e `api`.
5. Atualizar `backend/.env.example` com o formato de conexão Docker.
6. Atualizar `docs/architecture/stack.md` registrando a infraestrutura containerizada.
7. Validar sintaxe, arquivos gerados e governança SDD.

---

## 6. Validação e Testes
- [x] Validação de sintaxe YAML e Dockerfile
- [x] Typecheck do backend (`rtk npm run typecheck`)
- [x] Testes de integridade dos arquivos de configuração e esquemas

---

## 7. Sincronização com /docs
- [x] `docs/architecture/stack.md` atualizado com seção de Containerização & Docker Compose
- [x] Matriz de impacto validada em `docs/documentation-governance.md`

