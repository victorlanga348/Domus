# Tela: Fluxo de Autenticação e Onboarding de Residência

## 1. Objetivo da Interface
Permitir que novos e recorrentes moradores criem suas contas, acessem o sistema e vinculem-se a uma residência (criando uma nova ou ingressando em uma existente por código de convite), respeitando a identidade visual minimalista, serena e refinada do DOMUS.

---

## 2. Telas do Módulo

### 2.1 Cadastro (`RegisterView`)
- **Layout:** Split-screen (Hero fotográfico com gradiente esmeralda escuro à esquerda e formulário à direita).
- **Campos:**
  - Nome Completo (`name`)
  - Email (`email`)
  - Senha (`password`)
  - Confirmação de Senha (`confirmPassword`)
- **Ações:** Criar Conta, login com Google ("Continuar com o Google"), link para login ("Log in here").

### 2.2 Login (`LoginView` / `AuthView`)
- **Layout:** Card centralizado com cantos arredondados sobre fundo verde-menta sereno.
- **Login Social (Google OAuth 2.0):**
  - Botão oficial "Continuar com o Google" com logotipo da marca Google em SVG.
  - Container responsivo com largura dinâmica (`w-full max-w-full overflow-hidden flex justify-center`), adaptando a largura do iframe oficial do GSI aos limites do dispositivo móvel sem estourar margens laterais.
  - Divisor discreto "ou continue com e-mail".
  - Integração com Google Identity Services capturando ID Token (`credential`).
- **Campos Tradicionais:**
  - Email (`email`)
  - Senha (`password`) com atalho "Forgot password?"
  - Alternador "Remember me"
- **Ações:** Entrar ("Entrar"), link para criação ("Criar Conta"), autenticação em 1 clique via Google.

### 2.3 Escolha de Residência / Boas-vindas (`HouseholdSelectionView` / `HouseSelectionView`)
- **Layout:** Moldura institucional DOMUS com cards interativos de seleção e formulários.
- **Seção Superior - Minha Residência Atual:**
  - Exibida dinamicamente **apenas** quando o usuário possui vínculo ativo com uma residência (`house_id !== null`).
  - Usuários que saíram da residência (`house_id === null`) **não** visualizam casas salvas nem códigos de convite antigos.
  - Acesso direto seguro para alternância de contexto sem expor o `invite_code` na tela pública.
- **Card 1 - Criar Residência:**
  - Ícone de casa em círculo suave (`add_home`).
  - Título: "Criar Nova Residência".
  - Descrição: "Você será o Administrador Geral da casa".
  - Formulário minimalista: apenas o Nome da Residência. Sem senha.
  - O sistema gera deterministicamente o Código de Convite único no padrão `CASA-XXXX`.
- **Card 2 - Entrar em Residência:**
  - Ícone de chave (`key`).
  - Título: "Entrar em Residência".
  - Descrição: "Insira o Código de Convite da casa (ex: CASA-4892)".
  - Ação: "Validar Código & Entrar".

### 2.4 Criar Residência (`HouseSelectionView`)
- **Layout:** Card refinado centralizado na moldura DOMUS.
- **Campos:**
  - **Nome da Residência:** Input de texto simples (Placeholder: "ex: Casa Alameda, República Central...").
  - **Senha da Residência:** **Eliminada (Opção A).** Residências não utilizam senhas; a governança de acesso apoia-se no Código de Convite rotativo e exclusivo.
- **Ações:** "Criar Residência & Acessar" (cria e autentica o usuário como `ADMIN` - Administrador Geral).

### 2.5 Entrar em Residência (`HouseSelectionView`)
- **Layout:** Card refinado centralizado na moldura DOMUS.
- **Campos:**
  - **Código de Convite da Residência:** Input de texto com normalização automática em maiúsculas (Placeholder: "ex: CASA-4892").
  - **Senha da Residência:** **Eliminada (Opção A).**
- **Regras:**
  - **Reingresso Obrigatório por Código:** Qualquer usuário que se desvincular da casa deve obrigatoriamente preencher o Código de Convite para reingressar. Não há bypass de 1 clique.
  - **Reset de Cargo:** Qualquer usuário que ingressar ou reingressar entra estritamente com cargo de **Morador** (`Resident` / `MEMBER`), sem retenção de privilégios de liderança anteriores.
  - **Rotação de Credenciais:** Caso o código vaze ou seja esquecido, o `Admin Geral` utiliza o botão "Regenerar Código" no painel de configurações para emitir um novo `CASA-XXXX`, invalidando o anterior em tempo real.
- **Ações:** "Validar Código & Entrar".

---

## 3. Diretrizes de Design & Cores
- **Fundo Principal:** `#f0fcfa` / `#e4f0ee`
- **Container Escuro / Moldura:** `#132b25` / `#16302e`
- **Botões Primários:** `bg-[#16302e]` com hover `bg-[#20423f]`, texto branco e ícone de seta.
- **Inputs:** Bordas sutis em `#cfe0dc` ou `#d0dddb`, fundo branco ou `#f9fdfc`, foco com anel `#16302e`.
- **Tipografia:** `Inter`, com títulos em pesos 600-700 e `tracking-tight` / `tracking-widest` no logo DOMUS.
- **Campos de Senha (`input[type="password"]`):** Tipografia `caption, -apple-system, ...` com `letter-spacing: 0.12em` para exibir pontilhados discretos e proporcionais do SO nativo, alternando para `Inter` quando a visibilidade é ativada.

