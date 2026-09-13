# Task: Restauração da Animação de Subida Gradual nos Contadores de Estatísticas
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/reports-and-metrics.md]]`, `[[docs/tasks/2026-09-13-correcao-loop-sincronizacao-estatisticas.md]]`

---

## 1. Contexto & Problema
Após a estabilização do loop de re-renderização, a animação de subida gradual dos números (0 até o valor final da pontuação de harmonia e métricas) parou de ser percebida:
1. **Curto-circuito por `prevValueRef` em React 19:**
   - Em `AnimatedCounter.tsx`, a referência `prevValueRef` armazenava imediatamente o valor final (`targetValue = 100`) durante a primeira montagem.
   - Quando o componente sofria um ciclo rápido de re-renderização ou montagem dupla no React 19, `startValue` igualava `targetValue` (`delta === 0`), fazendo com que o componente pulasse a animação e exibisse o número estático imediatamente.
2. **Falta de Disparo Inicial da Animação de Entrada:**
   - O contador deve iniciar visivelmente em 0 e interpolar progressivamente até a pontuação (ex: 0 -> 100 pts) na entrada da tela e em recarregamentos manuais, sem ser cancelado prematuramente.

---

## 2. Solução Proposta
1. **`frontend/src/features/statistics/components/AnimatedCounter.tsx`:**
   - Garantir que a animação inicie sempre de `startValue = 0` ao montar ou quando `animKey` for acionado, interpolando via `easeOutExpo` até o valor alvo.
   - Definir `displayValue` inicial como 0 para garantir que a subida de números seja visível para o usuário.
   - Incluir `value` e `animKey` como gatilhos legítimos de animação sem que ciclos rápidos de renderização do React cancelem a transição.
2. **`frontend/src/features/statistics/components/StatisticsView.tsx`:**
   - Garantir que `animKey` seja incrementado ao carregar dados pela primeira vez e no clique do botão "Atualizar", disparando a subida dos números de forma limpa e estável.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Restauração completa da experiência visual agradável e gamificada de subida de pontos.
  - Animação consistente e sem o jitter/oscilação que ocorria quando havia o loop infinito anterior.
- **Desvantagens / Riscos:**
  - Nenhuma; a animação respeita a preferência do sistema para redução de movimento (`prefers-reduced-motion`).

---

## 4. Critérios de Aceitação
- [x] Ao entrar na aba de Estatísticas, a pontuação de harmonia sobe progressivamente de 0 até o valor real (ex: 0 a 100 pts).
- [x] Os contadores inferiores de tarefas concluídas, bloqueios e falhas também exibem a subida gradual de números.
- [x] Ao terminar a animação, os números permanecem estáveis e fixos.
- [x] Ao clicar no botão "Atualizar", a animação é reexecutada com sucesso.
- [x] Typechecks passam com zero erros via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. Ajustar `AnimatedCounter.tsx` para assegurar que a animação inicial e por `animKey` parta de 0 até o valor alvo.
2. Ajustar `StatisticsView.tsx` para disparar `animKey` adequadamente na carga inicial e no botão "Atualizar".
3. Validar via `rtk npm run typecheck`.
4. Atualizar spec e realizar commit em português.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` (Frontend)
- [x] `rtk npm run typecheck` (Backend)
- [x] `rtk npm run test:unit` (Backend)

---

## 7. Sincronização com /docs
- [x] Tarefa documentada em `docs/tasks/2026-09-13-restauracao-animacao-contadores-estatisticas.md`
- [x] Matriz de governança conferida em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
