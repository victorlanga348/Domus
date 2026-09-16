# Task: Configuração de Rewrites no Vercel para SPA e Sincronização de Rotas
**Data:** 2026-09-16  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/architecture/stack.md]]`, `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
Ao hospedar uma Single Page Application (SPA) baseada em Vite/React na plataforma Vercel, o servidor web estático tenta, por padrão, mapear diretamente as requisições HTTP para arquivos estáticos existentes no diretório de build (`dist/`).

Quando o usuário está em uma rota que não é a raiz (ex: `/tasks`, `/dashboard`, `/meals`, `/settings`, `/reports`, `/statistics`) ou insere manualmente uma subrota na barra de endereços e recarrega a página (`F5` ou reload do navegador), a Vercel tenta localizar um arquivo físico correspondente (como `/tasks.html` ou `/tasks/index.html`). Como esses arquivos não existem fisicamente no build da SPA, o servidor responde com erro `404: NOT_FOUND`.

Adicionalmente, na implementação anterior do frontend, a navegação entre abas não refletia ativamente a URL na barra de endereços do navegador (mantendo sempre a rota raiz ou dessincronizada ao recarregar), dependendo apenas de chave no `localStorage`.

---

## 2. Solução Proposta
1. **Configuração de Rewrites da Vercel (`vercel.json`)**:
   - Adicionar arquivo `vercel.json` configurando a regra padrão de reescrita (*rewrites*) de SPA:
     ```json
     {
       "rewrites": [
         {
           "source": "/(.*)",
           "destination": "/index.html"
         }
       ]
     }
     ```
   - Para prevenir incompatibilidades decorrentes de como o projeto foi importado na Vercel (se com Root Directory configurado para `frontend` ou raiz do monorepo), disponibilizar o arquivo em `frontend/vercel.json` e como garantia na raiz `./vercel.json`.
   - A Vercel preservará a entrega prioritária de arquivos estáticos existentes (`assets/*`, `favicon.*`, `manifest.json`, `sw.js`) e redirecionará todas as rotas de navegação da aplicação para o ponto de entrada `/index.html`.

2. **Sincronização de Rotas no Frontend (`frontend/src/App.tsx`)**:
   - Permitir inicialização do estado `currentTab` a partir da rota da URL (`window.location.pathname`).
   - Atualizar a barra de endereços via `window.history.pushState` ou `replaceState` ao trocar de aba, garantindo sincronia entre a UI e a URL.
   - Escutar o evento `popstate` para permitir navegação nativa com os botões "Avançar" e "Voltar" do navegador.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Elimina completamente o erro `404: NOT_FOUND` da Vercel ao recarregar a página ou acessar links diretos.
  - Habilita suporte a deep-linking (compartilhamento ou salvamento em favoritos de abas específicas como `/tasks` ou `/settings`).
  - Permite o uso dos botões nativos de avançar/voltar do histórico do navegador.
  - Zero impacto em performance de carregamento ou bundle size.
- **Desvantagens / Riscos:**
  - Requisições a URLs que realmente não existam serão roteadas para o `/index.html` da aplicação, exigindo que o client-side trate rotas desconhecidas (fallback para `/dashboard`).

---

## 4. Critérios de Aceitação
- [x] Arquivo `vercel.json` configurado com rewrites direcionando `/(.*)` para `/index.html`.
- [x] Ao recarregar a página em qualquer rota no Vercel (ex: `/tasks`, `/settings`), a Vercel não retorna `404: NOT_FOUND`.
- [x] O frontend identifica a rota inicial da URL (`pathname`) e ativa a aba correspondente caso válida.
- [x] A navegação entre abas atualiza a URL sem causar recarregamento de página.
- [x] O histórico do navegador (botão voltar/avançar) restaura a aba correta via evento `popstate`.
- [x] Build de produção (`rtk npm run build`) e typecheck (`rtk npm run typecheck`) executam sem erros.
- [x] Documentação em `docs/architecture/stack.md` atualizada refletindo a configuração de hospedagem Vercel.

---

## 5. Plano de Implementação (Passo a Passo)
1. Criar `frontend/vercel.json` e `./vercel.json` com a regra canônica de rewrite para SPA.
2. Atualizar a inicialização e o hook de abas em [frontend/src/App.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx) para ler/escrever no `window.location.pathname` e tratar `popstate`.
3. Validar a compilação de produção e integridade de tipos com `rtk npm run typecheck` e `rtk npm run build`.
4. Atualizar a especificação técnica em [docs/architecture/stack.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/architecture/stack.md).

---

## 6. Validação e Testes
- [x] Typecheck sem erros (`rtk npm run typecheck` no frontend).
- [x] Build de produção executado com sucesso (`rtk npm run build` no frontend).
- [x] Validação de integridade dos arquivos `vercel.json` (sintaxe JSON válida).

---

## 7. Sincronização com /docs
- [x] `docs/architecture/stack.md` atualizado com a seção de Deploy / Rewrites da Vercel.
- [x] Governança validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md).
