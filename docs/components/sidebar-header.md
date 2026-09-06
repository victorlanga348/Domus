# Componentes de Navegação: Header & Sidebar

## 1. Header (`Header.tsx`)
- **Props:**
  - `currentUser`: Usuário autenticado.
  - `household`: Dados da residência ativa.
  - `onSwitchUser`: Callback para troca de perfil rápido ou reautenticação.
- **Acessibilidade & PWA Safe Area:**
  - Suporte nativo a Safe Area Inset Top (`padding-top: env(safe-area-inset-top, 0px)`): o elemento `<header>` possui posicionamento `sticky top-0 z-50` com fundo sólido `#f0fcfa` estendendo-se até o topo físico da tela, em perfeita fusão com a `theme-color: #f0fcfa` do sistema.
  - Container interno flex com altura mínima `min-h-[56px] sm:min-h-[64px]` garantindo que os botões (menu sanduíche, modo férias, notificações, moradores) e o título "Domus" fiquem centralizados e confortavelmente alinhados abaixo do notch / Dynamic Island.
  - Botão de alternância com `aria-label` descritivo.
  - Indicador visual claro do status da conexão/casa.

---

## 2. Sidebar (`Sidebar.tsx`)
- **Props:**
  - `currentTab`: Aba ativa (`dashboard | tasks | reports | statistics | settings`).
  - `onTabChange`: Função de troca de aba.
  - `currentUser`: Morador autenticado.
  - `activeUsers`: Lista de moradores da residência.
  - `onLogoutClick`: Callback para encerramento de sessão.
  - `onSwitchHouseClick`: Callback para alternância de residência.
  - `isMobileOpen`: Booleano para controle do drawer mobile.
  - `onCloseMobile`: Callback de fechamento do drawer mobile.
- **Animação & Estilo Visual (Desktop Cut-Out):**
  - **Fusão Contínua:** O item ativo possui fundo `#f0fcfa` contínuo com o canvas principal (`<main>`), sem bordas ou sombras divisórias.
  - **Abas Invertidas (Inverted Border-Radius):** Cantos côncavos superior (`.sidebar-curve-top`) e inferior (`.sidebar-curve-bottom`) com `box-shadow` negativo calibrado para `#f0fcfa`, conectando a barra lateral escura ao painel claro.
  - **Indicador Deslizante:** Transição vertical fluida (`transform: translateY`) ancorada em `top: 0` com timing `0.35s cubic-bezier(0.4, 0, 0.2, 1)`, acionada exclusivamente por evento de clique (`onTabChange` / rota ativa) com classe `.active`, sem transições por hover.
- **Responsividade, Viewport Dinâmico & PWA Safe Areas:**
  - Drawer slide-in/out em dispositivos móveis (`md:hidden fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh]`) com animação CSS fluida (`transition-transform duration-300 ease-in-out` entre `translate-x-0` e `-translate-x-full`), garantindo fechamento imediato no clique de qualquer rota (`onCloseMobile`).
  - Padding dinâmico com Safe Area Top e Bottom (`paddingTop: calc(1.25rem + env(safe-area-inset-top, 0px))` e `paddingBottom: calc(1.25rem + env(safe-area-inset-bottom, 0px))`), protegendo o cabeçalho do drawer e a ação de logout contra sobreposição da barra de status e da barra de gestos do sistema.
  - Barra lateral fixa no desktop (`hidden md:flex fixed left-0 top-0 h-screen h-[100dvh] w-[250px] lg:w-[280px]`).
  - Header adaptado para telas móveis compactas (`< 380px`), com paddings reduzidos (`px-3 py-2.5`), botão de férias em modo ícone/badge curto e `min-w-0` prevenindo quebra de linha do título "Domus".
  - Sincronização em tempo real de moradores online via WebSocket (`house:presence`), exibindo o status de presença compartilhado entre múltiplos dispositivos na residência.
