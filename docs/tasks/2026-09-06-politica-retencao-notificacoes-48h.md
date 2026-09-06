# Task: Política de Retenção de Notificações (TTL 48h) com Preservação de Histórico
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/components/modals.md]]`
- `[[docs/components/sidebar-header.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
Atualmente, o Drawer de Notificações (`NotificationsDrawer.tsx`) renderizava todas as entradas de `activityLogs` acumuladas na residência sem qualquer filtro temporal. Conforme a casa é utilizada ao longo das semanas, a gaveta acumulava dezenas ou centenas de notificações antigas, causando:
1. **Poluição Visual e Ruído Cognitivo:** Dificuldade do morador em identificar avisos recentes entre logs de tarefas ocorridas dias ou semanas antes.
2. **Inchaço de Estado e DOM:** Renderização desnecessária de centenas de nós DOM em um drawer lateral mobile/desktop.
3. **Falta de Gestão de Estado Lido/Não-Lido:** O usuário não conseguia marcar notificações como lidas ou limpar a gaveta de novidades.

Por outro lado, o Domus necessita de uma rígida separação entre **Auditoria da Residência** (imutável, completa) e **Feed de Notificações do Sino** (temporário, focado em novidades). Nenhum log do banco de dados ou da tela de **Relatórios** (`ReportsView`) pode ser apagado.

---

## 2. Solução Proposta (Abordagem Híbrida Padrão Notion/Linear)

### 2.1 Separação Rígida de Conceitos
1. **Auditoria & Relatórios (`ActivityLog` / PostgreSQL):**
   - Imutável. Todos os eventos gerados na casa continuam salvos e alimentam gráficos, relatórios e estatísticas.
2. **Feed do Sino / Drawer de Notificações (`NotificationsDrawer`):**
   - Atua como central de novidades recentes da residência.
   - Aplica janela temporal de **48 horas para notificações lidas** (`TTL de 48h`).
   - Notificações com mais de 48 horas saem automaticamente da visualização da gaveta.

### 2.2 Regras de Negócio do Feed de Notificações
- **Notificações Não Lidas:**
  - Permanecem visíveis na gaveta independentemente da idade até que o usuário abra o drawer ou clique em *"Marcar todas como lidas"*.
  - Alimentam o badge numérico vermelho no ícone do sino na barra superior (`Header`).
- **Notificações Lidas:**
  - Permanecem visíveis por até **48 horas** a partir do momento de criação/leitura.
  - Após 48 horas, são filtradas automaticamente da gaveta do sino.
- **Alertas de Tarefas (Aba "Alertas"):**
  - Tarefas pendentes do turno ou com aviso de antecedência continuam listadas na aba de alertas enquanto o status for `pending`.
- **Ação de Limpeza Rápida:**
  - Botão discreto *"Limpar lidas"* no topo do drawer, permitindo esvaziar visualmente a gaveta a qualquer instante sem apagar registros de auditoria.
- **Transparência & Acessibilidade:**
  - Rodapé discreto no drawer: *"Exibindo atividades de 48h • Histórico em Relatórios"*.
- **Persistência de Leitura no Frontend:**
  - Gerenciado via `localStorage` da residência com lista de IDs lidos (`${houseKey}_read_notifications`) e timestamp de limpeza rápida (`${houseKey}_notifications_cleared_at`).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Zero perda de dados:** Auditoria e compliance financeiro/operacional 100% preservados na aba Relatórios.
  - **Interface limpa e rápida:** O feed de notificações permanece leve, ágil e focado no que realmente importa no dia a dia.
  - **Padrão de excelência da indústria:** Comportamento familiar e previsível, idêntico aos melhores SaaS mundiais (Notion, Todoist, Linear).
  - **Controle pelo usuário:** Possibilidade de esvaziar as lidas manualmente sem esperar as 48 horas.
- **Desvantagens / Riscos:**
  - Um morador pode procurar um evento de 3 dias atrás na gaveta do sino e achar que foi excluído.
  - *Mitigação:* Aviso permanente com link/redirecionamento no rodapé da gaveta informando que o histórico completo está sempre disponível na aba *Relatórios*.

---

## 4. Critérios de Aceitação
- [x] Notificações lidas com mais de 48 horas são ocultadas da lista do drawer.
- [x] Notificações não lidas são mantidas no drawer até serem abertas/lidas.
- [x] O badge numérico no sino do `Header` contabiliza apenas notificações não lidas dentro do período válido.
- [x] Botão "Limpar lidas" marca todas as notificações atuais como lidas e limpa o feed imediato.
- [x] Nenhum log de auditoria é excluído do backend PostgreSQL nem da tela `ReportsView`.
- [x] Rodapé informativo com acesso ao histórico em Relatórios.
- [x] Responsividade total e conformidade com Safe Areas em iOS/Android.
- [x] Typecheck e build passando com 0 erros via `rtk`.
- [x] Documentação `/docs` sincronizada.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Frontend State & Storage (`frontend/src/shared/hooks` ou `App.tsx`):**
   - Implementar controle de notificações lidas (`readNotificationIds` e `notificationsClearedAt`) com sincronização no `localStorage`.
2. **Componente `NotificationsDrawer.tsx` (`frontend/src/components/Modals.tsx`):**
   - Adicionar cálculo do TTL de 48 horas (`now - timestamp <= 48 * 3600 * 1000`).
   - Adicionar botão de ação "Limpar lidas" / "Marcar lidas".
   - Adicionar texto de rodapé discreto com link para Relatórios.
3. **Badge do Sino (`frontend/src/components/` ou `App.tsx`):**
   - Sincronizar o contador de não-lidas com base nas notificações que ainda não foram marcadas como lidas.
4. **Validação Técnica:**
   - Executar `rtk npm run typecheck` e `rtk npm run build`.
   - Testar o comportamento com timestamps simulados (dentro de 48h e após 48h).
5. **Sincronização de Docs:**
   - Atualizar referências em `docs/components/modals.md` e na governança.

---

## 6. Validação e Testes
- [x] Typecheck do frontend (`rtk npm run typecheck`)
- [x] Build do frontend (`rtk npm run build`)
- [x] Teste do filtro de 48h e do botão "Limpar lidas"
- [x] Verificação de integridade da aba Relatórios (nenhum log ausente)

---

## 7. Sincronização com /docs
- [x] `docs/tasks/2026-09-06-politica-retencao-notificacoes-48h.md`
- [x] `docs/components/modals.md`
