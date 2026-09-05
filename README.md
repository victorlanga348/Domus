> Este repositório é público apenas para demonstração. O uso, cópia ou reutilização do código não é permitido sem autorização.

# 🚀 Domus - Gestão Doméstica Inteligente & Colaborativa

Aplicação Full Stack para coordenação e gestão de rotinas residenciais e repúblicas, englobando distribuição e rodízio automatizado de tarefas por turnos operacionais, controle de concorrência com locks temporizados de execução, mural de avisos comunitário (bulletin board), salas privadas com controle de papéis (Arquiteto/Membro), histórico de atividades em tempo real via WebSockets e relatórios de produtividade doméstica.

Desenvolvido com foco em alta performance, Type Safety (TypeScript de ponta a ponta no monorepo), segurança de dados multi-tenant e uma experiência de usuário (UX) premium com animações modernas, modo escuro e design responsivo adaptado para dispositivos móveis e tablets de bancada.

---

## 🧠 Decisões de Arquitetura

### **1. Algoritmo de Rodízio Seletivo & Salto Inteligente de Férias (`Vacation Skip`)**
Em vez de escalas lineares ou globais, cada tarefa no Domus possui seu próprio pool de participantes ordenados de forma determinística e canônica (A-Z). Ao concluir a tarefa, o índice de rotação avança de modo circular ($(\text{current} + 1) \pmod N$) consultando dinamicamente o status de ausência (`vacation_mode`). Moradores em férias são saltados (*skipped*) automaticamente sem corromper o histórico da residência, garantindo equidade e fluidez na rotina doméstica.

### **2. Controle de Concorrência via Locks Temporizados (45 Minutos) & Stale Lock Cleanup**
Para evitar duplicidade de esforço operacional (ex: dois moradores realizarem a mesma limpeza simultaneamente), tarefas em execução entram no estado `LOCKED`. O sistema orquestra essa concorrência em duas vias: verificação atômica em tempo de leitura/execução e um background job periódico que identifica tarefas travadas há mais de 45 minutos sem conclusão, liberando-as automaticamente para o estado `OPEN` e notificando a residência via WebSocket.

### **3. Sincronização Reativa em Tempo Real com WebSockets (Socket.io)**
Eventos críticos de convivência — como reivindicação de tarefas (`task:locked`), conclusões, relatos de impedimentos (`task:blocked`), avisos no mural e destrancamentos automáticos — são despachados instantaneamente para a sala da residência (`houseId`). Isso mantém todos os dispositivos (celulares de moradores e tablets comunitários fixos na bancada) perfeitamente sincronizados sem necessidade de polling excessivo.

### **4. Arquitetura Modular em Três Camadas no Backend (Clean Architecture / Domain Modules)**
O servidor Express é estruturado rigorosamente por domínios (`auth`, `houses`, `tasks`, `rooms`, `activity-logs`):
- **Routes**: Roteamento desacoplado e proteção por middlewares.
- **Controllers**: Controle de fluxo HTTP, extração de parâmetros e respostas formatadas.
- **Services**: Lógica de negócio pura, validações de regra e coordenação transacional.
- **Database / Prisma ORM**: Persistência tipada e isolamento estrito com transações atômicas (`$transaction`).

---

## 🔒 Pontos Técnicos e Segurança

- **Isolamento Multi-tenant Rigoroso:** Toda e qualquer ação de leitura ou escrita valida obrigatoriamente a residência (`houseId`) e a identidade do usuário (`userId`) extraídos do token JWT validado. Um morador jamais consegue acessar tarefas, salas, murais ou histórico de outra residência.
- **Autenticação em Duas Etapas (2FA Doméstico) & Google OAuth:** Arquitetura desenhada para dispositivos compartilhados (Passo 1: Código exclusivo da casa `invite_code` + Passo 2: Seleção de morador com PIN numérico de 4 a 6 dígitos protegido por hash Bcrypt) e suporte à autenticação federada Google com validação de tokens via `google-auth-library`.
- **Controle de Acesso Baseado em Papéis (RBAC):** Restrições estritas de permissão no backend (`ADMIN`, `ARCHITECT`, `MEMBER`). Conclusão restrita ao responsável da vez, reversão de tarefas finalizadas restrita a administradores e salas privadas protegidas por senha criptografada onde apenas o Arquiteto fundador pode gerenciar participantes.
- **UUIDs v4:** Identificadores únicos universais em todas as tabelas relacionais (`House`, `User`, `Task`, `Room`, `ActivityLog`), impossibilitando a previsão sequencial de registros por agentes maliciosos.
- **Transações ACID Garantidas & Deleção em Cascata:** Operações sensíveis — como a desvinculação do último morador de uma residência (`onDelete: Cascade`) ou reatribuições em lote — utilizam transações no banco para garantir que remoções ou atualizações ocorram de forma atômica, prevenindo registros órfãos.
- **Rate Limiting de PIN & Prevenção de Força Bruta:** Proteção de endpoints sensíveis através do `express-rate-limit`, bloqueando tentativas sucessivas incorretas de PIN numérico em curtos intervalos de tempo.

---

## 🛠️ Tecnologias Utilizadas

### **Backend (Node.js & Express)**
- **Express & TypeScript:** API REST modular, fortemente tipada e com arquitetura em camadas.
- **Prisma ORM:** Abstração, migrações e modelagem relacional type-safe.
- **PostgreSQL:** Banco de dados relacional robusto.
- **Socket.io:** Comunicação bidirecional e eventos em tempo real.
- **JWT (JSON Web Token):** Autenticação stateless e gerenciamento seguro de sessões.
- **Bcrypt.js:** Hashing criptográfico unidirecional para senhas e PINs de acesso rápido.
- **Google Auth Library:** Verificação de tokens do Google Identity Services.
- **Express Rate Limit:** Mitigação de abusos e ataques de força bruta.

### **Frontend (React, TypeScript & Vite)**
- **React 19:** Componentização declarativa de alta performance.
- **TypeScript 5.8:** Type safety estrito de ponta a ponta.
- **Vite 6:** Ferramenta moderna de compilação e bundler ultrarrápido.
- **Tailwind CSS 4:** Framework utilitário de estilização com variáveis CSS nativas.
- **Motion (Framer Motion):** Micro-interações, transições fluidas e animações táteis de interface.
- **Socket.io Client:** Consumo e sincronização reativa de eventos em tempo real.
- **Lucide React:** Iconografia consistente e moderna.
- **Canvas Confetti:** Feedback visual lúdico na conclusão de rotinas e tarefas.
- **Google Gemini AI (`@google/genai`):** Assistente inteligente para sugestões e organização do lar.

---

## 🔒 Destaques de Engenharia e UX

### **1. Feedback Visual Lúdico & Gamificação da Rotina Doméstica 🎉**
A conclusão de uma tarefa de casa aciona animações fluidas via `motion` combinadas com uma chuva de partículas (`canvas-confetti`). Essa micro-interação proporciona reforço positivo imediato para os moradores, transformando o cumprimento de deveres domésticos em uma experiência recompensadora e colaborativa.

### **2. Interface Otimizada para Tablets de Bancada e Telas Touch (Touch-First)**
Projetado para telas fixas comunitárias (como tablets na cozinha) e celulares: alvos de toque generosos (mínimo de 44x44px), teclado numérico dedicado para inserção ágil de PIN, contêineres blindados contra quebras de texto/overflow e suporte fluido a Dark/Light mode com persistência de preferências.

### **3. Resolução Dinâmica de Rede Local (Zero-Config LAN Development)**
O backend e o Socket.io realizam bind em `0.0.0.0` e os serviços no frontend identificam o host em execução dinamicamente via `window.location.hostname`. Isso permite que múltiplos moradores ou desenvolvedores testem e utilizem a aplicação simultaneamente na mesma rede Wi-Fi através de seus próprios celulares sem erros de CORS ou necessidade de configuração estática de IPs.

---

## 📋 Principais Funcionalidades

- [x] **Gestão de Tarefas & Rodízio Inteligente**: Cadastro com divisão por turnos (Manhã, Tarde, Noite), frequências (Diária, Semanal, Mensal) e pool selecionável de participantes.
- [x] **Lock de Execução (Prevenção de Concorrência)**: Bloqueio de 45 minutos para tarefas assumidas, evitando que duas pessoas façam o mesmo trabalho simultaneamente.
- [x] **Reporte de Impedimentos (Bloqueios)**: Registro de motivos para tarefas que não puderam ser concluídas (ex: falta de produto de limpeza) com alerta automático para a casa.
- [x] **Modo Férias (`Vacation Mode`)**: Pausa temporária na escala com salto automático de moradores ausentes no rodízio.
- [x] **Salas Temáticas Privadas**: Espaços reservados com proteção por senha criptografada e controle hierárquico (cargo de Arquiteto para o criador da sala).
- [x] **Mural de Avisos Comunitário**: Publicação de notas, recados rápidos e lembretes para todos os residentes.
- [x] **Feed de Auditoria em Tempo Real (`Activity Log`)**: Histórico cronológico e imutável de todas as ações executadas na casa.
- [x] **Assistente com Inteligência Artificial**: Sugestões e automações para rotinas domésticas integradas com a API do Google Gemini.

---

## 📂 Estrutura do Projeto

```text
├── backend/                  # API RESTful em Express & Prisma ORM
│   ├── prisma/               # Schema PostgreSQL e Migrations
│   │   └── schema.prisma     # Modelos (House, User, Task, Room, ActivityLog...)
│   ├── src/
│   │   ├── config/           # Variáveis de ambiente e inicialização
│   │   ├── database/         # Prisma Client e conexões com o banco
│   │   ├── modules/          # Módulos de domínio (auth, users, houses, tasks, rooms...)
│   │   │   ├── auth/         # Autenticação JWT, PIN hash e Google OAuth
│   │   │   ├── tasks/        # Gestão de tarefas, locks e rodízio
│   │   │   ├── houses/       # Gestão de residências e códigos de convite
│   │   │   ├── rooms/        # Salas privadas e controle de acesso
│   │   │   └── activity-logs/# Auditoria e registro de eventos
│   │   ├── shared/           # Middlewares (Auth, ErrorHandler, RateLimit) e utilitários
│   │   ├── app.ts            # Configuração do Express, CORS e rotas
│   │   └── server.ts         # Inicialização do servidor HTTP e Socket.io
│   └── tests/                # Testes unitários e de integração
├── frontend/                 # Client SPA em React 19 & Vite 6
│   ├── src/
│   │   ├── components/       # Componentes atômicos e globais (UI Kit, modais, cards)
│   │   ├── features/         # Módulos funcionais (auth, dashboard, tasks, rooms...)
│   │   ├── layouts/          # Estruturas compartilhadas (Header, Sidebar)
│   │   ├── styles/           # Tailwind CSS 4 e variáveis de design tokens
│   │   ├── types.ts          # Interfaces e contratos tipados do domínio
│   │   ├── App.tsx           # Ponto de montagem e roteamento de telas
│   │   └── main.tsx          # Ponto de entrada da aplicação Vite
└── docs/                     # Especificação oficial e governança técnica (SDD)
```

---

## 🚀 Como Rodar o Projeto

### **1. Clonar o repositório**
```bash
git clone https://github.com/victorlanga348/Domus.git
cd Domus
```

### **2. Configurar e rodar o Backend**
1. Acesse o diretório:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz da pasta `backend` baseado em `.env.example`:
   ```env
   PORT=3333
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3002
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/domus_db"
   JWT_SECRET="sua-chave-secreta-jwt-min-32-chars"
   HOUSEHOLD_CODE_SECRET="seu-household-code-salt"
   GOOGLE_CLIENT_ID="seu-google-client-id"
   ```
4. Aplique as migrations no banco de dados:
   ```bash
   npm run prisma:migrate
   ```
5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

### **3. Configurar e rodar o Frontend**
1. Acesse o diretório do frontend:
   ```bash
   cd ../frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz da pasta `frontend` com as variáveis necessárias:
   ```env
   GEMINI_API_KEY="sua_chave_gemini_aqui"
   VITE_GOOGLE_CLIENT_ID="seu-google-client-id"
   ```
4. Inicie o servidor local:
   ```bash
   npm run dev
   ```
5. Abra o navegador no endereço indicado (normalmente `http://localhost:3002`).

---

## ✍️ Autor

Desenvolvido por **Victor Langa** como um sistema completo, altamente seguro e performático para informatizar e coordenar rotinas residenciais e repúblicas, demonstrando proficiência no desenvolvimento Full Stack robusto, sincronização em tempo real via WebSockets, manipulação de bancos de dados relacionais e implementação de interfaces modernas de alta usabilidade.

## Licença e Direitos Autorais

Este projecto é público apenas para fins de demonstração e avaliação.

O código, design, documentação, arquitectura e lógica de negócio do Domus estão protegidos por direitos autorais.
