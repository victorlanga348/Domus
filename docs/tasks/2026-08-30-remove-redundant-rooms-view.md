# Task: Remoção da Página Redundante de Salas & Governança
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/architecture/stack.md]]`, `[[docs/pages/dashboard.md]]`

---

## 1. Contexto & Racional
A página "Salas & Governança" era uma funcionalidade paralela de chats e sub-salas que adicionava complexidade desnecessária e desviava do foco central do DOMUS (Gestão de Rodízio, Turnos, Afazeres, Harmonia Familiar e Convivência).

---

## 2. Ações Realizadas
1. **Tipagem:** Remoção de `'rooms'` da união `TabType` em `frontend/src/types.ts`.
2. **Navegação:** Remoção do item da barra lateral `Sidebar.tsx`. A navegação agora conta estritamente com os 5 pilares do DOMUS:
   - **Dashboard** (Turnos, Mural de Recados, Execução Rápida);
   - **Tarefas** (Configuração de Afazeres, Frequências e Rodízios A-Z);
   - **Histórico de Tarefas** (Auditoria e Registro de Execução);
   - **Estatísticas** (Índice de Harmonia 0-100 e Contribuição);
   - **Configurações** (Membros, Regras e Preferências).
3. **Limpeza:** Remoção do módulo `frontend/src/features/rooms` e desvinculação em `App.tsx`.
4. **Validação Técnica:** Typecheck e builds com código 0 em ambos os pacotes.
