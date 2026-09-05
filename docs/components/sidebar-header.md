# Componentes de Navegação: Header & Sidebar

## 1. Header (`Header.tsx`)
- **Props:**
  - `currentUser`: Usuário autenticado.
  - `household`: Dados da residência ativa.
  - `onSwitchUser`: Callback para troca de perfil rápido ou reautenticação.
- **Acessibilidade:**
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
- **Responsividade & Viewport Dinâmico:**
  - Drawer slide-in/out em dispositivos móveis (`md:hidden fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh]`) com animação CSS fluida (`transition-transform duration-300 ease-in-out` entre `translate-x-0` e `-translate-x-full`), garantindo fechamento imediato no clique de qualquer rota (`onCloseMobile`).
  - Barra lateral fixa no desktop (`hidden md:flex fixed left-0 top-0 h-screen h-[100dvh] w-[250px] lg:w-[280px]`).
  - Header adaptado para telas móveis compactas (`< 380px`), com paddings reduzidos (`px-3 py-2.5`), botão de férias em modo ícone/badge curto e `min-w-0` prevenindo quebra de linha do título "DOMUS".
  - Sincronização em tempo real de moradores online via WebSocket (`house:presence`), exibindo o status de presença compartilhado entre múltiplos dispositivos na residência.
