# Governança da Documentação & Matriz de Impacto

## Regra Principal
O diretório `/docs` é a fonte oficial da verdade. Nenhuma alteração de código é considerada concluída se não estiver sincronizada com a documentação.

---

## Matriz de Impacto (Se alterar X, atualize Y):
- **Layout / Estrutura de Telas / Rotas**: [docs/pages/](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/pages), [docs/design/responsive.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/design/responsive.md) e a spec da tela correspondente.
- **Componentes / UI**: [docs/components/](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/components) e [docs/design/tokens.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/design/tokens.md).
- **Regras de Negócio / Rodízio / Finanças**: [docs/product/](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/product) e [docs/architecture/data-model.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/architecture/data-model.md).
- **Textos / Microcopy / Mensagens de Erro**: [docs/copywriting/microcopy.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/copywriting/microcopy.md).
- **Mídias / Ícones / Identidade**: [docs/brand/identity.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/brand/identity.md).
- **APIs / Endpoints / Concorrência / Locks**: [docs/integrations/api-contracts.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/integrations/api-contracts.md), [docs/architecture/concurrency-and-locks.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/architecture/concurrency-and-locks.md) e [docs/architecture/security.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/architecture/security.md).
- **Acessibilidade / Performance**: [docs/audits/accessibility-and-performance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/audits/accessibility-and-performance.md).

---

## Checklist de Encerramento de Tarefa
Toda conclusão de sprint/tarefa exige validação dos seguintes itens:
1. Quais ficheiros de código foram alterados?
2. Que comportamento, layout ou regra foi modificada?
3. Quais documentos da matriz foram atualizados?
4. Nomes de variáveis, rotas e payloads coincidem rigorosamente entre docs e código?
5. Existe alguma alteração no projeto que não esteja refletida em `/docs`?
