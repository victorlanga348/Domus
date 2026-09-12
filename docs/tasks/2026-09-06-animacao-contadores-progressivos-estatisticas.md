# Task: Animação Fluida de Contagem Progressiva (Count-Up) em Estatísticas
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/design/responsive.md]]`

---

## 1. Contexto & Problema
Na tela de **Estatísticas & Índice de Harmonia**, os indicadores quantitativos chave (o score principal de **100/100 pts** da Saúde da Convivência e os contadores de *Concluídas*, *Bloqueios* e *Falhas*) são renderizados de forma instantânea e estática. Quando o usuário clica no botão "Atualizar", a tela apenas recarrega os dados sem feedback visual imediato de recálculo ou dinamismo.

---

## 2. Solução Proposta

1. **Componente Reutilizável de Contador Animado (`AnimatedCounter`):**
   - Criação de componente em `frontend/src/features/statistics/components/AnimatedCounter.tsx`.
   - Execução via `requestAnimationFrame` com curva de desaceleração suave `easeOutExpo` (`1 - Math.pow(2, -10 * t)`).
   - Suporte a duração configurável (~1100ms - 1300ms) e `delay` de entrada.
   - Cancelamento limpo do frame (`cancelAnimationFrame`) e timeout no cleanup para evitar vazamentos de memória.
   - Suporte a gatilho de re-animação (`animKey`) para reiniciar a contagem ao atualizar os dados.

2. **Aplicação nos Indicadores da Tela (`StatisticsView.tsx`):**
   - **Saúde da Convivência:** O contador principal sobe progressivamente de 0 até o valor final (`score / 100 pts`).
   - **Cards de Métricas:** Concluídas, Bloqueios e Falhas entram em contagem com atraso sincronizado de 100ms em relação ao indicador principal.
   - **Badge de Nível / Status ("Excelente"):** Transição suave de escala e opacidade (`scale-95 opacity-0` -> `scale-100 opacity-100`) disparada ao término da contagem do score principal.

3. **Interatividade no Botão "Atualizar":**
   - Ícone de reload ganha rotação contínua (`animate-spin`) durante a requisição de busca/cálculo de dados.
   - Ao concluir a atualização, o `animKey` é incrementado, acionando a animação de contagem para fornecer feedback visual de recálculo ao morador.
   - Feedback tátil no clique: `active:scale-[0.97] transition-all cursor-pointer`.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  * Sensação de aplicativo premium e dados vivos em tempo real.
  * Custo de CPU/GPU mínimo via `requestAnimationFrame` sem bibliotecas pesadas de animação numérica.
  * Feedback tátil e visual de atualização claro e imediato.
- **Desvantagens / Riscos:**
  * Valores decimais ou alterações rápidas de estado podem gerar flicker se não houver arredondamento limpo. Resolvido com `Math.round(val)` no formatter interno.

---

## 4. Critérios de Aceitação
- [x] O componente `AnimatedCounter` anima suavemente de 0 até o valor numérico final com `easeOutExpo`.
- [x] O score principal da Saúde da Convivência anima progressivamente ao abrir a tela.
- [x] Os contadores de Concluídas, Bloqueios e Falhas animam com atraso de 100ms.
- [x] O badge de nível faz fade-in e pulso suave ao finalizar a contagem.
- [x] O botão "Atualizar" exibe `animate-spin` no ícone durante o carregamento e reinicia a contagem dos números ao concluir.
- [x] Acessibilidade motora: `@media (prefers-reduced-motion: reduce)` exibe o valor final imediatamente sem animação de contagem.
- [x] `rtk npx tsc --noEmit` e `rtk npx vite build` sem erros.
- [x] Testes do backend (48/48) mantidos intactos.

---

## 5. Plano de Implementação (Passo a Passo)
1. Criar `frontend/src/features/statistics/components/AnimatedCounter.tsx`.
2. Exportar `AnimatedCounter` em `frontend/src/features/statistics/index.ts`.
3. Atualizar `frontend/src/features/statistics/components/StatisticsView.tsx`:
   - Integrar `AnimatedCounter` nos contadores de score, tarefas concluídas, bloqueios e falhas.
   - Adicionar controle de término de contagem para o badge de nível.
   - Adicionar estado `isRefreshing` com rotação no ícone de atualização e regeneração de chave de animação.
4. Executar validação técnica:
   - `rtk npx tsc --noEmit`
   - `rtk npx vite build`
   - `rtk npm test`
5. Atualizar especificações em `docs/design/responsive.md` e marcar task como Concluída.
6. Realizar commit em português.

---

## 6. Validação e Testes
- [x] Typecheck sem erros (`rtk npx tsc --noEmit`)
- [x] Build de produção (`rtk npx vite build`)
- [x] Testes backend (`rtk npm test`)

---

## 7. Sincronização com /docs
- [x] Atualizar `[[docs/design/responsive.md]]` com o padrão de Contadores Progressivos (Count-Up).
- [x] Atualizar `[[docs/tasks/2026-09-06-animacao-contadores-progressivos-estatisticas.md]]` para status `Concluída`.
