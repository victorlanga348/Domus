# Task: Otimização de Resolução de Rede (DNS/IPv6) e I/O no Ambiente Docker/Host
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/tasks/2026-09-12-docker-infraestrutura-backend.md]]`, `[[docs/tasks/2026-09-02-acesso-mobile-rede-local.md]]`

---

## 1. Contexto & Problema
Ao executar o backend em container Docker no Windows enquanto o frontend é executado diretamente no host (`localhost:3002`), ocorrem atrasos perceptíveis (1 a 3 segundos) em requisições de criação/gravação de dados e handshakes WebSocket.
Investigação técnica identificou duas causas principais:
1. **Resolução de Host e Timeout IPv6 (`localhost` vs `127.0.0.1`):** Em `frontend/src/config/constants.ts`, `getHost()` retorna `'localhost'` no desktop. O navegador tenta conectar via IPv6 (`::1:3333`), sofrendo timeout de conexão antes de efetuar fallback para IPv4 (`127.0.0.1:3333`).
2. **Sobrecarga de I/O em Bind Mounts:** O backend executa em container com montagem de volume do host (`.:/app`) utilizando `tsx watch src/server.ts`. Sem isolamento explícito de caches adicionais de build/prisma, ocorrem acessos repetitivos pelo canal do sistema de ficheiros host/container.

---

## 2. Solução Proposta
1. **Frontend (`frontend/src/config/constants.ts`):**
   - Normalizar `getHost()` para converter `'localhost'` explicitamente para `'127.0.0.1'`.
   - Preservar o retorno de IPs de rede local (ex: `192.168.x.x`) para manter o acesso mobile via Wi-Fi funcionando sem regressões.
2. **Isolamento de Caches no Docker (`backend/docker-compose.yml`):**
   - Garantir volumes anônimos adicionais para diretórios gerados em runtime (`/app/.prisma`, `/app/dist`).
   - Manter o bind de portas aberto (`${PORT:-3333}:${PORT:-3333}`) para garantir compatibilidade com dispositivos móveis na rede local (LAN).
3. **Watcher Otimizado no Backend (`backend/package.json`):**
   - Ajustar o comando de desenvolvimento do `tsx watch` para desabilitar limpezas repetitivas de tela e focar no ponto de entrada `src/server.ts`.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Redução imediata do tempo de conexão inicial (de ~2000ms para <10ms) em todas as requisições HTTP e conexões Socket.io no desktop.
  - Zero quebra no acesso de dispositivos móveis na rede local.
  - Código cirúrgico sem novas dependências externas.
- **Desvantagens / Riscos:**
  - Caso o desenvolvedor tenha configurado cookies com escopo estrito a `localhost` em vez de `127.0.0.1`, pode requerer novo login (impacto desprezível em desenvolvimento).
  - A latência residual de I/O associada à sincronização do OneDrive só pode ser completamente eliminada se o repositório for clonado fora da pasta do OneDrive.

---

## 4. Critérios de Aceitação
- [x] Quando o frontend for acedido em `http://localhost:3002` ou `http://127.0.0.1:3002`, `API_BASE_URL` e `SOCKET_URL` resolvem para `http://127.0.0.1:3333`.
- [x] Quando o frontend for acedido via IP local (ex.: `http://192.168.x.x:3002`), `API_BASE_URL` continua a resolver para o IP local correspondente.
- [x] O container Docker do backend monta volumes isolados de caches e inicia o servidor sem erros de permissão ou caminho.
- [x] Requisições no DevTools do navegador não sofrem tempo de espera inicial (*Initial Connection*) superior a alguns milissegundos.
- [x] Validações técnicas (typecheck no frontend e backend) passam com sucesso via comandos `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Frontend:** Editar `frontend/src/config/constants.ts` para normalizar `localhost` -> `127.0.0.1`.
2. **Docker Compose:** Atualizar `backend/docker-compose.yml` para adicionar volume anônimo `/app/.prisma`.
3. **Validação Técnica:** Executar `rtk npm run typecheck` no frontend e no backend.
4. **Atualização Documental:** Concluir o checklist e registrar o status da tarefa.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` (Frontend) - 0 erros
- [x] `rtk npm run typecheck` (Backend) - 0 erros
- [x] `rtk npm run test:unit` (Backend) - 49 testes aprovados
- [x] Validação da normalização de hostname no frontend

---

## 7. Sincronização com /docs
- [x] Tarefa documentada em `docs/tasks/2026-09-13-otimizacao-rede-dns-io-docker.md`
- [x] Matriz de governança conferida em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
