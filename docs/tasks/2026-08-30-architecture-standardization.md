# Task: Padronização Arquitetural Modular (Layered Backend & Feature-Based Frontend)
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/architecture/stack.md]]`, `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
A estrutura atual do repositório possuía:
- **Backend:** Organização técnica plana (`api/`, `core/`, `infra/`, `shared/`) que dificultava o isolamento de domínios à medida que novos recursos (ex: `tasks`, `users`, `houses`, `activity-logs`) são expandidos.
- **Frontend:** Estrutura plana em `components/` onde todas as visualizações (`DashboardView`, `TasksRotationsView`, `WalletView`, `ReportsView`, `SettingsView`, `Modals`) compartilhavam o mesmo escopo sem isolamento de estado, tipos e hooks por domínio.

---

## 2. Solução Proposta

### 2.1 Backend (Modular Layered / Clean Architecture)
```text
backend/src/
├── @types/             # Extensões globais de tipos do TypeScript
├── config/             # Variáveis de ambiente e inicialização de libs
├── modules/            # Organização isolada por domínio
│   ├── auth/
│   ├── users/
│   ├── houses/
│   ├── tasks/
│   └── activity-logs/
│       ├── [module].controller.ts  # Entrada HTTP (req, res, status)
│       ├── [module].service.ts     # Regras de negócio e validações
│       ├── [module].repository.ts  # Consultas Prisma / Persistência
│       ├── [module].schemas.ts     # Schemas Zod de entrada/saída
│       └── [module].routes.ts      # Rotas Express do módulo
├── shared/             # Recursos transversais reutilizáveis
│   ├── errors/         # Classes de erro customizadas (AppError)
│   ├── middlewares/    # Auth, rate limiter, error handler central
│   └── utils/          # Helpers puros
├── database/           # Prisma client, migrations e seeds
├── app.ts              # Setup de middlewares globais e rotas
└── server.ts           # Bootstrap e inicialização HTTP
```

### 2.2 Frontend (Feature-Based Architecture)
```text
frontend/src/
├── assets/             # SVGs, ícones e mídias estáticas
├── components/         # UI Kit genérico/atômico (Button, Input, Modal, Badge)
├── config/             # Constantes globais e configurações de ambiente
├── features/           # Módulos verticais por funcionalidade
│   ├── auth/
│   ├── dashboard/
│   ├── tasks-rotation/
│   ├── wallet/
│   ├── reports/
│   └── settings/
│       ├── api/        # Endpoints e fetchers específicos da feature
│       ├── components/ # Componentes exclusivos da feature
│       ├── hooks/      # Hooks locais da feature
│       └── types/      # Tipagens exclusivos do domínio
├── hooks/              # Custom hooks globais
├── layouts/            # Estruturas compartilhadas (RootLayout, Sidebar, Header)
├── lib/                # Clientes e instâncias terceiras (API client)
├── routes/             # Roteador e guardas de rota
├── services/           # Serviços de infraestrutura compartilhados
├── styles/             # Configurações globais de CSS/Tailwind
└── types/              # Tipagens compartilhadas da aplicação
```

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Alto desacoplamento e isolamento de escopo (Colocation).
  - Facilidade de navegação e manutenção sem pastas globais inchadas.
  - Testabilidade unitária e de integração simplificada por módulo/feature.
  - Eliminação de acoplamento indevido entre controllers e queries diretas.
- **Desvantagens / Riscos:**
  - Refatoração de caminhos de importação (`paths`/`aliases`).
  - Necessidade de migração incremental para não quebrar o build e os testes em andamento.

---

## 4. Critérios de Aceitação
- [x] Documentação de arquitetura em [docs/architecture/stack.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/architecture/stack.md) atualizada com a nova árvore padrão.
- [x] Backend estruturado em `modules/`, `shared/`, `database/`, `app.ts` e `server.ts`.
- [x] Frontend estruturado em `features/`, `components/`, `layouts/`, `hooks/`, `lib/`, `types/`.
- [x] Zero dependência circular entre módulos.
- [x] Typecheck e Build de ambos os pacotes passando sem erros.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Docs:** Atualizar [docs/architecture/stack.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/architecture/stack.md) refletindo a decisão arquitetural oficial.
2. **Backend:**
   - Criar `src/app.ts` e `src/server.ts` a partir de `src/index.ts`.
   - Migrar `src/infra/database/` para `src/database/`.
   - Reestruturar `src/core/` e `src/api/` dentro de `src/modules/<modulo>/`.
3. **Frontend:**
   - Mover views de `src/components/` para `src/features/<modulo>/components/`.
   - Mover `Sidebar.tsx` e `Header.tsx` para `src/layouts/`.
   - Manter componentes base em `src/components/`.
4. **Validação:**
   - Executar `rtk npm run typecheck` e `rtk npm run build` no backend e frontend.
