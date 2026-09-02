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
  - Divisor discreto "ou continue com e-mail".
  - Integração com Google Identity Services capturando ID Token (`credential`).
- **Campos Tradicionais:**
  - Email (`email`)
  - Senha (`password`) com atalho "Forgot password?"
  - Alternador "Remember me"
- **Ações:** Entrar ("Entrar"), link para criação ("Criar Conta"), autenticação em 1 clique via Google.

### 2.3 Escolha de Residência / Boas-vindas (`HouseholdSelectionView` / `HouseSelectionView`)
- **Layout:** Moldura institucional DOMUS com cards interativos de seleção e formulários.
- **Seção Superior - Minhas Residências Salvas:**
  - Exibida dinamicamente quando o usuário já possui residências criadas ou vinculadas.
  - Exibe cards com nome, código de convite, cargo (`ADMIN`/`MEMBER`) e contagem de moradores.
  - Ação: "Entrar na Casa ->" (entrada em 1 clique sem redigitação de senha).
- **Card 1 - Criar Residência:**
  - Ícone de casa em círculo suave.
  - Título: "Criar Residência".
  - Descrição: "Configure uma nova residência do zero. Você será o administrador e poderá convidar outros membros da família."
  - Ação: "Começar ->".
- **Card 2 - Entrar em Residência:**
  - Ícone de login/seta em círculo suave.
  - Título: "Entrar em Residência".
  - Descrição: "Junte-se a uma residência existente usando um código de convite fornecido pelo administrador."
  - Ação: "Inserir Código ->".

### 2.4 Criar Residência (`CreateHouseholdView`)
- **Layout:** Card refinado centralizado na moldura DOMUS.
- **Campos:**
  - **Nome da Residência:** Input com ícone `cottage`/`home` (Placeholder: "Ex: Residência Alameda").
  - **Código da Residência:** Input com ícone `vpn_key`/`tag` (Placeholder: "Ex: DOMUS-8924") com gerador automático de código de convite.
- **Ações:** "Criar Residência ->", "Voltar para opções".

### 2.5 Entrar em Residência (`JoinHouseholdView`)
- **Layout:** Card refinado centralizado na moldura DOMUS.
- **Campos:**
  - **Nome da Residência:** Input com ícone `home` (Placeholder: "Ex: Residência Alameda").
  - **Código de Convite:** Input com ícone `vpn_key` (Placeholder: "Ex: DOMUS-789X ou CASA-1234").
- **Ações:** "Entrar na Residência ->", "Voltar para opções".

---

## 3. Diretrizes de Design & Cores
- **Fundo Principal:** `#f0fcfa` / `#e4f0ee`
- **Container Escuro / Moldura:** `#132b25` / `#16302e`
- **Botões Primários:** `bg-[#16302e]` com hover `bg-[#20423f]`, texto branco e ícone de seta.
- **Inputs:** Bordas sutis em `#cfe0dc` ou `#d0dddb`, fundo branco ou `#f9fdfc`, foco com anel `#16302e`.
- **Tipografia:** `Inter`, com títulos em pesos 600-700 e `tracking-tight` / `tracking-widest` no logo DOMUS.
