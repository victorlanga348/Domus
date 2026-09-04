# Task: Menu Contextual de Membros, Gestão de Código da Casa e Ciclo de Vida de Residência Vazia
**Data:** 2026-09-04  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/settings.md]]`, `[[docs/components/modals.md]]`, `[[docs/integrations/api-contracts.md]]`, `[[docs/architecture/security.md]]`, `[[docs/pages/auth-onboarding.md]]`

---

## 1. Contexto & Problema
1. **Poluição Visual na Listagem de Membros:** Atualmente, a coluna de governança de membros em `SettingsView.tsx` expõe botões de ação em linha ("Tornar Admin", "Despromover", "Passar Admin Geral", "Remover"). Isso polui a interface, quebra alinhamentos no mobile e desktop e expõe botões destrutivos sem isolamento visual.
2. **Dependência de Memória Humana & Falta de Gestão do Código:** Membros que saem da residência ou esquecem o código de acesso não têm como recuperá-lo se quem está dentro não puder consultar facilmente. O código precisa estar visível nas configurações com opções de "Copiar" e "Compartilhar", além de um botão de "Regenerar Código" exclusivo do Admin Geral.
3. **Entrada e Reentrada Exclusiva por Código Único:** Todo ingresso ou reingresso na casa deve ser feito estritamente digitando o Código Único da residência (`invite_code`) e a senha. Ao sair, o vínculo é desfeito (`house_id = null`), não havendo atalhos residuais.
4. **Reset Obrigatório de Cargo:** Ao sair da residência, o cargo do usuário é resetado no banco para `MEMBER`. Todo usuário que ingressar ou reingressar via código entra invariavelmente como **Morador** (`Resident` / `MEMBER`).
5. **Casas Órfãs (Residência 100% Vazia):** Quando o último morador sai de uma residência, a casa ficava salva como registro órfão. A regra aprovada determina que a casa seja excluída automaticamente do banco quando o contador de membros chegar a zero.
6. **Consistência de Modais de Confirmação:** Ações críticas (transferência de liderança, remoção de membros, regeneração do código e saída da residência/exclusão) necessitam de modais padronizados com feedback visual de perigo.

---

## 2. Solução Proposta

### 2.1 Menu Contextual Dropdown (`MemberActionDropdown` / `more_vert`)
- Substituir botões horizontais em `SettingsView.tsx` por menu suspenso flutuante acionado por botão de 3 pontos (`more_vert`).
- Fechamento inteligente ao selecionar opção, clicar fora ou teclar `Escape`.
- Opções por RBAC:
  - `Admin Geral`: Promover a Admin (se Morador), Despromover a Morador (se Admin), Passar Admin Geral, Remover da Casa.
  - `Admin`: Remover da Casa (apenas Moradores regulares).
  - `Resident`: Sem ações contextuais sobre terceiros.

### 2.2 Card de Código da Residência em Configurações
- Card dedicado em `SettingsView.tsx` exibindo o Código de Entrada (`invite_code`) da casa:
  - **Botão "Copiar Código":** Copia para área de transferência com feedback toast.
  - **Botão "Compartilhar":** Usa Web Share API (`navigator.share`) com fallback para cópia.
  - **Botão "Regenerar Código" (Admin Geral):** Dispara rota `POST /api/houses/:id/regenerate-code` com confirmação em modal de aviso.

### 2.3 Endpoint de Regeneração de Código (`POST /api/houses/:id/regenerate-code`)
- Protegido por `authMiddleware`, `requireHouse` e restrição a `role === 'ADMIN'`.
- Gera novo código determinístico com garantia `@unique` no Prisma.
- Notifica os clientes via WebSocket (`house:code_regenerated`) para sincronização instantânea.

### 2.4 Fluxo Estrito de Reentrada e Reset de Cargo
- Ao sair da casa (`leaveHouse`), o usuário perde o vínculo (`house_id = null`, `role = MEMBER`).
- Em `HouseSelectionView.tsx`, a entrada exige Código Único e Senha.
- Em `joinHouse`, a residência é localizada pelo `invite_code` e o usuário é vinculado estritamente com `role: 'MEMBER'`.

### 2.5 Exclusão Automática ao Esvaziar a Casa
- Se `otherMembersCount === 0` no `leaveHouse`:
  - O backend desvincula o usuário e remove a casa do banco (`tx.house.delete({ where: { id: houseId } })`), cascateando remoções associadas.
  - O `LeaveHouseModal` informa claramente: *"Você é o único morador restante. Ao confirmar a saída, esta residência será excluída definitivamente."*

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Zero dependência da memória humana: quem está dentro da casa consulta, copia, compartilha ou regenera o código a qualquer momento.
  - Banco de dados limpo sem casas órfãs abandonadas.
  - Princípio do menor privilégio garantido: todo retorno à residência ocorre como Morador padrão.
  - Lista de membros limpa e profissional com menu suspenso tanto no mobile quanto no desktop.
- **Desvantagens / Riscos:**
  - Se todos os membros saírem da casa, os dados de tarefas daquela residência são apagados e não poderão ser recuperados.

---

## 4. Critérios de Aceitação
- [x] Cartões de membros em `SettingsView.tsx` utilizam menu contextual suspenso (`more_vert`) sem overflow.
- [x] Dropdown fecha automaticamente ao selecionar uma ação, clicar fora ou teclar `Escape`.
- [x] Card de Código de Convite visível nas Configurações com botões "Copiar" e "Compartilhar".
- [x] Botão "Regenerar Código" visível para Admin Geral com modal de confirmação.
- [x] Backend expõe `POST /api/houses/:id/regenerate-code` restrito ao Admin Geral, gerando código único e emitindo WebSocket.
- [x] Entrada na residência em `HouseSelectionView.tsx` solicita Código Único da Casa e Senha.
- [x] Ao sair da residência, o vínculo é desfeito e o cargo é redefinido para `MEMBER`.
- [x] Ao reingressar via código, o usuário entra estritamente com role `MEMBER` (`Resident`).
- [x] Ao sair o último morador, a casa é excluída do banco de dados automaticamente.
- [x] `rtk npm run typecheck` e `rtk npm run build` passam sem erros no backend e frontend.

---

## 5. Plano de Implementação (Passo a Passo)

### Passo 1: Backend (`backend/src/modules/houses/`)
1. [x] Implementar método `regenerateInviteCode` no service e controller.
2. [x] Registrar rota `POST /api/houses/:id/regenerate-code` em `houses.routes.ts`.
3. [x] Ajustar `joinHouse` no service e repository para localizar por `invite_code` e atribuir `role: 'MEMBER'`.
4. [x] Ajustar `leaveHouse` para excluir a casa do banco caso o usuário seja o último morador restante.

### Passo 2: Frontend (`frontend/src/`)
1. [x] Criar componente `MemberActionDropdown.tsx` em `frontend/src/features/settings/components/`.
2. [x] Adicionar o card "Código da Residência" (com Copiar, Compartilhar e Regenerar) em `SettingsView.tsx`.
3. [x] Integrar o menu contextual nos cartões de membros em `SettingsView.tsx`.
4. [x] Atualizar `HouseSelectionView.tsx` para solicitar explicitamente o Código da Residência.
5. [x] Criar/adaptar modal de confirmação de perigo (`ConfirmActionModal`).
6. [x] Conectar listener Socket.IO para sincronização do novo código quando regenerado.

### Passo 3: Validação Técnica
1. [x] Executar `rtk npm run typecheck:backend` e `rtk npm run typecheck:frontend`.
2. [x] Executar testes existentes (`rtk npm run test:unit`, `rtk npm run test:e2e`).

### Passo 4: Sincronização da Documentação
1. [x] Atualizar specs em `docs/pages/settings.md`, `docs/pages/auth-onboarding.md`, `docs/integrations/api-contracts.md` e `docs/architecture/security.md`.

