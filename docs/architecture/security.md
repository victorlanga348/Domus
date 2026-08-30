# Segurança, Autenticação 2FA & Isolamento Multi-tenant

## 1. Fluxo de Autenticação em Duas Etapas (2FA Doméstico)

Para atender a dispositivos compartilhados (ex: tablet fixo na cozinha) e celulares pessoais:

```
[Passo 1: House Code] ──▶ [Passo 2: Perfil + PIN de 4-6 dígitos] ──▶ [JWT Bearer Token]
```

### 1.1 Fator 1 - House Code
- O usuário ou tablet informa o código da casa (ex: `DOMUS-9021`).
- O backend valida a existência da residência e retorna a lista pública de membros (`id`, `name`, `avatar`). Nenhuma informação sensível (hash de PIN, despesas, etc.) é exposta.

### 1.2 Fator 2 - Seleção de Membro + PIN
- O membro clica no seu avatar e digita seu PIN numérico (4 a 6 dígitos).
- O backend compara o PIN recebido contra o hash armazenado utilizando **Argon2id** ou **Bcrypt** (com salt apropriado).
- Em caso de sucesso, emite um JWT com claims de `userId`, `houseId` e `role`.

---

## 2. Isolamento Multi-tenant
- Todo middleware de autenticação extrai `houseId` e `userId` do token validado.
- Todas as consultas ao banco de dados no repositório DEVEM incluir a cláusula `WHERE houseId = :houseId` para garantir que membros de uma residência jamais acessem dados de outra.

---

## 3. Políticas de Senhas e Rate Limiting
- **Rate Limit de PIN:** Máximo de 5 tentativas consecutivas incorretas por usuário em janela de 10 minutos.
- **PINs Fracos Proibidos:** Validação contra sequências óbvias (`0000`, `1234`, `1111`).
