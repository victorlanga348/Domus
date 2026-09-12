# Task: Ajuste Visual de Senhas, Toggle de Visibilidade e Isolamento Estrito de Sessão / Residências
**Data:** 2026-09-12  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/auth-onboarding.md]]`, `[[docs/architecture/security.md]]`

---

## 1. Contexto & Problema
1. **Pontilhados de Senha Excessivamente Grandes:** Nos campos de senha de autenticação ([AuthView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/AuthView.tsx), [RegisterView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/RegisterView.tsx), [LoginView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/LoginView.tsx)), o tamanho visual dos caracteres de máscara e placeholders estava desproporcional.
2. **Ausência de Toggle de Visualização (Olho):** Não havia controle interativo para alternar a visibilidade da senha entre `password` e `text`.
3. **Vazamento de Estado de Residência entre Contas (Sessão Desincronizada):** Ao criar uma nova conta, o estado `currentHouse` em [App.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx) retinha a residência da conta anterior através do `localStorage` (`domus_auth_house`). Como o novo usuário registrado possuía `house_id === null` no PostgreSQL, ocorria uma inconsistência: a UI entrava direto no painel da casa antiga, mas o novo usuário não constava na contagem nem na lista de membros retornada pelo backend.
4. **Limpeza da Base de Dados:** Necessidade de resetar a base de dados PostgreSQL para eliminar registros de teste e iniciar com ambiente 100% limpo.

---

## 2. Solução Implementada
1. **Refinamento Tipográfico dos Campos de Senha:**
   - Reduzido o tamanho visual dos pontilhados utilizando `placeholder:text-[10px] placeholder:tracking-widest` e campos balanceados.
2. **Botão de Alternância de Visibilidade da Senha (Eye Toggle):**
   - Implementado estado `showPassword` e `showConfirmPassword` com botões e ícones `visibility` / `visibility_off` em [AuthView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/AuthView.tsx), [RegisterView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/RegisterView.tsx) e [LoginView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/LoginView.tsx).
3. **Isolamento e Reset Estrito de Sessão no Frontend:**
   - Em [App.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx), no callback `handleAuthSuccess(user, token)`: se `!user.house_id`, força explicitamente `setCurrentHouse(null)`, remove `domus_auth_house` e limpa todos os estados locais de residência.
   - Na inicialização do [App.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx): se o `authUser` salvo não possuir `house_id`, garante que `currentHouse` permaneça `null`, direcionando corretamente o usuário para o onboarding ([HouseSelectionView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/HouseSelectionView.tsx)).
   - No `handleLogout()`: limpeza profunda de chaves e estados residuais.
4. **Reset da Base de Dados PostgreSQL:**
   - Executado `prisma migrate reset --force` com sucesso no banco de dados.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Experiência de autenticação polida e acessível com controle visual de senha.
  - Eliminação de qualquer contaminação de estado entre sessões de múltiplos usuários no mesmo navegador.
  - Novos usuários sempre passam pelo seletor/criador de residência até estarem associados no PostgreSQL.
  - Base de dados 100% limpa e estável.
- **Desvantagens / Riscos:**
  - Nenhuma; compatibilidade e governança mantidas em 100%.

---

## 4. Critérios de Aceitação
- [x] Pontilhados de senha reduzidos e discretos em [AuthView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/AuthView.tsx), [RegisterView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/RegisterView.tsx) e [LoginView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/LoginView.tsx).
- [x] Ícone de olho funcional alternando entre `type="password"` e `type="text"`.
- [x] Ao cadastrar uma nova conta, o usuário sem residência é direcionado para [HouseSelectionView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/HouseSelectionView.tsx).
- [x] Ao ingressar ou criar uma casa, o usuário é persistido no PostgreSQL e sincronizado imediatamente nas listas e contagens.
- [x] Base de dados PostgreSQL limpa e pronta para uso.

---

## 5. Validação e Testes
- [x] Typecheck do frontend (`rtk npm run typecheck`) -> 0 erros
- [x] Typecheck do backend (`rtk npm run typecheck`) -> 0 erros
- [x] Testes automatizados (`rtk npm test` - 57/57 aprovados)
- [x] Reset do banco PostgreSQL executado com sucesso

---

## 6. Sincronização com /docs
- [x] Documentado em `docs/pages/auth-onboarding.md` e `docs/architecture/security.md`
