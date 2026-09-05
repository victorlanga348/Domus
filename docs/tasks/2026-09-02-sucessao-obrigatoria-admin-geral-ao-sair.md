# Task: Sucessão Obrigatória de Admin Geral ao Sair da Residência
**Data:** 2026-09-02  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/components/modals.md]]`, `[[docs/pages/settings.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Regra de Negócio

No modelo de governança do DOMUS, existe estritamente **1 Admin Geral** por residência, responsável pela titularidade e administração da casa.
Atualmente, a API de saída (`POST /api/house/leave`) permitia que qualquer usuário se desvinculasse da residência sem verificar se ele era o único administrador da casa, deixando potencialmente a residência órfã (sem nenhum Admin Geral para gerenciar moradores e aprovar decisões).

### Nova Regra Obrigatória:
> **"Se o Admin Geral quiser sair da residência/sala, ele terá obrigatoriamente que nomear outro morador ou outro subadministrador (Admin) como o novo Admin Geral antes de concluir a sua saída."**
> *(Exceção natural: se ele for o único morador restante na residência, a saída direta é permitida pois não há sucessor).*

---

## 2. Solução Proposta

1. **Backend - Validação e Sucessão no `leaveHouse` (`backend/src/modules/houses/houses.service.ts`):**
   - Verificar se o usuário solicitante possui o papel `ADMIN` (Admin Geral).
   - Contar os demais moradores vinculados à residência (`prisma.user.count({ where: { house_id, id: { not: userId } } })`).
   - Se existirem outros membros (`count > 0`):
     - Exigir `newAdminId` válido no payload.
     - Se `newAdminId` não for fornecido, retornar **HTTP 400** com código `ADMIN_TRANSFER_REQUIRED` ("Como Administrador Geral, você deve nomear um sucessor antes de sair da residência.").
     - Validar que o sucessor escolhido pertence à mesma residência.
     - Em uma transação atômica (`prisma.$transaction`):
       1. Promover o sucessor para `role: 'ADMIN'`.
       2. Desvincular o usuário atual (`house_id: null, role: 'MEMBER'`).
       3. Registrar no `ActivityLog` a sucessão de liderança e a saída do morador.
       4. Emitir broadcast via WebSocket notificando a residência sobre o novo Admin Geral (`house:admin_transferred`).
   - Se for o único morador na residência (`count === 0`):
     - Permitir a saída direta sem necessidade de sucessor (`house_id: null, role: 'MEMBER'`).

2. **Frontend - Modal Institucional de Saída & Sucessão (`LeaveHouseModal`):**
   - Em `frontend/src/components/Modals.tsx`:
     - Criar `LeaveHouseModal`:
       - **Se for Morador Comum ou Subadmin:** Exibe aviso de confirmação simples de saída da residência.
       - **Se for Admin Geral com outros membros na casa:**
         - Exibe aviso de governança obrigatória: *"Você é o Administrador Geral desta residência. Para sair, você deve nomear um morador ou subadministrador para assumir a titularidade da casa."*
         - Lista interativa dos demais moradores com foto, nome e tag de cargo atual (`Subadmin` ou `Morador`).
         - Campo de seleção obrigatório do sucessor.
         - Botão de ação: *"Nomear Sucessor e Sair da Residência"*.
       - **Se for o único membro restante:** Avisa que a residência ficará vazia.
   - Em `frontend/src/features/settings/components/SettingsView.tsx`:
     - Adicionar botão **"Sair da Residência"** na seção da casa / rodapé de membros.
   - Em `frontend/src/App.tsx`:
     - Integrar o `LeaveHouseModal`.
     - Ao confirmar a saída com ou sem sucessão:
       - Chama `authApi.leaveHouse(userId, token, newAdminId)`.
       - Limpa `currentHouse`, atualiza estado e redireciona suavemente para a tela de seleção de casas (`HouseSelectionView`).

3. **Testes Automatizados:**
   - Adicionar teste unitário e teste E2E garantindo que o Admin Geral não consegue sair sem sucessor se houver outros membros, e que a sucessão promove o novo membro e remove o anterior com perfeição.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - Elimina o risco de residências órfãs sem governança.
  - Experiência visual rica e guiada com padrão de design do DOMUS.
  - Segurança de dados com transação atômica no banco de dados.
- **Desvantagens / Riscos:**
  - Nenhuma; preserva a autonomia dos moradores normais e protege a casa de abandono.

---

## 4. Critérios de Aceitação

- [x] Tentativa de saída do Admin Geral sem sucessor em casa com múltiplos membros retorna HTTP 400 (`ADMIN_TRANSFER_REQUIRED`).
- [x] Fornecendo `newAdminId`, o sucessor é promovido a `ADMIN`, o Admin Geral é desvinculado e a saída é concluída.
- [x] Se o Admin Geral for o único membro da residência, sua saída é permitida diretamente.
- [x] Modal visual no frontend exibe a lista dos demais moradores e obriga a seleção antes de liberar o botão de confirmação.
- [x] `rtk npm test` passando com 100% de sucesso.

---

## 5. Plano de Implementação (Passo a Passo)

1. [x] **Backend - Houses Service & Controller:**
   - Atualizar `leaveHouse` para suportar `newAdminId` e aplicar a trava com transação atômica.
2. [x] **Frontend - API:**
   - Atualizar `authApi.leaveHouse(userId, token, newAdminId)`.
3. [x] **Frontend - Modal & UI:**
   - Criar `LeaveHouseModal` em `frontend/src/components/Modals.tsx`.
   - Adicionar botão "Sair da Residência" em `SettingsView.tsx`.
   - Conectar lógica em `App.tsx`.
4. [x] **Testes:**
   - Adicionar caso de teste no `backend/tests/e2e/lifecycle.e2e.test.ts`.
   - Validar com `rtk npm test`.
5. [x] **Sincronização & Commit:**
   - Atualizar specs em `/docs` e realizar commit em português.

---

## 6. Validação e Testes

- [x] `rtk npm run test:unit` (backend): Código 0.
- [x] `rtk npm run test:e2e` (backend): Código 0.
- [x] `rtk npm test` (backend): Código 0.
