# Task: Redução e Refinamento Visual dos Pontos de Máscara de Senha (CSS Password Bullets)
**Data:** 2026-09-12  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/auth-onboarding.md]]`, `[[docs/design/tokens.md]]`

---

## 1. Contexto & Problema
1. **Pontilhados Gigantescos ao Digitar Senha:** Quando o usuário digita a senha em campos com `type="password"`, a fonte herdada da aplicação (`Inter`) renderiza o glifo de bala (`•` / U+2022) em tamanho excessivamente grande e espesso.
2. **Desproporção Visual com o Design System:** O tamanho desses círculos pretos compromete a estética serena, minimalista e premium do DOMUS em telas de login e cadastro ([AuthView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/AuthView.tsx), [LoginView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/LoginView.tsx), [RegisterView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/RegisterView.tsx)).

---

## 2. Solução Implementada
1. **Padronização Global em `index.css` para `input[type="password"]`:**
   - Aplicado `font-family: caption, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;` exclusivamente aos inputs do tipo `password`. Isso instrui o motor de renderização do navegador a utilizar o glifo de máscara nativo do sistema operacional (discreto, circular e perfeitamente proporcionado).
   - Aplicado `letter-spacing: 0.12em;` para garantir espaçamento harmônico entre cada ponto digitado.
   - Definido `input[type="password"]::placeholder { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; letter-spacing: normal; }` para que textos de placeholder mantenham a renderização padrão da fonte Inter.
2. **Comportamento com Toggle de Visibilidade (`showPassword`):**
   - Ao alternar para `type="text"` (exibir senha), o seletor `input[type="password"]` deixa de ser aplicado e o texto desmascarado renderiza com a fonte `Inter` e espaçamento normal.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Solução leve, não intrusiva e padronizada universalmente via CSS.
  - Funciona imediatamente em todos os componentes de autenticação presentes e futuros.
  - Elimina os pontilhados gigantescos no Chrome, Edge, Safari e Firefox sem necessidade de bibliotecas externas.
- **Desvantagens / Riscos:**
  - Nenhum risco arquitetural, de compatibilidade ou de acessibilidade.

---

## 4. Critérios de Aceitação
- [x] Pontos da senha digitada renderizados com tamanho proporcional e discreto ao invés dos círculos gigantes da fonte Inter.
- [x] Espaçamento elegante entre os pontos digitados (`letter-spacing: 0.12em`).
- [x] Ao alternar para exibir a senha (`showPassword = true`), o texto puro é renderizado normalmente na fonte `Inter`.
- [x] Placeholders mantêm formatação limpa e legível.
- [x] Typecheck e validações técnicas aprovados sem erros.

---

## 5. Plano de Implementação (Passo a Passo)
1. [x] Inserir a regra tipográfica de `input[type="password"]` e `input[type="password"]::placeholder` em [frontend/src/index.css](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/index.css).
2. [x] Validar o comportamento nos componentes [AuthView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/AuthView.tsx), [LoginView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/LoginView.tsx) e [RegisterView.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/auth/components/RegisterView.tsx).
3. [x] Executar typecheck e testes do frontend (`rtk npm --prefix frontend run typecheck`).
4. [x] Atualizar o documento da tarefa e sincronizar especificações em `/docs`.

---

## 6. Validação e Testes
- [x] Typecheck do frontend (`rtk npm --prefix frontend run typecheck`) -> 0 erros
- [x] Testes automatizados do repositório (`rtk npm --prefix backend test`) -> 57/57 aprovados
- [x] Build de produção do frontend (`rtk npm --prefix frontend run build`) -> Sucesso
- [x] Validação visual do campo de senha no estado oculto (`password`) e revelado (`text`)

---

## 7. Sincronização com /docs
- [x] Atualizado [docs/pages/auth-onboarding.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/pages/auth-onboarding.md)
- [x] Atualizado [docs/design/tokens.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/design/tokens.md)

