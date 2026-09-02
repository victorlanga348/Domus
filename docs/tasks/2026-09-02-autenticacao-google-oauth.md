# Task: Autenticação com Google OAuth (Backend Node.js/Express/Prisma & Frontend)
**Data:** 2026-09-02  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/auth-onboarding.md]]`, `[[docs/architecture/security.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema

Atualmente, o sistema DOMUS conta apenas com autenticação local via e-mail/senha e PIN. O usuário solicitou a adição oficial do **Login com Google** (Google OAuth 2.0 / Google Identity Services) preservando o design sereno e limpo da plataforma.

A solução precisa:
1. **No Backend:**
   - Instalar `google-auth-library`.
   - Criar o endpoint `POST /api/auth/google` (e compatibilidade `/v1/auth/google`).
   - Validar com segurança o `credential` (ID Token JWT gerado pelo Google) contra o `GOOGLE_CLIENT_ID` via `OAuth2Client.verifyIdToken`.
   - Realizar `upsert` no Prisma (`prisma.user.upsert` por e-mail), atualizando ou criando o morador com `name`, `email` e `avatar_url` (`payload.picture`), garantindo hashes seguros para os campos obrigatórios `password_hash` e `pin_hash`.
   - Gerar o token JWT de sessão da própria aplicação com `JWT_SECRET` e retornar `{ token, user }`.
   - Tratar erros de token inválido (401), requisições malformadas (400) e indisponibilidade (500).
   - Documentar `GOOGLE_CLIENT_ID` no `.env.example`.
2. **No Frontend:**
   - Adicionar o botão oficial "Continuar com o Google" em `AuthView.tsx` com o logo oficial da marca Google em SVG vetorial sem distorção.
   - Incluir separador sutil ("ou continue com e-mail").
   - Integrar o Google Identity Services SDK (`https://accounts.google.com/gsi/client`) em `index.html` com suporte nativo e fallback robusto.
   - Ao receber o token do Google, enviar para `authApi.googleLogin(credential)`.
   - Armazenar o token de sessão localmente e alimentar dinamicamente o estado global de usuário (`authUser`).
   - Atualizar a área de perfil no topo da barra lateral (`Sidebar.tsx`) com o avatar, nome e e-mail retornados do Google.
   - Tratar estados de loading no botão e mensagens amigáveis em caso de falha.

---

## 2. Solução Proposta

1. **Dependências Backend:**
   - Instalar `google-auth-library` no diretório `backend`.
   - Adicionar `GOOGLE_CLIENT_ID` em `backend/src/config/env.ts` e `backend/.env.example`.
2. **Endpoint `POST /api/auth/google`:**
   - Em `backend/src/modules/auth/auth.service.ts`: método `googleLogin(credential: string)` que inicializa `OAuth2Client`, chama `verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID })`, extrai `{ email, name, picture, sub }`, executa `prisma.user.upsert` e assina JWT com validade de 7 dias.
   - Em `backend/src/modules/auth/auth.controller.ts`: método `googleLogin` com status 200.
   - Em `backend/src/modules/auth/auth.routes.ts`: rota `authRoutes.post('/google', authLimiter, controller.googleLogin)`.
3. **Prisma & Banco de Dados:**
   - Adicionar `avatar_url String?` e `google_id String? @unique` ao modelo `User` em `backend/src/database/schema.prisma`.
   - Executar `rtk npm run prisma:generate` para atualizar o client do Prisma.
4. **Frontend Integration:**
   - Em `frontend/index.html`: carregar o SDK oficial do Google Identity Services (`<script src="https://accounts.google.com/gsi/client" async defer></script>`).
   - Em `frontend/src/features/auth/api/authApi.ts`: adicionar o método `googleLogin(credential: string): Promise<AuthResponse>` apontando para `${APP_CONFIG.API_BASE_URL}/auth/google`.
   - Em `frontend/src/features/auth/components/AuthView.tsx`:
     - Renderizar botão oficial de alta fidelidade "Continuar com o Google" com logo SVG oficial e estados de loading.
     - Linha divisória sutil com texto `"ou continue com e-mail"`.
     - Manipulador de callback que aciona `authApi.googleLogin` e notifica o `onAuthSuccess`.
   - Em `frontend/src/App.tsx`:
     - Garantir que `currentUser.avatar` priorize `authUser.avatar_url || authUser.avatar` antes dos avatares padrão, refletindo a foto do Google no topo da barra lateral.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - Login seguro e rápido em 1 clique para usuários do Google.
  - Foto de perfil e dados reais do morador sincronizados automaticamente.
  - ID Token validado criptograficamente pelo servidor com a biblioteca oficial do Google.
  - Zero atrito de criação de senhas para novos usuários.
- **Desvantagens / Riscos:**
  - Se a variável `GOOGLE_CLIENT_ID` não estiver configurada no ambiente, o backend rejeita o token do Google e o frontend deve apresentar mensagem clara e orientativa.
  - Usuários que logam exclusivamente com Google não têm senha tradicional; caso tentem o formulário com senha, o sistema os orientará a continuar com o Google.

---

## 4. Critérios de Aceitação

- [x] `POST /api/auth/google` implementado no backend e validando ID Tokens com `OAuth2Client.verifyIdToken`.
- [x] Usuário é criado ou atualizado no banco via `upsert` com `name`, `email`, `avatar_url` e `google_id`.
- [x] JWT da aplicação é emitido e retornado com sucesso `{ token, user }`.
- [x] Resposta de erro adequada: 400 se `credential` ausente, 401 se token for inválido/expirado.
- [x] `GOOGLE_CLIENT_ID` documentado em `backend/.env.example` e `frontend/.env.example`.
- [x] Botão oficial do Google presente em `AuthView.tsx` com logotipo oficial SVG e divisor sutil.
- [x] O avatar retornado pelo Google é exibido no topo da barra lateral (`Sidebar.tsx`).
- [x] `rtk npm run typecheck` e `rtk npm run build` passam sem erros no backend e frontend.
- [x] Specs de `/docs` sincronizadas.

---

## 5. Plano de Implementação (Passo a Passo)

1. [x] **Documentação & Specs:**
   - Atualizar `docs/pages/auth-onboarding.md`, `docs/architecture/security.md` e `docs/integrations/api-contracts.md`.
2. [x] **Backend - Dependências & Config:**
   - Instalar `google-auth-library` no backend via `rtk npm install google-auth-library`.
   - Adicionar `GOOGLE_CLIENT_ID` em `backend/src/config/env.ts` e `backend/.env.example`.
3. [x] **Backend - Schema Prisma:**
   - Adicionar `avatar_url` e `google_id` ao modelo `User` em `backend/src/database/schema.prisma`.
   - Executar `rtk npm run prisma:generate`.
4. [x] **Backend - Serviço, Controller e Rotas:**
   - Implementar `AuthService.googleLogin` em `backend/src/modules/auth/auth.service.ts`.
   - Adicionar `AuthController.googleLogin` em `backend/src/modules/auth/auth.controller.ts`.
   - Mapear rota em `backend/src/modules/auth/auth.routes.ts`.
5. [x] **Frontend - SDK e API Client:**
   - Adicionar script Google Identity Services em `frontend/index.html`.
   - Adicionar `googleLogin` em `frontend/src/features/auth/api/authApi.ts`.
   - Adicionar `VITE_GOOGLE_CLIENT_ID` em `frontend/.env.example`.
6. [x] **Frontend - UI do Botão e Fluxo de Sessão:**
   - Adicionar botão oficial e separador em `frontend/src/features/auth/components/AuthView.tsx`.
   - Integrar fluxo em `frontend/src/App.tsx` para garantir que o avatar do Google popule o perfil na barra lateral.
7. [x] **Validação Técnica e Testes:**
   - Executar typecheck e build no frontend e backend com prefixo `rtk`.
8. [x] **Sincronização e Commit:**
   - Atualizar status da tarefa para "Concluída".
   - Realizar commit em português conforme `AGENTS.md`.

---

## 6. Validação e Testes

- [x] `rtk npm run typecheck` no backend concluído com sucesso.
- [x] `rtk npm run typecheck` no frontend concluído com sucesso.
- [x] `rtk npm run build` no frontend concluído com sucesso.
- [x] Validação de integridade do payload de autenticação.

---

## 7. Sincronização com /docs

- [x] `docs/pages/auth-onboarding.md`
- [x] `docs/architecture/security.md`
- [x] `docs/integrations/api-contracts.md`
- [x] Matriz de impacto validada em `[[docs/documentation-governance.md]]`.
