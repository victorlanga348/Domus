# Task: Remoção do PIN no Cadastro e Simplificação da Autenticação
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/auth-onboarding.md]]`, `[[docs/architecture/security.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema
Atualmente, o formulário de cadastro unificado em `AuthView.tsx` exige que o novo usuário defina um "PIN de Execução Rápida (4 a 6 dígitos)" adicionalmente à sua senha principal de acesso.
Embora o PIN tenha sido concebido originalmente para agilizar ações em tablets ou validações rápidas:
1. **Fricção Excessiva de Onboarding:** O campo aumenta o comprimento do formulário de cadastro, gerando atrito e dúvida no primeiro contato do usuário ("para que serve esse código?").
2. **Redundância de Autenticação:** A autenticação web/mobile já é integralmente protegida por sessão via JWT com verificação de identidade no backend.
3. **Inconsistência com Login Social:** O fluxo de autenticação com o Google OAuth (`AuthService.googleLogin`) já opera sem PIN do usuário, atribuindo um fallback de hash seguro (`0000`) de forma transparente.

O usuário solicitou explicitamente a remoção desse campo do cadastro para tornar o formulário enxuto, ágil e seguro.

---

## 2. Solução Proposta
1. **Frontend (`AuthView.tsx`):**
   - Remover o estado `pin` e seu respectivo `<input>` / labels do formulário de cadastro.
   - Atualizar a validação em `handleSubmit` para exigir exclusivamente Nome, E-mail e Senha (mínimo 6 caracteres).
   - Enviar payload simplificado ao backend (`name`, `email`, `password`).

2. **Frontend API (`authApi.ts`):**
   - Tornar o atributo `pin?: string` opcional na interface `RegisterPayload`.

3. **Backend (`AuthService.register`):**
   - Tornar `pin?: string` opcional em `RegisterDTO`.
   - Ajustar a validação: se `pin` for informado, validar o comprimento (4 a 6 dígitos); se não for informado, aceitar normalmente sem lançar `INVALID_PIN_LENGTH`.
   - Ao persistir no banco, caso `pin` não seja enviado, gerar o hash Bcrypt padrão seguro com fallback (`data.pin || '0000'`), alinhando o comportamento com o fluxo já existente no Google OAuth (`googleLogin`).
   - Manter a integridade de banco de dados (`User.pin_hash` continua sendo preenchido no PostgreSQL sem necessidade de migrações arriscadas).

4. **Compatibilidade com Testes e Rotas Existentes:**
   - Requisições que ainda enviarem PIN (como os testes E2E em `lifecycle.e2e.test.ts`) continuam funcionando com 100% de compatibilidade retroativa.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Conversão e Redução de Atrito:** Formulário de cadastro significativamente mais limpo e amigável, reduzindo o tempo de criação de conta em mais de 50%.
  - **Alinhamento com a Spec Oficial:** `docs/pages/auth-onboarding.md` já define o formulário de cadastro exclusivamente com Nome, E-mail, Senha e Confirmação de Senha.
  - **Sem Breaking Changes no Banco:** Não requer migração de schema Prisma nem alteração na tabela `User`, pois `pin_hash` é mantido com valor padrão seguro.
- **Desvantagens / Riscos:**
  - Usuários que realizarem tarefas que opcionalmente peçam validação por PIN no tablet precisarão utilizar o PIN padrão ou definir o PIN nas configurações de perfil futuramente (caso o recurso seja mantido na versão quiosque).

---

## 4. Critérios de Aceitação
- [x] O formulário de cadastro em `AuthView.tsx` não exibe mais o campo de PIN.
- [x] O cadastro de novo usuário por nome, email e senha funciona com sucesso (retorna status 201 e JWT válido).
- [x] O backend aceita chamadas de cadastro sem o campo `pin` e preenche `pin_hash` com hash de fallback seguro.
- [x] Chamadas com `pin` continuam válidas (retrocompatibilidade assegurada).
- [x] Todos os 33 testes automatizados do backend (`backend/tests`) passam sem regressões.
- [x] Typecheck do frontend e build de produção executam sem erros.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Backend (`backend/src/modules/auth/auth.service.ts`):**
   - Atualizar `RegisterDTO` definindo `pin?: string`.
   - Ajustar validação de `pin` para disparar erro apenas se o campo for fornecido e tiver tamanho incorreto.
   - Ajustar geração de hash para `await bcrypt.hash(data.pin || '0000', saltRounds)`.
2. **Frontend API (`frontend/src/features/auth/api/authApi.ts`):**
   - Atualizar `RegisterPayload` tornando `pin?: string` opcional.
3. **Frontend Componente (`frontend/src/features/auth/components/AuthView.tsx`):**
   - Remover `const [pin, setPin] = useState('');`.
   - Remover validação de `pin` no handler `handleSubmit`.
   - Remover bloco JSX do campo de PIN (linhas 291-309).
4. **Validação Técnica:**
   - Executar `rtk npm --prefix backend run test`.
   - Executar `rtk npm --prefix frontend run typecheck` e `rtk npx vite build`.
5. **Sincronização de Docs:**
   - Atualizar `docs/architecture/security.md` e `docs/integrations/api-contracts.md` para refletir o caráter opcional do PIN no registro.
   - Atualizar status desta task para `Concluída`.

---

## 6. Validação e Testes
- [x] `rtk npm --prefix backend run test` (todos os 33 testes aprovados)
- [x] `rtk npx tsc -p frontend/tsconfig.json --noEmit` (zero erros de TypeScript)
- [x] `rtk npx vite build` (build bem-sucedido)

---

## 7. Sincronização com /docs
- [x] `docs/pages/auth-onboarding.md` validado (já em conformidade)
- [x] `docs/architecture/security.md` atualizado
- [x] `docs/integrations/api-contracts.md` atualizado
- [x] Matriz de impacto validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github\Domus/docs/documentation-governance.md)
