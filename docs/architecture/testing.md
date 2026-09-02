# Estratégia e Guia de Testes Automatizados (DOMUS)

Este documento define os padrões, arquitetura e instruções de execução da suite de testes automatizados do ecossistema DOMUS.

---

## 1. Pirâmide de Testes & Filosofia

O projeto adota uma estratégia híbrida focada em confiabilidade com máxima performance de execução:
1. **Testes Unitários:** Isolam a lógica de negócio central (rodízio circular de tarefas, bypass de moradores em modo férias, cálculo determinístico de turnos, geração de convites e funções criptográficas) sem acoplamento com banco de dados ou rede.
2. **Testes End-to-End (E2E) de API & Concorrência:** Simulam interações reais de múltiplos moradores através do servidor HTTP Express e WebSockets Socket.io em portas efêmeras, validando:
   - Fluxos de autenticação (registro e login com emissão de JWT);
   - Criação e ingresso protegido em residências;
   - Agregação do Dashboard BFF;
   - Concorrência de locks exclusivos com tratamento de conflito (HTTP 409);
   - Broadcast de presença em tempo real via WebSockets.

---

## 2. Tecnologias & Ferramentas

- **Test Runner:** Test Runner nativo do Node.js (`node:test`) e asserções estritas (`node:assert/strict`).
- **TypeScript Runtime:** `tsx --test` para compilação Just-in-Time (JIT) com suporte nativo a ESM.
- **WebSocket Client:** `socket.io-client` para testes reais de eventos e presença.
- **Isolamento:** Zero dependências adicionais no `node_modules` para testes unitários, proporcionando tempos de execução inferiores a 2 segundos.

---

## 3. Estrutura de Diretórios

```
backend/
└── tests/
    ├── unit/
    │   ├── rotation.service.test.ts  # Lógica circular de tarefas e modo férias
    │   ├── dashboard.service.test.ts # Cálculo temporal de turnos (Manhã/Tarde/Noite)
    │   └── security.test.ts          # Criptografia Bcrypt, tokens e códigos de convite
    └── e2e/
        └── lifecycle.e2e.test.ts     # Ciclo de vida completo da API, Concorrência e WebSockets
```

---

## 4. Comandos de Execução

Sempre utilize o prefixo `rtk` no terminal:

```bash
# Executar toda a suite de testes (Unitários + E2E)
rtk npm test

# Executar exclusivamente os testes unitários (rápidos e sem rede)
rtk npm run test:unit

# Executar exclusivamente os testes integrados de ponta a ponta
rtk npm run test:e2e
```

---

## 5. Diretrizes para Novos Testes

1. **Determinismo:** Testes unitários nunca devem depender de horário do sistema sem controle ou do estado do banco.
2. **Teardown Garantido:** Testes que persistirem dados no banco de dados devem usar prefixos identificáveis (ex: `test-e2e-...`) e efetuar a limpeza correspondente no hook `after()` do teste.
3. **Assertividade Estrita:** Utilizar sempre asserções de `node:assert/strict` (`assert.equal`, `assert.deepEqual`, `assert.rejects`).
