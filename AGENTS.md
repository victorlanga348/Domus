# AGENT OPERATING STANDARD & SPEC-DRIVEN DEVELOPMENT (DOMUS)

## 1. Fonte da Verdade
1. O diretório `/docs` é a única fonte oficial da verdade sobre arquitetura, regras de negócio, design e contratos de dados.
2. Nunca assumir requisitos não documentados nem inventar regras de negócio ou payloads de API.
3. Se faltar informação oficial ou houver ambiguidade, marcar como `[PENDENTE DE VALIDAÇÃO]` e perguntar ao utilizador.
4. **Proibido alterar código** antes de apresentar o plano de implementação (com vantagens, desvantagens e riscos) e obter aprovação explícita.

---

## 2. Fluxo Obrigatório por Tarefa / Sprint
Para qualquer alteração no projeto:
1. **Identificar as specs afetadas** em `/docs`.
2. **Criar o documento da tarefa** em `/docs/tasks/YYYY-MM-DD-nome-da-tarefa.md` utilizando o template em [docs/tasks/template.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/tasks/template.md).
3. **Apresentar o Plano**:
   - Contexto e Problema;
   - Solução proposta;
   - Análise de Trade-offs (Vantagens, Desvantagens, Riscos);
   - Critérios de Aceitação;
   - Checklist passo a passo.
4. **Aguardar Aprovação**: Parar e aguardar validação explícita do utilizador antes de tocar no código.
5. **Implementação Mínima**: Escrever o código estritamente necessário em formato cirúrgico (Diff/Snippet).
6. **Validação Técnica**: Executar typecheck, linter, testes e build via terminal com prefixo `rtk`.
7. **Sincronização de Docs**: Atualizar todas as specs afetadas conforme a [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md).
8. **Relatório Final**: Finalizar respondendo obrigatoriamente:
   > *"Existe alguma alteração no projeto que não esteja refletida em /docs?"*
9. Depois de cada sprint realize testes nela e se tudo estiver a correr bem faca o commit dela antes de avancar para a proxima sprint

---

## 3. Diretrizes de Qualidade e Código
- **Sem Placeholders**: Imagens, textos e links devem ser os reais definidos na documentação oficial.
- **Acessibilidade e Mobile-First**: Qualquer componente ou tela deve ser validado em Mobile, Tablet e Desktop com suporte a navegação por teclado e contraste adequado.
- **Escopo Restrito**: Proibido refatorar arquivos adjacentes ou adicionar dependências sem autorização explícita.
- **Execução de Comandos CLI**: Sempre utilizar o prefixo `rtk` para comandos no terminal (ex: `rtk npm run build`, `rtk git status`).
