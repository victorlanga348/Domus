# Task: Configuração de PWA (Manifest), Identidade Visual do Logo, Favicon e Ícones da Aplicação
**Data:** 2026-09-05  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/brand/identity.md]]`
- `[[docs/design/responsive.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
Atualmente, a aplicação frontend do DOMUS não possui:
1. **Favicon e Ícones:** Nenhuma tag `<link rel="icon">` ou favicon configurado no [frontend/index.html](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/index.html), resultando no ícone genérico vazio do navegador e erro 404 em requisições de favicon.
2. **Logotipo Oficial e Padronizado:** A identidade visual descrita em [docs/brand/identity.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/brand/identity.md) utiliza o conceito de arquitetura serena, teto minimalista (`roofing`) e as cores institucionais `#16302e` (ardósia profunda) e `#ffca5e` (âmbar dourado), mas não há arquivo de asset vetorial (`SVG`) nem pacote de ícones PNG para o app.
3. **Manifesto PWA (`manifest.webmanifest` / `manifest.json`):** A aplicação ainda não possui arquivo de manifesto público nem meta tags para iOS/Android, impossibilitando a instalação da aplicação na tela de início de celulares e desktops com experiência nativa em tela cheia (`standalone`).

---

## 2. Solução Proposta

### 2.1 Identidade Visual do Logo & Favicon DOMUS
- Criar um logotipo vetorial minimalista e sofisticado para o **DOMUS**:
  - **Símbolo:** Um frontão arquitetural geométrico com linhas limpas em âmbar dourado (`#ffca5e`) e detalhes em ardósia profunda (`#16302e`), simbolizando um lar seguro, equilibrado e silencioso.
  - **Favicon Vetorial:** `frontend/public/favicon.svg` com alta definição e suporte nativo a temas claro/escuro.
  - **Favicon Standard:** `frontend/public/favicon.ico`.
  - **Ícones PWA:** `frontend/public/icons/icon-192x192.png` e `frontend/public/icons/icon-512x512.png` com área de segurança para compatibilidade *maskable* (Android adaptive icons).
  - **Ícone Apple:** `frontend/public/apple-touch-icon.png` (180x180) para Safari no iOS.

### 2.2 Manifesto PWA (`frontend/public/manifest.webmanifest`)
- Configurar o manifesto com dados canônicos do projeto DOMUS:
  - `name`: `"DOMUS - Living System"`
  - `short_name`: `"DOMUS"`
  - `description`: `"Sistema de governança, tarefas e convivência residencial compartilhada."`
  - `start_url`: `"/"`
  - `display`: `"standalone"`
  - `background_color`: `"#16302e"`
  - `theme_color`: `"#16302e"`
  - `orientation`: `"portrait-primary"`
  - `icons`: inclusão dos ícones 192x192 e 512x512 (`any` e `maskable`).

### 2.3 Estratégia de Service Worker (Validada - Opção A)
- **Opção A Implementada: Service Worker Leve (App Shell & Network-First)**
  - Instalação completa de PWA com prompt nativo no Chrome/Android/Desktop.
  - Cache exclusivo de assets estáticos (HTML, JS, CSS, fontes e ícones).
  - Rotas de API (`/api/*`) e WebSockets (`/socket.io/*`) operam estritamente em modo **Network-Only** para garantir que tarefas, turnos e locks em tempo real nunca exibam dados defasados.

### 2.4 Integração no HTML Principal (`frontend/index.html`)
- Inseridos links para o manifesto, favicons SVG/ICO e meta tags de mobile/iOS:
  - `<link rel="manifest" href="/manifest.webmanifest" />`
  - `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
  - `<link rel="alternate icon" href="/favicon.ico" />`
  - `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`
  - `<meta name="apple-mobile-web-app-capable" content="yes" />`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`
  - `<meta name="apple-mobile-web-app-title" content="DOMUS" />`
  - `<meta name="theme-color" content="#16302e" />`

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Experiência Nativa de App:** Moradores podem abrir o DOMUS em tela cheia direto da tela de início sem barra do navegador (Safari/Chrome).
  - **Identidade Coesa:** Favicon nítido em abas do navegador e ícone de alta fidelidade na tela do celular.
  - **Zero Impacto no Real-Time:** A política estrita de network-only para APIs e sockets previne qualquer colisão ou cache fantasma de tarefas e despesas.
- **Desvantagens / Riscos:**
  - Mitigado: Cache restrito a assets imutáveis e App Shell estático.

---

## 4. Critérios de Aceitação
- [x] Logotipo vetorial elegante do DOMUS criado e salvo como asset no projeto.
- [x] Favicon SVG e ICO presentes em `frontend/public/` e referenciados no `<head>` do `index.html`.
- [x] Ícones PWA (192x192 e 512x512) gerados com qualidade e suporte a `maskable`.
- [x] `manifest.webmanifest` e `manifest.json` criados com dados reais do DOMUS e vinculados no HTML.
- [x] Meta tags para iOS Safari (`apple-touch-icon`, `apple-mobile-web-app-capable`, etc.) e cor de tema `#16302e` configuradas.
- [x] Registro do Service Worker configurado com estratégia estrita de isolamento de rotas de dados.
- [x] Build do frontend (`rtk npm run build`) executado sem erros.
- [x] Documentação de identidade de marca em [docs/brand/identity.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/brand/identity.md) atualizada.

---

## 5. Plano de Implementação (Passo a Passo)
1. [x] Criar pasta `frontend/public/` e `frontend/public/icons/`.
2. [x] Desenvolver o logotipo vetorial SVG oficial do DOMUS alinhado às diretrizes de design.
3. [x] Gerar `favicon.svg`, `favicon.ico`, `icon-192x192.png`, `icon-512x512.png` e `apple-touch-icon.png`.
4. [x] Criar o arquivo `frontend/public/manifest.webmanifest` e `manifest.json`.
5. [x] Criar o script `frontend/public/sw.js` e o registro condicional em `frontend/src/main.tsx`.
6. [x] Atualizar `frontend/index.html` com as tags de manifesto, favicon e mobile.
7. [x] Validar build e integridade de tipos com `rtk npm run build`.
8. [x] Atualizar [docs/brand/identity.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/brand/identity.md), [docs/design/responsive.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/design/responsive.md) e o status da tarefa.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` no frontend
- [x] `rtk npm run build` no frontend
- [x] Verificação de integridade dos assets PWA em `frontend/dist/`

---

## 7. Sincronização com /docs
- [x] [docs/brand/identity.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/brand/identity.md) atualizado com seção de logotipo e assets PWA.
- [x] [docs/design/responsive.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/design/responsive.md) atualizado com diretrizes de instalação PWA.
- [x] Task concluída em `docs/tasks/2026-09-05-pwa-manifest-logo-e-favicon.md`.
