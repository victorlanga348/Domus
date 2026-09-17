# Task: Governança de Troca de Casa pelo Admin Geral com Sucessão Inteligente e Modais Obrigatórios de Confirmação
**Data:** 2026-09-17  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/components/modals.md]]`, `[[docs/components/sidebar-header.md]]`, `[[docs/pages/settings.md]]`, `[[docs/integrations/api-contracts.md]]`, `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
1. **Ausência de Sucessão de Liderança na Troca de Residência (`switchHouse`):**
   - Ao clicar para trocar de residência ("Trocar Residência"), o Administrador Geral da casa ativa anteriormente podia alternar de residência sem que a liderança da casa de origem fosse formalmente transmitida a outro morador quando existissem membros na casa.
   - O utilizador especificou a regra de negócio exata:
     - Se existirem outros membros na residência:
       - **Exatamente 2 pessoas no total na casa (Admin Geral + 1 membro):** o sistema designa automaticamente essa pessoa como sucessora e solicita confirmação via modal.
       - **Mais de 2 pessoas no total na casa (Admin Geral + 2 ou mais membros):** exibe um card apresentando os integrantes da residência para que o Admin Geral escolha a quem deseja passar a liderança, seguido de modal de confirmação.
       - **Apenas 1 pessoa na residência (o Admin Geral sozinho):** a troca é liberada diretamente, pois não existem outros moradores na casa.

2. **Falta de Modais de Confirmação em Ações Críticas de Governança de Membros:**
   - As ações de "Promover a Admin", "Despromover a Morador" e remoção de membros exigem modais obrigatórios de confirmação antes de qualquer alteração de estado.

---

## 2. Solução Proposta

### 2.1 Backend & Persistência (`houses.service.ts`, `houses.controller.ts`, `houses.routes.ts`)
1. **Novo Endpoint `POST /api/houses/transfer-leadership`:**
   - Permite a transferência autoritativa de liderança geral entre moradores da mesma residência de forma atômica (`prisma.$transaction`).
   - Atualiza `HouseMember` e `User`, promovendo o sucessor a `ADMIN` e convertendo o líder anterior para `MEMBER`.
   - Registra auditoria em `ActivityLog` (`ROTATED`).
   - Emite WebSockets `house:admin_transferred` e `house:members_updated`.

### 2.2 Frontend: Novo Card/Modal de Sucessão (`SwitchHouseSuccessorModal.tsx` em `Modals.tsx`)
1. **Componente de Seleção de Sucessor:**
   - Card modal responsivo seguindo o design system do Domus (`#16302e`, dourado `#ffca5e`, tipografia densa e cantos arredondados `rounded-3xl`).
   - Lista os integrantes da residência (com avatar, nome, e-mail e cargo atual).
   - Permite selecionar interativamente um morador via teclado ou clique.
   - Botões "Cancelar" e "Continuar".
2. **Fluxo Inteligente de Interceptação da Troca de Residência (`handleSwitchHouse` em `App.tsx`):**
   - Se `currentUser.role === 'Admin Geral'` e houver outros moradores:
     - Se `otherMembers.length === 1`: define o único morador como alvo e abre diretamente o modal de confirmação de transferência de liderança.
     - Se `otherMembers.length > 1`: abre o card de seleção de sucessor. Após a seleção e clique em continuar, abre o modal de confirmação.
     - Após confirmação: transfere a liderança no backend/estado e prossegue com a transição para a seleção de casas (`HouseSelectionView`).
   - Se houver apenas 1 morador (o próprio Admin Geral) ou se o usuário não for Admin Geral: prossegue diretamente com a troca de residência.

### 2.3 Frontend: Modais Obrigatórios de Confirmação Padronizados
1. **Modal de Promoção a Administrador (`ConfirmActionModal`):**
   - Título: "Promover a Administrador" com ícone `shield_person` (ouro/âmbar).
2. **Modal de Despromoção a Morador (`ConfirmActionModal`):**
   - Título: "Despromover para Morador" com ícone `arrow_downward` (âmbar).
3. **Modal de Transferência de Cargo / Liderança (`LeadershipTransferModal`):**
   - Aplicado na troca de casa, no menu de ações e no convite como Admin Geral.
4. **Modal de Saída da Residência (`LeaveHouseModal`):**
   - Mantido com suporte à nomeação de sucessor e confirmação segura de desvinculação.
5. **Modal de Remoção de Morador (`ConfirmActionModal`):**
   - Ícone `person_remove` e variante danger.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Atende 100% à solicitação do utilizador com regras determinísticas para 1, 2 ou 3+ moradores.
  - Previne residências órfãs sem liderança quando o Admin Geral alternar de contexto.
  - Evita cliques acidentais em ações destrutivas ou de elevação de privilégios.
  - Conformidade estrita com acessibilidade (navegação por teclado, foco, `aria-expanded`, ESC para fechar modais).
- **Desvantagens / Riscos:**
  - Adiciona um passo extra de confirmação antes de promover/despromover.

---

## 4. Critérios de Aceitação
- [x] Ao clicar em "Trocar Residência" sendo Admin Geral:
  - Se houver apenas o Admin Geral na casa: a troca ocorre diretamente.
  - Se houver exatamente 2 pessoas no total na casa: designa o outro morador automaticamente e abre modal de confirmação para transferir a liderança e prosseguir.
  - Se houver mais de 2 pessoas: abre card listando os integrantes para escolher o novo líder, seguido de modal de confirmação para passar a liderança e alternar de casa.
- [x] Cancelar qualquer modal/card de troca mantém o usuário na residência atual sem transferir nada.
- [x] Ao clicar em "Promover a Admin" no menu de membros, exibe modal de confirmação antes de alterar o cargo.
- [x] Ao clicar em "Despromover a Morador" no menu de membros, exibe modal de confirmação antes de alterar o cargo.
- [x] Ao clicar em "Passar Admin Geral", exibe modal de confirmação antes de transferir a liderança.
- [x] Ao clicar em "Sair da Residência", exibe modal de confirmação (com sucessão se houver membros).
- [x] Typecheck (`rtk npm run typecheck`), testes unitários e build de produção executam sem erros.
- [x] Specs em `/docs` devidamente sincronizadas.

---

## 5. Plano de Implementação (Passo a Passo)
1. [x] **Backend:**
   - Adicionar método `transferLeadership` em `houses.service.ts` e `houses.controller.ts`.
   - Adicionar rota `POST /transfer-leadership` em `houses.routes.ts`.
   - Adicionar método `transferLeadership` em `frontend/src/features/auth/api/authApi.ts`.
2. [x] **Frontend - Componentes:**
   - Criar `SwitchHouseSuccessorModal` em `Modals.tsx` para listar integrantes e escolher sucessor.
   - Adicionar estados e modais de confirmação para Promoção, Despromoção e Remoção em `App.tsx`.
   - Adaptar `handleSwitchHouse` em `App.tsx` com o fluxo condicional (1 morador vs 2 moradores vs 3+ moradores).
   - Integrar confirmação no `MemberActionDropdown.tsx` / `SettingsView.tsx`.
3. [x] **Validação & Testes:**
   - Executar `rtk npm run test:unit` no backend (72/72 testes passando).
   - Executar `rtk npm run typecheck` em frontend e backend (0 erros).
   - Executar `rtk npm run build` no frontend (build com sucesso).
4. [x] **Sincronização de Docs:**
   - Atualizar `docs/components/modals.md`, `docs/components/sidebar-header.md`, `docs/pages/settings.md` e `docs/integrations/api-contracts.md`.

---

## 6. Validação e Testes
- [x] Typecheck / Lint sem erros (`rtk npm run typecheck` em backend e frontend)
- [x] Testes unitários do backend (`rtk npm run test:unit` - 72/72 passaram)
- [x] Build de produção executado com sucesso (`rtk npm run build`)
- [x] Acessibilidade e responsividade validadas

---

## 7. Sincronização com /docs
- [x] [docs/components/modals.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/components/modals.md)
- [x] [docs/components/sidebar-header.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/components/sidebar-header.md)
- [x] [docs/pages/settings.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/pages/settings.md)
- [x] [docs/integrations/api-contracts.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/integrations/api-contracts.md)
- [x] Matriz de impacto validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
