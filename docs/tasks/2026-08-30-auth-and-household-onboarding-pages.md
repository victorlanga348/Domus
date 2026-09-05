# Task: Autenticação e Telas de Onboarding de Residência (Criar e Entrar em Sala/Residência)
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/auth-onboarding.md]]`, `[[docs/brand/identity.md]]`, `[[docs/design/tokens.md]]`, `[[docs/design/responsive.md]]`

---

## 1. Contexto & Problema
O DOMUS possui a identidade visual estabelecida para as telas de **Cadastro** (split-screen sofisticado com foto moderna e formulário), **Login** (card minimalista centralizado com Remember Me) e **Seleção de Residência** (cards de boas-vindas para "Criar Residência" e "Entrar em Residência").

Para completar o fluxo de acesso e onboarding sem quebrar a serenidade e sofisticação do frontend:
1. É necessária a **Página de Criar Residência/Sala**: que solicita o **Nome da Residência** e o **Código / Chave de Acesso**, com suporte a geração automática de código ou definição customizada.
2. É necessária a **Página de Entrar em Residência/Sala**: que solicita o **Nome da Residência** e o **Código de Convite / Chave**, com validação de formato e mensagens amigáveis.
3. É necessária a orquestração coesa de todas as telas (Cadastro -> Login -> Escolha -> Criar/Entrar -> Dashboard) mantendo rigorosamente os tokens visuais, tipografia `Inter`, ícones `Material Symbols Outlined`, paleta verde esmeralda/grafite (`#16302e`, `#f0fcfa`, `#e4f0ee`), cantos arredondados (`rounded-3xl` / `rounded-2xl`) e suporte mobile-first.

---

## 2. Solução Proposta

### 2.1 Módulo Frontend (`frontend/src/features/auth/`)
- **`CreateHouseholdView.tsx` (Página Criar Residência / Sala):**
  - Card estilizado sobre fundo sereno/moldura DOMUS.
  - Campos: Nome da Residência (com ícone `home` / `cottage`) + Código / Chave de Acesso (com ícone `vpn_key` / `tag` e botão de gerar código automático).
  - Botão de submissão `Criar Residência ->` em verde escuro institucional.
  - Botão secundário de navegação de volta para a tela de seleção.
- **`JoinHouseholdView.tsx` (Página Entrar em Residência / Sala):**
  - Card estilizado com a mesma identidade visual.
  - Campos: Nome da Residência (com ícone `search` / `home`) + Código de Convite (com ícone `vpn_key` / `pin`).
  - Botão de submissão `Entrar na Residência ->`.
  - Link de apoio caso o usuário não possua um código.
- **`HouseholdSelectionView.tsx` (Página Escolha / Lobby):**
  - Refinamento da tela dos 2 cards com ações interativas que direcionam para `CreateHouseholdView` e `JoinHouseholdView`.
- **`RegisterView.tsx` & `LoginView.tsx`:**
  - Componentes completos reproduzindo com fidelidade pixel-perfect as telas do design (split hero image e card de login) integrados ao roteamento/fluxo de estado do app.
- **Integração no `App.tsx`:**
  - Suporte a alternância de telas e demonstração do fluxo completo (Cadastro -> Login -> Seleção -> Criar/Entrar -> App Principal).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Fidelidade visual 100% alinhada aos mockups e screenshots fornecidos.
  - Modularidade clara em `src/features/auth/`.
  - Acessibilidade completa (labels semânticos, estados de foco e touch targets ≥ 44px).
  - Experiência fluida e intuitiva tanto em desktop quanto em mobile.
- **Desvantagens / Riscos:**
  - Gerenciamento de estado de tela precisa ser flexível para permitir testes rápidos e transição suave para o backend existente.

---

## 4. Critérios de Aceitação
- [x] Página "Criar Residência" implementada solicitando Nome e Código com validações e design idêntico ao padrão DOMUS.
- [x] Página "Entrar em Residência" implementada solicitando Nome e Código com validações e feedback de erro/sucesso.
- [x] Telas de Cadastro, Login e Escolha integradas ao fluxo completo de navegação.
- [x] Responsividade testada e validada em Mobile (375px), Tablet (768px) e Desktop (1280px+).
- [x] Typecheck (`rtk npm run lint` ou `rtk npx tsc --noEmit`) e build do frontend concluídos sem erros.
- [x] Documentação em `docs/pages/auth-onboarding.md` criada e referenciada.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Documentação SDD:**
   - Criar `docs/pages/auth-onboarding.md` detalhando regras de layout, campos, validações e contratos.
2. **Componentes de Auth / Onboarding:**
   - Criar `frontend/src/features/auth/types.ts`
   - Criar `frontend/src/features/auth/components/CreateHouseholdView.tsx`
   - Criar `frontend/src/features/auth/components/JoinHouseholdView.tsx`
   - Criar `frontend/src/features/auth/components/HouseholdSelectionView.tsx`
   - Criar `frontend/src/features/auth/components/LoginView.tsx`
   - Criar `frontend/src/features/auth/components/RegisterView.tsx`
   - Criar `frontend/src/features/auth/index.ts`
3. **Integração no App:**
   - Adicionar controle de autenticação/onboarding no `App.tsx` para navegação fluida entre telas.
4. **Validação & Testes:**
   - Executar typecheck e build com `rtk`.
   - Testar navegação e interações em todas as resoluções.

---

## 6. Validação e Testes
- [x] `rtk npx tsc --noEmit` no frontend sem erros
- [x] `rtk npm run build` no frontend com sucesso
- [x] Validação visual e de transições

---

## 7. Sincronização com /docs
- [x] `docs/pages/auth-onboarding.md` criado
- [x] `docs/documentation-governance.md` validado
