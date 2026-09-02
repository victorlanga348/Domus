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
  - Drawer slide-in em dispositivos móveis (`md:hidden fixed inset-0 z-50 flex`) com navegação tátil dedicada e altura estabilizada (`h-[100dvh] max-h-[100dvh]`), garantindo que itens inferiores nunca sejam cortados pela barra dinâmica do navegador móvel.
  - Barra lateral fixa no desktop (`hidden md:flex fixed left-0 top-0 h-screen h-[100dvh] w-[250px] lg:w-[280px]`).
  - Header adaptado para mobile com `min-w-0` prevenindo estouro horizontal em qualquer dispositivo.
