# Concorrência, Locks de Execução & Algoritmo de Rotação

## 1. Concorrência & Lock Temporizado (45 Minutos)

### 1.1 Objetivo
Evitar duplicidade de esforço operacional (ex: dois membros limparem a cozinha simultaneamente sem saber).

### 1.2 Regras de Lock
1. **Atribuição Exclusiva:** Ao clicar em `Iniciar / Lock`, a tarefa passa para o estado `LOCKED`, registrando:
   - `lockedById = currentUserId`
   - `lockedAt = new Date()`
2. **Janela de Expiração:**
   - Duração máxima: **45 minutos**.
   - Se decorridos mais de 45 minutos sem que a tarefa seja concluída ou bloqueada, o lock é considerado **expirado** (*stale lock*).
3. **Tratamento de Stale Lock:**
   - Leituras da API e novas tentativas de lock recalculam o estado da tarefa:
     ```typescript
     function isLockExpired(lockedAt: Date, timeoutMinutes = 45): boolean {
       const elapsedMs = Date.now() - new Date(lockedAt).getTime();
       return elapsedMs > timeoutMinutes * 60 * 1000;
     }
     ```
   - Caso expirado, a tarefa retorna para `OPEN` ou pode ser reivindicada por outro usuário.

---

## 2. Algoritmo de Rodízio Seletivo (`Selective Rotation`)

### 2.1 Pool de Participantes e Ordem Canônica A-Z
- Cada tarefa define um subconjunto de membros elegíveis (`participantIds`).
- Os membros são ordenados alfabeticamente pelo nome de exibição: `[P_0, P_1, ..., P_N-1]`.
- Quando um novo participante é adicionado, sua posição no array é inserida alfabeticamente sem zerar o índice de quem é a vez atual.

### 2.2 Transição de Turno e Salto de Férias (`Vacation Skip`)
Ao disparar `POST /api/tasks/:id/complete`:
1. O backend calcula o próximo candidato:
   $$\text{next\_idx} = (\text{current\_idx} + 1) \pmod N$$
2. **Verificação de Férias (`isOnVacation`):**
   - Se o candidato estiver de férias (`isOnVacation === true` ou na janela de datas de ausência), ele é saltado e um log de auditoria é gravado (`TASK_ROTATED_VACATION_SKIP`).
   - O algoritmo incrementa `next_idx` sucessivamente até encontrar um membro ativo.
3. Se todos os membros estiverem de férias, a tarefa permanece com o primeiro da lista e um alerta de casa desassistida é emitido.
