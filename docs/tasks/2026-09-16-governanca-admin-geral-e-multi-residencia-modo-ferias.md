# Task: Governança de Saída do Admin Geral e Multi-Residência com Modo Férias Automático
**Data:** 2026-09-16  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/architecture/data-model.md]]`, `[[docs/integrations/api-contracts.md]]`, `[[docs/pages/auth-onboarding.md]]`, `[[docs/pages/settings.md]]`, `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
1. **Regra de Saída do Admin Geral Aplicada Indevidamente na Troca de Casa:**
   - Atualmente, tanto no frontend (`handleSwitchHouse` em `App.tsx`) quanto no backend (`switchHouse` em `houses.service.ts`), o sistema bloqueia o Admin Geral que tenta alternar de residência com a mensagem `"O Administrador Geral não pode alternar de residência sem antes transferir a liderança."`.
   - A governança de sucessão obrigatória deve ser exclusiva para o evento de **saída definitiva** (`leaveHouse`) e **apenas quando houver 2 ou mais pessoas na residência**. Se houver apenas 1 morador na casa (o próprio Admin Geral), ele pode sair diretamente sem necessidade de sucessão.

2. **Limitação de Residência Única e Ausência de Férias por Residência:**
   - A arquitetura atual vincula o morador a apenas uma residência por vez via coluna única `users.house_id`.
   - Se um usuário ingressa em uma nova casa ou cria outra residência, ele perde o vínculo com a residência anterior ou é bloqueado com `USER_ALREADY_IN_HOUSE`.
   - O usuário necessita pertencer a múltiplas residências simultaneamente (sem sair da primeira). Ao alternar o contexto de trabalho para uma residência, o sistema deve automaticamente colocá-lo em **modo de férias** (`vacation_mode = true`) nas residências em que ele não estiver ativamente presente, evitando que ele trave escalas de rodízio e tarefas nas demais casas.

---

## 2. Solução Proposta

### 2.1 Modelo de Dados & Persistência (PostgreSQL / Prisma)
- Criar a entidade intermediária de relacionamento N:N **`HouseMember`** (`house_members`):
  ```prisma
  model HouseMember {
    id            String    @id @default(uuid())
    user_id       String
    house_id      String
    role          UserRole  @default(MEMBER)
    vacation_mode Boolean   @default(false)
    created_at    DateTime  @default(now())
    updated_at    DateTime  @updatedAt

    user          User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
    house         House     @relation(fields: [house_id], references: [id], onDelete: Cascade)

    @@unique([user_id, house_id])
    @@map("house_members")
  }
  ```
- Manter `users.house_id` indicando a **residência ativa atual** do usuário (garantindo compatibilidade com consultas existentes).
- Criar script de migração SQL Prisma (`migration.sql`) preenchendo retroativamente a tabela `house_members` para todos os usuários existentes com vínculo residencial ativo.

### 2.2 Backend (`houses.service.ts`, `houses.repository.ts`)
1. **Remoção de Bloqueio em `switchHouse`:**
   - Eliminar a validação `CANNOT_SWITCH_HOUSE_AS_GENERAL_ADMIN` de `switchHouse`. O Admin Geral pode alternar livremente.
2. **Modo Férias Automático na Troca de Residência (`switchHouse`):**
   - Ao alternar para `targetHouseId`:
     - O vínculo da residência de origem em `HouseMember` é atualizado para `vacation_mode = true`.
     - O vínculo da residência de destino em `HouseMember` é atualizado para `vacation_mode = false`.
     - `users.house_id` é atualizado para `targetHouseId` e `users.role` sincronizado com o cargo da nova casa.
     - Emissão de WebSockets (`house:members_updated`) para ambas as residências sincronizando a lista de membros e o estado de férias em tempo real.
3. **Multi-Residência em `joinHouse` & `createHouse`:**
   - Permitir que usuários com residência ativa ingressem ou criem novas casas sem necessidade de desvinculação prévia.
   - A casa anterior entra em modo de férias automaticamente ao ingressar na nova.
4. **Listagem de Múltiplas Casas (`listMyHouses`):**
   - `GET /api/houses/my-houses` passa a retornar todas as residências cadastradas em `HouseMember` para o usuário, com seus respectivos papéis e status de férias.
5. **Governança Estrita em `leaveHouse`:**
   - A exigência de sucessão de Admin Geral só é disparada se `otherMembersCount > 0` (2 ou mais pessoas).
   - Se for o único morador (`otherMembersCount === 0`), permite a desvinculação direta e exclui a casa vazia.

### 2.3 Frontend (`App.tsx`, `HouseSelectionView.tsx`, `SettingsView.tsx`, `Modals.tsx`)
1. **Remover Bloqueio de Troca no Frontend:**
   - Em `handleSwitchHouse()` em `App.tsx`, remover o alerta que impedia o Admin Geral de alternar de residência.
2. **Exibição de Todas as Casas no Seletor:**
   - `HouseSelectionView.tsx` exibe todos os lares do usuário em cards na seção "Minhas Residências", com indicativo visual de qual casa está ativa ou em férias, e botão de alternância imediata em 1 clique.
3. **Garantia de Não-Violação de Permissões e Segurança:**
   - Cada residência mantém seu próprio controle de papéis (`ADMIN` vs `MEMBER`). Um usuário pode ser Admin Geral na Casa 1 e Morador comum na Casa 2.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Atende integralmente à regra de negócio solicitada pelo usuário.
  - Elimina a frustração de bloqueio indevido ao navegar entre múltiplas casas.
  - Automação inteligente do rodízio: ausência automática nas outras casas impede que tarefas fiquem presas ou atribuídas a um morador ausente.
  - Arquitetura normalizada com N:N em conformidade com as melhores práticas de banco de dados relacional.
- **Desvantagens / Riscos:**
  - Requer aplicação de migração SQL Prisma no banco de dados.
  - Necessidade de sincronizar eventos de WebSocket entre residências de origem e destino na alternância.

---

## 4. Critérios de Aceitação
- [x] O Admin Geral consegue alternar de residência (`switchHouse`) sem ser bloqueado pelo sistema.
- [x] A exigência de nomeação de sucessor ocorre **apenas** ao **sair** (`leaveHouse`) e **apenas se houver 2 ou mais pessoas** na casa. Se houver 1 morador, a saída é livre.
- [x] O usuário consegue pertencer a mais de uma casa simultaneamente sem perder o vínculo da casa anterior.
- [x] Ao alternar para outra casa, o usuário entra automaticamente em **modo de férias** na(s) residência(s) em que não está ativo.
- [x] Na residência de destino, o usuário é reativado (fora de férias) e assume seu papel correspondente daquela casa.
- [x] `GET /api/houses/my-houses` lista todas as casas vinculadas ao usuário.
- [x] Testes unitários do backend e compilação do frontend executam com 100% de sucesso.
- [x] Specs em `/docs` atualizadas.

---

## 5. Plano de Implementação (Passo a Passo)
1. [x] Atualizar o schema Prisma com o modelo `HouseMember` e gerar migração SQL.
2. [x] Atualizar repositórios e serviços (`houses.repository.ts`, `houses.service.ts`).
3. [x] Atualizar testes unitários (`statistics.service.test.ts` e novos testes de alternância).
4. [x] Ajustar `handleSwitchHouse` em `frontend/src/App.tsx`.
5. [x] Executar `rtk npm run typecheck` e testes automatizados.
6. [x] Sincronizar documentação técnica em `/docs`.

---

## 6. Validação e Testes
- [x] `rtk npm run test:unit` no backend validando alternância livre e governança de sucessão (69/69 testes passando).
- [x] `rtk npm run typecheck` em frontend e backend (0 erros).
- [x] `rtk npm run build` no frontend (build com sucesso).

---

## 7. Sincronização com /docs
- [x] [docs/architecture/data-model.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/architecture/data-model.md)
- [x] [docs/integrations/api-contracts.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/integrations/api-contracts.md)
- [x] [docs/pages/auth-onboarding.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/pages/auth-onboarding.md)
