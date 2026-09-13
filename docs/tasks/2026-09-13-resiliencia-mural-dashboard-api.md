# Task: Resiliência e Tratamento Seguro no Mural de Recados (Dashboard API & UI)
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/reports-and-metrics.md]]`, `[[docs/tasks/2026-09-13-otimizacao-rede-dns-io-docker.md]]`

---

## 1. Contexto & Problema
No módulo do Mural de Recados do Dashboard:
1. **Tratamento Frágil de Resposta no `dashboardApi.ts`:** `response.json()` era invocado sem proteção de parse (`.catch()`) antes de checar `response.ok`. Se o servidor retornasse HTML de erro (ex: proxy 502/504) ou payload vazio, um `SyntaxError` genérico era lançado, mascarando a real causa do erro.
2. **Ausência de Cabeçalho de Autenticação Padronizado:** O `dashboardApi.createBulletinPost` e `dashboardApi.deleteBulletinPost` enviavam apenas os headers de compatibilidade `x-house-id` e `x-user-id`, omitindo o cabeçalho `Authorization: Bearer <token>` presente nas demais APIs do sistema.
3. **Rollback Destrutivo e Perda de Dados do Usuário:** Em caso de falha de conexão na persistência (`App.tsx`), o recado otimista era removido e mensagens cruas como `"Failed to fetch"` eram repassadas ao usuário em toasts truncados.

---

## 2. Solução Proposta
1. **API Client (`frontend/src/features/dashboard/api/dashboardApi.ts`):**
   - Implementado parse seguro de JSON (`await response.json().catch(() => ({}))`).
   - Adicionado parâmetro opcional de `token?: string` para envio do cabeçalho `Authorization: Bearer <token>` nas operações do mural.
   - Retorno de mensagens de erro normalizadas e amigáveis quando houver falha de rede ou HTTP.
2. **Integração de Estado e Rollback (`frontend/src/App.tsx` & `DashboardView.tsx`):**
   - Passagem de `authToken` para `dashboardApi.createBulletinPost`, `dashboardApi.deleteBulletinPost` e `dashboardApi.getDashboardData`.
   - Normalização da mensagem de erro capturada (mapeamento de `Failed to fetch` para `"Falha de conexão com o servidor. Verifique se o backend está ativo."`).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Robustez a falhas de rede intermitentes.
  - Segurança aprimorada com transmissão consistente de tokens JWT.
  - Experiência do usuário aprimorada com mensagens legíveis e sem travamento por `SyntaxError`.
- **Desvantagens / Riscos:**
  - Nenhuma; compatibilidade mantida via parâmetros opcionais.

---

## 4. Critérios de Aceitação
- [x] Chamadas em `dashboardApi.ts` tratam falhas de parse de JSON sem quebrar a aplicação com `SyntaxError`.
- [x] O cabeçalho `Authorization: Bearer <token>` é enviado quando o token estiver disponível na sessão.
- [x] Mensagens amigáveis são exibidas ao usuário em caso de erro de rede, sem toasts com `"Failed to fetch"`.
- [x] O fluxo otimista continua funcionando com 0ms de latência percebida quando a conexão é bem-sucedida.
- [x] Typecheck do frontend e do backend passam com zero erros via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Atualizar `frontend/src/features/dashboard/api/dashboardApi.ts`:**
   - Adicionar tratamento com `.catch(() => ({}))` em `getDashboardData`, `createBulletinPost` e `deleteBulletinPost`.
   - Incluir suporte ao cabeçalho `Authorization`.
2. **Atualizar `frontend/src/App.tsx` e `DashboardView.tsx`:**
   - Enviar `authToken` na chamada de criação e exclusão de recados.
   - Tratar a mensagem de erro para que erros de rede sejam legíveis para o usuário.
3. **Validação Técnica:**
   - Executar `rtk npm run typecheck` no frontend e no backend.
   - Executar testes unitários do backend via `rtk`.
4. **Atualização Documental e Commit:**
   - Marcar a tarefa como concluída em `/docs/tasks/` e realizar commit em português.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` (Frontend) - 0 erros
- [x] `rtk npm run typecheck` (Backend) - 0 erros
- [x] `rtk npm run test:unit` (Backend) - 49 testes aprovados

---

## 7. Sincronização com /docs
- [x] Tarefa documentada em `docs/tasks/2026-09-13-resiliencia-mural-dashboard-api.md`
- [x] Matriz de governança conferida em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
