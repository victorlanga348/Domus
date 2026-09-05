# Copywriting Oficial, Microcopy & Mensagens do Sistema

## 1. Regra de Ouro
Proibido inventar textos, mensagens de erro ou rótulos soltos no código. Todo texto deve seguir o padrão oficial documentado abaixo.

---

## 2. Ações e Botões Principais

| Ação no Código | Rótulo em Português | Contexto |
| :--- | :--- | :--- |
| `LOCK_TASK` | **Iniciar Tarefa** | Quando a tarefa está `OPEN` |
| `COMPLETE_TASK`| **Concluir** | Botão verde ativo para o responsável da vez |
| `WAITING_CONFIRMATION` | **Aguardando confirmação de [Nome]** | Tooltip no botão desabilitado para terceiros |
| `STATUS_COMPLETED` | **Concluída** | Selo verde de status da tarefa |
| `REVERT_TASK` | **Reverter para Pendente** | Botão discreto para Admin Geral e Sub-Admin |
| `BLOCK_TASK` | **Reportar Impedimento** | Para registrar que a tarefa não pode ser feita |
| `UNBLOCK_TASK` | **Resolver Impedimento** | Para liberar uma tarefa `BLOCKED` |
| `ADD_TASK` | **Nova Tarefa** | Botão primário do quadro |
| `ADD_EXPENSE` | **Lançar Despesa** | Botão primário da carteira |
| `SETTLE_DEBT` | **Liquidar Saldo** | Transferência entre membros |

---

## 3. Mensagens de Notificação, Toasts & Erros

- **Lock Iniciado:** *"Tarefa bloqueada para sua execução. Você tem 45 minutos."*
- **Tarefa Concluída:** *"Tarefa concluída! Rodízio avançado para [Nome do Próximo]."*
- **Tarefa Revertida:** *"Tarefa [Título] revertida para pendente."*
- **Impedimento Registrado:** *"Impedimento reportado com sucesso. A casa foi notificada."*
- **Férias Ativadas:** *"Modo férias ativado. Você será temporariamente saltado dos rodízios."*
- **Erro de PIN:** *"PIN incorreto. Verifique seus dígitos e tente novamente."*
- **Erro 403 (Concluir Tarefa de Outro):** *"Apenas a pessoa designada para esta tarefa pode marcá-la como concluída."*
- **Erro 403 (Reverter Tarefa sem Privilégio):** *"Apenas administradores e o Admin Geral têm permissão para reverter uma tarefa concluída."*
- **Erro de Permissão (Adicionar Membros):** *"Apenas administradores ou o Admin Geral podem adicionar novos membros."*

---

## 4. Diretrizes Anti-Clichês & Tom Editorial (Anti-AI Slop)

1. **Sem jargões corporativos vazios:** Proibido utilizar frases batidas de IA como "revolução da convivência", "soluções inteligentes", "eleve sua casa" ou metáforas sem relação com o produto.
2. **Sem emojis em controles estruturais:** Controles, selects (`<option>`), botões de governança e badges utilizam ícones vetoriais padronizados (Material Symbols), nunca emojis gráficos inseridos como texto.
3. **Microcopy contextual e humana:** O texto deve descrever a ação real do morador de forma calma, clara e objetiva (ex.: *"Gestão compartilhada da casa, tarefas e despesas em família"*).
4. **Coerência de idioma:** 100% dos rótulos e comandos da aplicação operam em Português do Brasil (PT-BR), sem termos em inglês soltos no layout.
