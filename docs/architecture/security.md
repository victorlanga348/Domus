# Segurança, Autenticação 2FA & Isolamento Multi-tenant

## 1. Fluxo de Autenticação em Duas Etapas (2FA Doméstico)

Para atender a dispositivos compartilhados (ex: tablet fixo na cozinha) e celulares pessoais:

```
[Passo 1: House Code] ──▶ [Passo 2: Perfil + PIN de 4-6 dígitos] ──▶ [JWT Bearer Token]
```

### 1.1 Fator 1 - House Code
- O usuário ou tablet informa o código da casa (ex: `DOMUS-9021`).
- O backend valida a existência da residência e retorna a lista pública de membros (`id`, `name`, `avatar`). Nenhuma informação sensível (hash de PIN, despesas, etc.) é exposta.

### 1.2 Fator 2 - Seleção de Membro + PIN
- O membro clica no seu avatar e digita seu PIN numérico (4 a 6 dígitos).
- O backend compara o PIN recebido contra o hash armazenado utilizando **Argon2id** ou **Bcrypt** (com salt apropriado).
- Em caso de sucesso, emite um JWT com claims de `userId`, `houseId` e `role`.

### 1.3 Autenticação Federada Google OAuth 2.0
- O frontend captura o ID Token emitido pelo Google Identity Services e envia via POST seguro (`/api/auth/google`).
- O backend valida a assinatura do ID Token usando a biblioteca oficial `google-auth-library` contra o `GOOGLE_CLIENT_ID` (`client.verifyIdToken`).
- O payload verificado extrai com integridade `email`, `name`, `picture` e `sub` (identificador único Google).
- O backend realiza upsert do usuário e gera o JWT de sessão oficial do DOMUS.

---

## 2. Isolamento Multi-tenant
- Todo middleware de autenticação extrai `houseId` e `userId` do token validado.
- Todas as consultas ao banco de dados no repositório DEVEM incluir a cláusula `WHERE houseId = :houseId` para garantir que membros de uma residência jamais acessem dados de outra.

---

## 3. Políticas de Senhas e Rate Limiting
- **Rate Limit de PIN:** Máximo de 5 tentativas consecutivas incorretas por usuário em janela de 10 minutos.
- **PINs Fracos Proibidos:** Validação contra sequências óbvias (`0000`, `1234`, `1111`).

---

## 4. Segurança de Salas & Papéis de Arquiteto (Room Security & RBAC)
- **Hash de Senha de Salas:** A senha da sala (`Room.password`) NUNCA é armazenada em texto plano. É processada via hash unidirecional seguro (`bcryptjs` com custo `saltRounds = 10`).
- **Verificação de Entrada:** A entrada na sala exige comparação criptográfica `bcrypt.compare(inputPassword, room.password)`.
- **Privilégios de Arquiteto (`ARCHITECT`):**
  - O criador da sala recebe automaticamente o cargo `ARCHITECT` na tabela `Participant`.
  - Apenas usuários com role `ARCHITECT` na sala em questão possuem autorização para executar a rota de promoção (`PATCH /api/rooms/:id/members/:userId/role`) e gerenciar permissões internas da sala.
  - O middleware `checkRole` intercepta e bloqueia requisições de membros comuns (`MEMBER`) com status `403 Forbidden`.

---

## 5. Políticas de CORS & Rede Local (LAN Development)
- **Produção:** Origem estritamente validada via variável de ambiente `CORS_ORIGIN` com `credentials: true`.
- **Ambiente de Desenvolvimento & Testes Mobile na LAN:**
  - O backend permite requisições originadas de `localhost`, `127.0.0.1` e faixas de IP privadas locais (`192.168.0.0/16`, `10.0.0.0/8`, `172.16.0.0/12`) em qualquer porta, refletindo o cabeçalho `Origin` na resposta com `Access-Control-Allow-Credentials: true`.
  - O servidor HTTP e Socket.io realizam bind em `0.0.0.0` para responder a conexões de smartphones e tablets conectados ao mesmo Wi-Fi.
  - O frontend resolve `API_BASE_URL` e `SOCKET_URL` dinamicamente baseado no `window.location.hostname`, mantendo sincronização de dados transparente entre desktop e mobile.
