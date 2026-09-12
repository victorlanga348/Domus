# Auditorias de Acessibilidade (WCAG) & Performance

## 1. Diretrizes de Acessibilidade (WCAG 2.1 AA)
- **Contraste de Cores:** Rácio mínimo de contraste de 4.5:1 para textos normais e 3:1 para textos grandes e componentes interativos sobre fundo escuro.
- **Navegação por Teclado:** Foco visível (`focus-visible:ring-2 focus-visible:ring-indigo-500`) em todos os botões, links e campos de formulário.
- **Rótulos e Modais:** Gerenciamento de foco (`trap focus`), fechamento com tecla `Esc` em todos os modais e presença de `aria-label` em todos os botões de ícone sem texto visível.
- **Respeito a Movimento Reduzido (`prefers-reduced-motion`):** Regra global no CSS que neutraliza durações de animação para utilizadores com sensibilidade vestibular.
- **Estabilidade Visual & Tipografia:** Emprego de `font-variant-numeric: tabular-nums` para contadores e valores monetários/quantitativos, eliminando Cumulative Layout Shift (CLS).

---

## 2. Metas de Performance (Core Web Vitals)
- **Largest Contentful Paint (LCP):** < 1.5s
- **Interaction to Next Paint (INP):** < 150ms
- **Cumulative Layout Shift (CLS):** < 0.05
- **First Contentful Paint (FCP Mobile):** Instantâneo (~0ms) via Skeleton Inline puro no `index.html`, prevenindo o flash de tela preta causado por navegadores em Dark Mode antes da inicialização do bundle JS.
- **Isolamento de Canvas Mobile:** Configuração explícita de `<meta name="color-scheme" content="light">` e estilos inline que forçam a paleta oficial `#F4F9F7` desde o primeiro frame de renderização do SO.
- **Bundle Size:** Otimização de imports no Vite evitando carregar bibliotecas não utilizadas no bundle inicial.
- **Compositing GPU:** Animações e transições executadas estritamente em propriedades compostas pela GPU (`transform`, `opacity`).

