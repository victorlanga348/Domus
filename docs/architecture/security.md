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

## 3. Políticas de Senhas, PIN e Rate Limiting
- **Simplificação de Cadastro (Eliminação do PIN no Onboarding):** O campo de PIN foi removido do formulário de cadastro web/mobile para eliminar fricção no onboarding. O backend preenche o campo obrigatório `pin_hash` com hash de fallback seguro (`0000`) de forma determinística e transparente (idêntico ao procedimento de login federado via Google OAuth). Caso necessário, o morador pode definir um PIN personalizado posteriormente nas preferências do perfil.
- **Rate Limit de PIN:** Máximo de 5 tentativas consecutivas incorretas por usuário em janela de 10 minutos na rota `/api/auth/verify-pin`.
- **PINs Fracos Proibidos:** Validação contra sequências óbvias (`0000`, `1234`, `1111`) em caso de definição explícita pelo usuário.

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

---

## 6. Rotação de Código de Convite, Esvaziamento e Reset de Papéis (Opção A)

### 6.1 Acesso Exclusivo por Código Único Rotativo (`invite_code`)
- **Eliminação de Senhas de Residência (Opção A):** Residências utilizam o Código de Convite determinístico (`invite_code`, ex: `CASA-4892`, `@unique`) como chave de acesso comunitário. Não há senha secundária de casa, minimizando fricção e falhas de memorização.
- **Proteção por Rotação:** O `Admin Geral` possui autoridade exclusiva para rotacionar o código via `POST /api/houses/:id/regenerate-code`. A rotação invalida o código anterior instantaneamente e notifica os clientes conectados via WebSocket (`house:code_regenerated`), garantindo controle rigoroso em caso de compartilhamento indevido.
- **Proteção Contra Vazamento de Código para Ex-Membros:** Ao sair da residência (`leaveHouse`), o usuário perde o vínculo (`house_id = null`), o código da casa deixa de ser acessível em qualquer tela do aplicativo e a seção de casas salvas é ocultada. Para retornar, o usuário é estritamente obrigado a redigitar o código de convite atual da residência.

### 6.2 Prevenção de Registros Órfãos (Exclusão Automática de Casa Vazia)
- Ao desvincular o último morador de uma residência (`otherMembersCount === 0`), o backend executa transação atômica que apaga o registro da casa e dispara exclusão em cascata (`onDelete: Cascade`) de tarefas, logs e configurações associadas, impedindo residências órfãs no PostgreSQL.

### 6.3 Princípio do Menor Privilégio & Reset de Papel no Reingresso
- Ao sair da residência (`leaveHouse`), o vínculo do usuário é desfeito (`house_id = null`) e sua role é redefinida para `MEMBER`.
- Ao reingressar via submissão do código de convite (`joinHouse`), qualquer usuário (mesmo que tenha sido Admin anteriormente) ingressa estritamente como **Morador** (`role: 'MEMBER'`). Privilégios administrativos só podem ser restabelecidos por ação deliberada do `Admin Geral` ativo.

### 6.4 Bloqueio de Alternância de Residência para Admin Geral Ativo (`switchHouse`)
- O **Admin Geral** não pode alternar para outra residência (`switchHouse`) enquanto existirem outros moradores vinculados à residência atual sem antes transferir formalmente a liderança.
- **Backend:** A rota `POST /api/houses/switch` intercepta e rejeita a tentativa com status `403 Forbidden` (`CANNOT_SWITCH_HOUSE_AS_GENERAL_ADMIN`).
- **Frontend:** O método centralizador `handleSwitchHouse()` verifica a role do usuário e a presença de outros integrantes, exibindo notificação explicativa e impedindo a navegação antes da transferência de cargo.

---

## 7. Controle de Acesso Baseado em Papéis (RBAC): Tarefas & Membros

### 7.1 Blindagem de Conclusão de Tarefas
- **Propriedade da Execução:** Apenas o morador expressamente atribuído à tarefa direcionada ou o residente ativo no turno de rodízio possui autorização para dar baixa.
- **Validação de Backend:** A API intercepta tentativas de terceiros com `403 Forbidden` (`FORBIDDEN_TASK_COMPLETION`).
- **Defesa em Profundidade no Frontend:** A interface orienta o usuário renderizando o botão em cinza inativo com tooltip explicativo, prevenindo frustrações.

### 7.2 Governança de Reversão de Tarefas Concluídas
- **Autoridade Restrita:** Apenas o **Admin Geral** e os **Sub-Admins** possuem permissão para cancelar ou reverter tarefas concluídas (`PATCH /api/tasks/:id/revert`).
- **Bloqueio de Moradores:** Moradores comuns não visualizam opções de reversão e são bloqueados pelo backend com `403 Forbidden` (`FORBIDDEN_TASK_REVERT`).
- **Auditoria Permanente:** Toda reversão gera registro imutável em `ActivityLog`.

### 7.3 Restrição de Adição de Novos Moradores
- **Proibição a Moradores Comuns:** Membros regulares (`Resident`, `Guest`) não têm acesso a botões, formulários ou rotas de inclusão de novos usuários na residência.
- **Permissão Exclusiva:** Apenas **Admin Geral** e **Sub-Admins** podem convidar ou cadastrar novos integrantes.
