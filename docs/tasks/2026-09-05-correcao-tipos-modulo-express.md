# Task: Correção de Tipagens e Resolução de Módulo do Express no Backend
**Data:** 2026-09-05  
**Status:** Proposta  
**Specs Impactadas:** `[[backend/src/app.ts]]`, `[[backend/package.json]]`

---

## 1. Contexto & Problema
O arquivo [backend/src/app.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/app.ts) na linha 1 apresentava o erro de Language Server do TypeScript:
`O arquivo 'backend/node_modules/@types/express/index.d.ts' não é um módulo.` (TS2306 / TS2497).

Isso é causado por:
1. Sintaxe de importação combinando default import e named type imports em um pacote CommonJS (`export = e;`).
2. Disparidade de versões entre a biblioteca runtime (`express: ^4.21.2`) e o pacote de tipos instalado (`@types/express: ^5.0.0`).

---

## 2. Solução Proposta
1. **Separar a importação de tipos e valor em [backend/src/app.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/app.ts)**:
   ```typescript
   import express from 'express';
   import type { Express, Request, Response } from 'express';
   ```
2. **Alinhar a versão de `@types/express` no [backend/package.json](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/package.json)** para a versão `^4.17.21`, compatível com Express 4.x.
3. **Executar `npm install`** para atualizar o `node_modules` do backend e rodar `typecheck` e testes.

---

## 3. Análise de Trade-offs
- **Vantagens:** 
  - Elimina ambiguidades para o compilador do TypeScript e Language Servers em monorepos/workspaces raiz.
  - Garante que a versão dos tipos corresponda com precisão à API do Express 4.x em execução no backend.
- **Desvantagens / Riscos:** Nenhuma quebra de API em runtime, apenas ajuste fino de tipagem estática e semântica de importação.

---

## 4. Critérios de Aceitação
- [ ] `import express` e `import type { Express, Request, Response }` devidamente separados em `app.ts`.
- [ ] `@types/express` ajustado para `^4.17.21` no `package.json`.
- [ ] `rtk npm --prefix backend run typecheck` executando com código 0 (sem erros de compilação).
- [ ] Testes do backend passando integralmente.

---

## 5. Plano de Implementação (Passo a Passo)
1. Atualizar [backend/package.json](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/package.json) com `@types/express: ^4.17.21`.
2. Executar `rtk npm --prefix backend install` para sincronizar dependências.
3. Modificar [backend/src/app.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/app.ts) ajustando a importação do Express.
4. Executar `rtk npm --prefix backend run typecheck` e `rtk npm --prefix backend run test`.
5. Atualizar status desta task para Concluída e realizar commit em português.

---

## 6. Validação e Testes
- [ ] Typecheck sem erros (`rtk npm --prefix backend run typecheck`)
- [ ] Testes automatizados executados com sucesso (`rtk npm --prefix backend run test`)

---

## 7. Sincronização com /docs
- [ ] Documento de task atualizado para `Concluída`
