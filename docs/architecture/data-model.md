# Modelo de Dados & Entidades Canônicas

## 1. Diagrama Entidade-Relacionamento (ERD)

```mermaid
erDiagram
    HOUSE ||--o{ USER : contains
    HOUSE ||--o{ TASK : manages
    HOUSE ||--o{ ACTIVITY_LOG : records
    HOUSE ||--o{ EXPENSE : tracks
    USER ||--o{ ACTIVITY_LOG : triggers
    USER ||--o{ EXPENSE : pays
    TASK ||--o{ ACTIVITY_LOG : tracks
    TASK }|--|{ USER : participants

    HOUSE ||--o{ ROOM : contains
    USER ||--o{ PARTICIPANT : joins
    ROOM ||--o{ PARTICIPANT : members
    USER ||--o{ MESSAGE : writes
    ROOM ||--o{ MESSAGE : contains

    HOUSE {
        string id PK
        string name
        string code UK
        datetime createdAt
        datetime updatedAt
    }

    USER {
        string id PK
        string houseId FK
        string name
        string avatar
        string role "ADMIN | MEMBER | GUEST"
        string pinHash
        boolean isOnVacation
        datetime vacationStart
        datetime vacationEnd
        datetime createdAt
        datetime updatedAt
    }

    ROOM {
        string id PK
        string houseId FK
        string title
        string password
        datetime createdAt
        datetime updatedAt
    }

    PARTICIPANT {
        string id PK
        string userId FK
        string roomId FK
        enum role "ARCHITECT | MEMBER"
        datetime joinedAt
    }

    MESSAGE {
        string id PK
        string userId FK
        string roomId FK
        string text
        datetime createdAt
    }

    TASK {
        string id PK
        string houseId FK
        string title
        string description
        string category
        enum shift "MORNING | AFTERNOON | NIGHT"
        enum status "OPEN | LOCKED | BLOCKED | COMPLETED"
        string currentAssigneeId FK
        string lockedById FK
        datetime lockedAt
        string blockedReason
        datetime completedAt
        datetime createdAt
        datetime updatedAt
    }

    EXPENSE {
        string id PK
        string houseId FK
        string description
        float amount
        string payerId FK
        string category
        json splitBetween
        datetime date
        datetime createdAt
    }

    ACTIVITY_LOG {
        string id PK
        string houseId FK
        string taskId FK
        string userId FK
        enum action "TASK_LOCKED | TASK_COMPLETED | TASK_BLOCKED | TASK_ROTATED | USER_VACATION_TOGGLED | EXPENSE_CREATED"
        json details
        datetime createdAt
    }
```

---

## 2. Dicionário de Entidades

### 2.1 `House` (Tenant)
Representa a residência. Fornece isolamento multi-tenant via `houseId`. O `code` é alfanumérico único para o login inicial compartilhado (ex: `DOMUS-892`).

### 2.2 `User` (Membro)
Membro vinculado à residência. Autenticado por seleção de perfil + PIN de 4 a 6 dígitos. Possui flags de ausência/férias que influenciam o algoritmo de rotação de tarefas.

### 2.3 `Room` (Sala de Comunicação / Chat)
Sala de convivência ou gestão protegida por senha criptografada (hash Bcrypt). Possui criador e múltiplos participantes.

### 2.4 `Participant` (Associação com Papel / Role)
Tabela associativa entre `User` e `Room` contendo o cargo específico do usuário na sala (`ARCHITECT` ou `MEMBER`).

### 2.5 `Message` (Mensagem)
Registro de mensagens trocadas dentro de uma sala por participantes autorizados.

### 2.6 `Task` (Tarefa Doméstica)
Item operacional com ciclo de vida com controle de concorrência (`OPEN` ➔ `LOCKED` ➔ `COMPLETED` ou `BLOCKED`).

### 2.7 `Expense` (Despesa Compartilhada)
Registro financeiro da residência para controle de caixa comum, divisão proporcional ou igualitária entre moradores.

### 2.8 `ActivityLog` (Auditoria Imutável)
Histórico cronológico de ações executadas no sistema para geração de relatórios de produtividade, auditoria de bloqueios e transparência.
