# Task: Governança Estrita de Membros, Admin Geral Único e Modal de Transferência de Liderança
**Data:** 2026-09-01  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/settings.md]]`, `[[docs/components/modals.md]]`, `[[docs/architecture/data-model.md]]`, `[[docs/architecture/security.md]]`

---

## 1. Contexto & Problema
1. **Controle de Acesso Descentralizado:** Qualquer morador conseguia visualizar o botão de adicionar membros na residência (`AddMemberModal`), sem restringir essa ação estritamente a administradores (`Admin Geral` ou `Admin`).
2. **Atribuição de Papéis Sem Restrição:** Não havia trava que garantisse que apenas o Admin Geral pudesse promover/destituir administradores e moradores.
3. **Ausência de Unicidade do Admin Geral:** Não existia uma distinção clara entre "Admin Geral" (Arquiteto Principal / Titular único da casa) e "Admins Normais" (co-administradores).
4. **Falta de Alerta de Destituição:** Caso a titularidade de Admin Geral fosse passada para outro membro, não existia um aviso visual informando ao usuário atual que ele passará a ser um Admin Normal.

---

## 2. Solução Proposta

### 2.1 Hierarquia de Papéis & Poderes
- **`Admin Geral` (Arquiteto Principal - Único):**
  - Titular único por residência.
  - Pode adicionar membros.
  - **Poder Exclusivo:** É o **único** que pode promover moradores a `Admin` ou destituir um `Admin` para `Resident`.
  - É o **único** que pode transferir a titularidade de `Admin Geral`.
- **`Admin` (Administrador Normal - Ilimitados):**
  - Podem existir múltiplos por residência.
  - Pode adicionar membros e gerenciar rotinas/tarefas, mas não pode alterar categorias nem promover/destituir outros admins.
- **`Resident` / `Resident (Restricted)` / `Guest Access`:**
  - Moradores comuns. Não podem adicionar novos membros nem alterar papéis.

### 2.2 Modal de Aviso de Transferência de Liderança Única
- Se o `Admin Geral` atual selecionar o cargo de `Admin Geral` para outro membro, exibir um modal de alerta requintado no padrão visual DOMUS (`bg-[#16302e]`, bordas `#ffca5e`, ícone `crown`/`shield_person` e tipografia `Inter`):
  > *"👑 **Transferência de Liderança Única**  
  > Existe apenas **1 Admin Geral** por residência. Ao nomear **[Nome]** como Admin Geral, você deixará de ser o Admin Geral e passará a ser um **Administrador Normal (Admin)**. O novo Admin Geral assumirá a governança total da residência. Deseja prosseguir?"*
- Ao confirmar, o novo membro assume como `Admin Geral` (`isPrimary: true`), e o usuário anterior passa para `Admin` normal com segurança.

### 2.3 Gestão de Cargos em Configurações & Drawer
- Na listagem de membros em `SettingsView.tsx` e `FamilyMembersDrawer`, adicionar ações contextuais visíveis **exclusivamente para o Admin Geral**:
  - Botão "Promover a Admin" (para membros com role `Resident`).
  - Botão "Destituir para Residente" (para membros com role `Admin`).
  - Botão "Transferir Admin Geral" (dispara o modal de confirmação).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Governança clara e sem conflitos de autoridade na casa.
  - Prevenção de destituição acidental de administradores através de confirmação explícita em dois passos.
  - O antigo Admin Geral não perde o acesso administrativo básico, permanecendo como Admin Normal.
- **Desvantagens / Riscos:**
  - Apenas o novo Admin Geral poderá promover ou destituir cargos dali em diante.

---

## 4. Critérios de Aceitação
- [x] Tanto o `Admin Geral` quanto o `Admin Normal` conseguem adicionar novos membros na residência.
- [x] Moradores comuns (`Resident`, `Guest`) não visualizam nem acessam botões para adicionar membros.
- [x] Apenas o `Admin Geral` tem permissão de promover membros a `Admin` ou destituí-los a `Resident`.
- [x] Existe estritamente **1 único Admin Geral** por residência em qualquer momento.
- [x] Ao transferir o `Admin Geral`, o usuário anterior se torna automaticamente um **Admin Normal** e o modal de aviso elegante é exibido antes da confirmação.
- [x] Typecheck e build de ambos os pacotes passam com 100% de sucesso.

---

## 5. Plano de Implementação (Passo a Passo)

### Passo 1: Tipagem e Interfaces
1. [x] Atualizar `frontend/src/types.ts` para incluir a role `'Admin Geral'` e tipagens de controle de acesso.

### Passo 2: Modal de Confirmação de Transferência de Liderança
1. [x] Criar componente `LeadershipTransferModal` em `frontend/src/components/Modals.tsx` com estilo visual requintado (badge dourado, alerta de destituição e botões de confirmação/cancelamento).
2. [x] Atualizar `AddMemberModal` para interceptar a seleção de `Admin Geral` e disparar o fluxo de confirmação.

### Passo 3: Proteção de Ações e Renderização Condicional
1. [x] Proteger os botões de adicionar membros em `SettingsView.tsx` e `FamilyMembersDrawer` verificando `currentUser.role === 'Admin Geral' || currentUser.role === 'Admin'`.
2. [x] Em `App.tsx`, implementar a lógica de promoção a `Admin`, destituição para `Resident` e transferência de `Admin Geral` mantendo o usuário anterior como `Admin` normal.

### Passo 4: Validação & Sincronização com /docs
1. [x] Executar `rtk npm run typecheck:frontend` e `rtk npm run build:frontend`.
2. [x] Sincronizar specs em `docs/pages/settings.md`, `docs/components/modals.md` e `docs/tasks/`.
