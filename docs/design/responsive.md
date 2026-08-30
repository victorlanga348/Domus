# Diretrizes de Responsividade & Layout Mobile-First

## 1. Breakpoints Canônicos
- **Mobile (`< 768px`):**
  - Barra de navegação inferior flutuante ou header compacto com drawer menu.
  - Cartões em coluna única (`grid-cols-1`).
  - Alvos de toque (*touch targets*) mínimos de 44x44px para facilidade de uso em smartphones.
- **Tablet / Kitchen Display (`768px` a `1024px`):**
  - Layout otimizado para visualização em modo paisagem (Landscape) em telas de bancada/cozinha.
  - Grids de 2 colunas para tarefas e turnos (`grid-cols-2`).
- **Desktop (`> 1024px`):**
  - Sidebar lateral fixa com navegação expandida.
  - Visualização em 3 colunas para turnos (`Manhã`, `Tarde`, `Noite`).

---

## 2. Acessibilidade de Toque
- Botões de ação rápida (`Lock`, `Concluir`, `Bloquear`) devem possuir área clicável ampla e feedback visual tátil imediato (`active:scale-95 transition-transform`).
