# Auditorias de Acessibilidade (WCAG) & Performance

## 1. Diretrizes de Acessibilidade (WCAG 2.1 AA)
- **Contraste de Cores:** Rácio mínimo de contraste de 4.5:1 para textos normais e 3:1 para textos grandes e componentes interativos sobre fundo escuro.
- **Navegação por Teclado:** Foco visível (`focus-visible:ring-2 focus-visible:ring-indigo-500`) em todos os botões, links e campos de formulário.
- **Rótulos e Modais:** Gerenciamento de foco (`trap focus`) e fechamento com tecla `Esc` em todos os modais.

---

## 2. Metas de Performance (Core Web Vitals)
- **Largest Contentful Paint (LCP):** < 1.5s
- **Interaction to Next Paint (INP):** < 150ms
- **Cumulative Layout Shift (CLS):** < 0.05
- **Bundle Size:** Otimização de imports no Vite evitando carregar bibliotecas não utilizadas no bundle inicial.
