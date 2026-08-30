# Task: Auditoria de Código, Limpeza e Refinamento V1 (Codebase Audit & Polish)
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/dashboard.md]]`, `[[docs/architecture/stack.md]]`

---

## 1. Contexto & Diagnóstico da Auditoria
Com a integração da V1 concluída, foi realizada uma varredura de integridade no código:
1. **Temporizador de Turno Automático:** O Dashboard se beneficia de um timer em background que detecta viradas de turno (06:00, 12:00, 18:00) e sincroniza tarefas sem exigir recarregamento manual da página.
2. **Micro-interações de Celebração:** Disparo de confetes visuais (`canvas-confetti`) e toast comemorativo ao concluir tarefas com sucesso.
3. **Código Morto / Arquivos Obsoletos:**
   - `frontend/src/features/rooms/components/CreateRoomModal.tsx` e `PasswordPromptModal.tsx` removidos após consolidação da Lobby no `RoomsView.tsx`.
4. **Qualidade e Tipagem:** Conformidade rigorosa com `tsc --noEmit` em ambos os pacotes.

---

## 2. Solução Proposta
1. Adicionar `setInterval` inteligente de virada de turno em `DashboardView.tsx` (checagem a cada 60s).
2. Adicionar micro-interação de celebração com `canvas-confetti`.
3. Remover arquivos legados obsoletos de modais de sala.
4. Executar typecheck e builds de produção em ambos os pacotes com `rtk`.

---

## 3. Critérios de Aceitação
- [x] Timer de virada de turno adicionado ao `DashboardView.tsx`.
- [x] Micro-interação de confetes ativa ao concluir tarefas com PIN.
- [x] Arquivos obsoletos removidos sem quebrar nenhuma importação.
- [x] Typecheck do frontend e backend com código 0.
- [x] Build do Vite e TSC executando com código 0.
