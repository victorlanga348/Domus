# Módulo: Tarefas & Rodízio Seletivo

## 1. Ciclo de Vida da Tarefa
O estado da tarefa segue a máquina de estados abaixo:

```mermaid
stateDiagram-v2
    [*] --> OPEN: Início do Turno
    OPEN --> LOCKED: Usuário Clica [Iniciar / Lock]
    LOCKED --> COMPLETED: Usuário Clica [Concluir] (Dispara Rotação)
    LOCKED --> BLOCKED: Usuário Reporta Impedimento
    LOCKED --> OPEN: Timeout de 45 Minutos Expirado
    BLOCKED --> LOCKED: Reassumido após resolução
    BLOCKED --> OPEN: Desbloqueado manualmente
    COMPLETED --> OPEN: Próximo ciclo / Próximo Turno
```

---

## 2. Turnos Operacionais
- **Manhã (`MORNING`):** 06:00 às 12:00
- **Tarde (`AFTERNOON`):** 12:00 às 18:00
- **Noite (`NIGHT`):** 18:00 às 23:59

---

## 3. Regras de Negócio do Rodízio
1. **Participantes Específicos:** Cada tarefa é configurada com seu próprio pool de membros.
2. **Ordem Alfabética Canônica:** Determinação estrita da fila de vez por ordem alfabética.
3. **Salto de Férias:** Membros com `isOnVacation = true` são automaticamente pulados na conclusão da tarefa, registrando log de auditoria do salto.

---

## 4. Regras de Permissão & Governança

### 4.1 Conclusão de Tarefas
- **Tarefa Direcionada:** Apenas o morador designado (`tarefa.responsavelId === usuarioAtual.id`).
- **Tarefa de Rodízio:** Apenas o morador da vez no turno (`rodizio.membroAtualId === usuarioAtual.id`, ordem A-Z com salto de férias).
- **Violação (403 Forbidden):** Bloqueio estrito no backend e botão desabilitado em cinza no frontend com tooltip: `"Aguardando confirmação de [Nome do Responsável]"`.

### 4.2 Reversão / Cancelamento de Tarefas Concluídas
- **Quem pode executar:** Exclusivo para o **Admin Geral** e **Sub-Admins** (`role === 'ADMIN' | 'SUB_ADMIN'`).
- **Moradores comuns:** Visualizam apenas o selo verde `"Concluída"`, sem botões de ação ou intervenção.
- **Confirmação:** Exige modal de confirmação antes do disparo da requisição à API.

### 4.3 Gestão e Adição de Membros
- **Regra Estrita:** Nenhum morador comum pode convidar ou adicionar novos membros à residência.
- **Autoridade Permitida:** Apenas o **Admin Geral** e os **Sub-Admins** possuem acesso às telas e ações de cadastro de novos moradores.

### 4.4 Edição de Escala de Rodízio & Preservação da Vez
- **Autoridade Permitida:** Exclusivo para **Admin Geral** e **Sub-Admins** (`role === 'ADMIN' | 'SUB_ADMIN'`). Moradores comuns recebem HTTP 403 Forbidden no backend e não visualizam botões de edição no frontend.
- **Motor de Preservação de Escala (`Rotation-Preserving Engine`):**
  1. Ao salvar alterações nos participantes de uma tarefa de rodízio, o sistema identifica quem é o morador com a vez ativa (`currentAssigneeId`).
  2. Ordena a nova lista de participantes em ordem alfabética canônica (A-Z).
  3. Se o morador atual permanece na nova lista, seu índice na lista reordenada é atribuído ao `rotation_index`, garantindo que **a pessoa da vez não perca seu turno** mesmo com a adição de participantes anteriores na ordem alfabética.
  4. Se o morador atual foi excluído da lista, o `rotation_index` avança de forma suave e circular para o próximo sucessor na sequência que permaneça ativo.
  5. Moradores em modo férias (`vacation_mode: true`) são pulados automaticamente na determinação da vez ativa (`isNext: true`), sendo identificados na interface com o badge `🏖️ Férias (fora da escala ativa)`.

### 4.5 Giro da Escala de Rodízio (`onRotateNext` / `POST /api/tasks/:id/rotate`)
- **Regra de Autoridade Estrita:** Apenas o morador que atualmente detém a vez ativa (`isNext === true`) tem autorização para girar o rodízio.
- **Comportamento Visual (Frontend):** Moradores fora da sua vez (ou membros que não pertençam à escala) visualizam o botão desabilitado em cinza com ícone de cadeado (`lock`) e tooltip informativo: `"Aguardando a vez de [Nome do Morador da Vez]"`.
- **Bloqueio Backend (403 Forbidden):** Qualquer chamada à rota `POST /api/tasks/:id/rotate` executada por usuário que não seja o responsável da vez é rejeitada com status HTTP 403 e código `FORBIDDEN_TASK_ROTATION`.

