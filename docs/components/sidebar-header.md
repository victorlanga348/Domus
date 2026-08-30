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
  - `currentTab`: Aba ativa (`dashboard | tasks | wallet | reports | settings`).
  - `onSelectTab`: Função de troca de aba.
  - `stats`: Contadores em tempo real para badges numéricos nas abas.
- **Responsividade:**
  - Oculto em mobile (`hidden md:flex`), substituído por barra de navegação inferior ou drawer.
