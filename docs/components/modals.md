# Componentes: Modais & Diálogos (`Modals.tsx`)

## 1. Modais Gerenciados

### 1.1 Modal de Criação de Tarefa (`CreateTaskModal`)
- **Campos:** Título, Descrição, Categoria, Turno (`MORNING`, `AFTERNOON`, `NIGHT`), Seleção de Participantes do Rodízio.
- **Validação:** Exige pelo menos 1 participante e título não vazio.

### 1.2 Modal de Reportar Impedimento (`BlockTaskModal`)
- **Campos:** Texto descritivo do motivo do bloqueio (`reason`).
- **Validação:** Bloqueia envio de justificativa vazia.

### 1.3 Modal de Lançamento de Despesa (`CreateExpenseModal`)
- **Campos:** Descrição, Valor em R$, Categoria, Pagador e Membros incluídos na divisão.

### 1.4 Modal de Verificação de PIN (`PinPromptModal`)
- **Campos:** Teclado numérico virtual ou input de PIN com máscara de pontos.
- **Segurança:** Oculta dígitos digitados e bloqueia múltiplos cliques.
