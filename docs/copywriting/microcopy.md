# Copywriting Oficial, Microcopy & Mensagens do Sistema

## 1. Regra de Ouro
Proibido inventar textos, mensagens de erro ou rótulos soltos no código. Todo texto deve seguir o padrão oficial documentado abaixo.

---

## 2. Ações e Botões Principais

| Ação no Código | Rótulo em Português | Contexto |
| :--- | :--- | :--- |
| `LOCK_TASK` | **Iniciar Tarefa** | Quando a tarefa está `OPEN` |
| `COMPLETE_TASK`| **Concluir Tarefa** | Quando a tarefa está `LOCKED` |
| `BLOCK_TASK` | **Reportar Impedimento** | Para registrar que a tarefa não pode ser feita |
| `UNBLOCK_TASK` | **Resolver Impedimento** | Para liberar uma tarefa `BLOCKED` |
| `ADD_TASK` | **Nova Tarefa** | Botão primário do quadro |
| `ADD_EXPENSE` | **Lançar Despesa** | Botão primário da carteira |
| `SETTLE_DEBT` | **Liquidar Saldo** | Transferência entre membros |

---

## 3. Mensagens de Notificação & Toasts

- **Lock Iniciado:** *"Tarefa bloqueada para sua execução. Você tem 45 minutos."*
- **Tarefa Concluída:** *"Tarefa concluída! Rodízio avançado para [Nome do Próximo]."*
- **Impedimento Registrado:** *"Impedimento reportado com sucesso. A casa foi notificada."*
- **Férias Ativadas:** *"Modo férias ativado. Você será temporariamente saltado dos rodízios."*
- **Erro de PIN:** *"PIN incorreto. Verifique seus dígitos e tente novamente."*
