# Arquitetura de Software & Stack Técnica (DOMUS)

## 1. Visão Geral da Arquitetura
O DOMUS é estruturado em **Modular Layered/Clean Architecture** no backend e **Feature-based Architecture** no frontend, orquestrado como um **Monorepo com NPM Workspaces** (`frontend/` e `backend/`).

### 1.1 Backend (Node.js / Express / TypeScript - 3 Camadas Modulares)
```text
backend/src/
├── @types/             # Extensões globais de tipos do TypeScript
├── config/             # Variáveis de ambiente e inicialização de libs (env.ts, logger.ts)
├── modules/            # Organização por domínio/funcionalidade
│   ├── auth/
│   ├── users/
│   ├── houses/
│   ├── tasks/
│   └── activity-logs/
│       ├── [module].controller.ts  # Entrada HTTP (req, res, status codes)
│       ├── [module].service.ts     # Regras de negócio e validações lógicas
│       ├── [module].repository.ts  # Chamadas ao ORM / consultas ao banco
│       ├── [module].schemas.ts     # Validação de schema (Zod)
│       └── [module].routes.ts      # Declaração das rotas do módulo
├── shared/             # Recursos reutilizáveis em toda a aplicação
│   ├── errors/         # Classes de erro customizadas (AppError.ts)
│   ├── middlewares/    # Autenticação, rate limiter, error handler central
│   └── utils/          # Funções utilitárias e helpers
├── database/           # Conexão com banco, client do ORM e seeds
├── app.ts              # Configuração dos middlewares globais e rotas
└── server.ts           # Inicialização do servidor HTTP e portas
```

### 1.2 Frontend (React / Vite / TypeScript - Feature-Based)
```text
frontend/src/
├── assets/             # Imagens estáticas, SVGs, fontes e ícones locais
├── components/         # Componentes atômicos e globais (UI Kit: Button, Modal, Input)
├── config/             # Configurações globais (rotas, constantes do sistema)
├── features/           # Módulos isolados por funcionalidade
│   ├── auth/
│   ├── dashboard/
│   ├── tasks-rotation/
│   ├── wallet/
│   ├── reports/
│   └── settings/
│       ├── api/        # Requisições específicas da feature
│       ├── components/ # Componentes exclusivos da feature
│       ├── hooks/      # Hooks específicos da feature
│       └── types/      # Tipagens exclusivas do domínio
├── hooks/              # Custom hooks genéricos/globais (ex: useDebounce, useTheme)
├── layouts/            # Estruturas compartilhadas (ex: RootLayout, Sidebar, Header)
├── lib/                # Configuração de clientes terceiros (ex: apiClient.ts)
├── routes/             # Definição e proteção do roteador
├── services/           # Serviços compartilhados de infraestrutura
├── styles/             # Configurações globais de CSS/Tailwind
└── types/              # Tipagens compartilhadas da aplicação
```

### 1.3 Princípios Chave de Engenharia
1. **Separação de Preocupações:** O controller nunca executa queries diretas no banco de dados; a responsabilidade de persistência pertence estritamente ao repository.
2. **Colocação (Colocation):** Arquivos que mudam juntos residem o mais próximo possível dentro do seu respectivo módulo/feature.
3. **Camada Compartilhada Estrita:** Componentes, hooks ou utilitários só são movidos para `shared/` ou `components/` globais se utilizados por dois ou mais módulos distintos.

---

## 2. Tecnologias & Bibliotecas

### Frontend
- **Framework:** React 19 + TypeScript
- **Bundler / Dev Server:** Vite
- **Estilização:** Tailwind CSS + CSS Variables
- **Ícones:** `lucide-react`
- **Controle de Estado:** React Hooks locais com elevação de estado e sincronização com API

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express + TypeScript
- **Criptografia & Auth:** JWT + Argon2 / Bcrypt para PINs
- **Banco de Dados / ORM:** Planejado para Prisma ORM (PostgreSQL / SQLite)
- **Validação de Schemas:** Zod

---

## 3. Padrões de Qualidade
1. **Tipagem Estrita:** `strict: true` ativado em `tsconfig.json` de ambos os pacotes.
2. **Zero Invenção de Contratos:** Todas as interfaces TypeScript em `frontend/src/types.ts` e `backend/src/core/` devem derivar estritamente de [docs/architecture/data-model.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/architecture/data-model.md) e [docs/integrations/api-contracts.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/integrations/api-contracts.md).
