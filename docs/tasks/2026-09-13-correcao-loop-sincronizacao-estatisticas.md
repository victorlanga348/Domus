# Task: Correção de Loop Infinito de Sincronização e Estabilização das Estatísticas
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/reports-and-metrics.md]]`, `[[docs/tasks/2026-09-13-resiliencia-mural-dashboard-api.md]]`

---

## 1. Contexto & Problema
Na tela de "Estatísticas & Índice de Harmonia", ocorre uma oscilação contínua e rápida (a cada ~1 segundo) no card "Saúde da Convivência":
1. **Loop Circular de Sincronização em `App.tsx`:**
   - O `useCallback` de `syncAllHouseData` possuía `familyMembers` em suas dependências.
   - A cada execução, `syncAllHouseData` invocava `getDashboardData` -> `handleSyncMembers`, que chamava `setFamilyMembers` criando uma nova referência de array.
   - Isso invalidava `syncAllHouseData`, disparando novamente o `useEffect` de sincronização na linha 750 de forma ininterrupta a cada segundo.
2. **Disparo Contínuo e Reset de Animação em `StatisticsView.tsx`:**
   - `fetchStats` incluía `computeLocalStatistics` (que depende de `familyMembers` e `tasks`) em suas dependências, sendo executado novamente a cada ciclo do loop.
   - O botão de atualização piscava entre "Atualizando..." e "Atualizar".
   - A cada ciclo, `animKey` era incrementado, fazendo com que o `AnimatedCounter` abortasse a animação corrente, resetando para 0 e reiniciando a contagem (gerando os valores transitórios 17 -> 38 -> 0 observados no vídeo).
3. **Animação Destrutiva no `AnimatedCounter.tsx`:**
   - O contador sempre iniciava de `startValue = 0`, em vez de interpolar a partir do valor numérico atual já exibido em tela.

---

## 2. Solução Proposta
1. **Quebrar a Dependência Circular em `frontend/src/App.tsx`:**
   - Utilizado `useRef` para manter a referência atualizada de `familyMembers` (`familyMembersRef`), permitindo que `syncAllHouseData` mapeie tarefas sem depender de `familyMembers` em sua lista de dependências.
   - No `handleSyncMembers`, verificada igualdade dos dados dos membros antes de chamar `setFamilyMembers` (evitando emissão de novas referências de array desnecessárias).
2. **Estabilizar o Ciclo de Busca em `frontend/src/features/statistics/components/StatisticsView.tsx`:**
   - Desacoplado `fetchStats` de `computeLocalStatistics`. As dependências de `fetchStats` são estritamente `[currentHouseId, currentUserId]`.
   - `fetchStats` executa apenas na montagem ou quando a residência/usuário mudar (ou via clique explícito do usuário no botão "Atualizar").
   - `animKey` é incrementado apenas se houver mudança real na pontuação de harmonia (`stats?.harmony.score`).
3. **Interpolação Suave em `frontend/src/features/statistics/components/AnimatedCounter.tsx`:**
   - O contador inicia a animação a partir de seu valor corrente (`prevValueRef.current`) até o novo `targetValue`, eliminando resets bruscos para 0 quando dados são atualizados.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Eliminação imediata do consumo abusivo de rede/CPU por requisições em loop infinito a cada segundo.
  - Estabilidade visual absoluta: os cards de estatísticas não piscam nem resetam contadores.
  - Transições suaves e naturais em animações numéricas.
- **Desvantagens / Riscos:**
  - Nenhuma; a sincronização continua acontecendo de forma reativa e sob demanda via Socket e eventos reais.

---

## 4. Critérios de Aceitação
- [x] `syncAllHouseData` em `App.tsx` executa apenas uma vez no carregamento inicial e em eventos pontuais (sem chamadas repetitivas contínuas a cada segundo).
- [x] `handleSyncMembers` não emite novas referências de array se a lista de membros não foi alterada.
- [x] O componente `StatisticsView` não entra em loop de busca e o botão não fica alternando entre "Atualizando..." e "Atualizar".
- [x] A pontuação da Saúde da Convivência estabiliza no valor correto retornado pelo backend/local sem quedas repentinas para zero.
- [x] Typechecks do frontend e backend passam com 0 erros via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. **`frontend/src/App.tsx`:**
   - Adicionar `familyMembersRef` e usá-lo dentro de `syncAllHouseData`.
   - Remover `familyMembers` das dependências de `syncAllHouseData`.
   - Adicionar checagem de igualdade superficial no `handleSyncMembers`.
2. **`frontend/src/features/statistics/components/StatisticsView.tsx`:**
   - Desvincular `fetchStats` de `computeLocalStatistics` em suas dependências.
   - Controlar o incremento de `animKey` baseado em alteração real de score.
3. **`frontend/src/features/statistics/components/AnimatedCounter.tsx`:**
   - Iniciar interpolação a partir do valor atual (`prevValueRef.current`) em vez de 0 absoluto.
4. **Validação Técnica:**
   - Executar `rtk npm run typecheck` (Frontend & Backend).
   - Executar `rtk npm run test:unit` (Backend).
5. **Atualização Documental e Commit:**
   - Registrar a conclusão da tarefa e realizar commit em português.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` (Frontend) - 0 erros
- [x] `rtk npm run typecheck` (Backend) - 0 erros
- [x] `rtk npm run test:unit` (Backend) - 49 testes aprovados

---

## 7. Sincronização com /docs
- [x] Tarefa documentada em `docs/tasks/2026-09-13-correcao-loop-sincronizacao-estatisticas.md`
- [x] Matriz de governança conferida em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
