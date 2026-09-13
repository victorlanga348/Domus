# Tela: Dashboard Principal (Mural de Recados)

## 1. Objetivo da Tela
Oferecer ao morador um espaço acolhedor, interativo e centralizado para recados, avisos familiares, notas adesivas (post-its) e comunicação interna da residência, eliminando duplicações com a área de tarefas e rotinas.

---

## 2. Estrutura e Seções do Layout

### 2.1 Cabeçalho & Visão Geral da Residência
- Identificação da residência e código de convite da casa (`invite_code`).
- Total de moradores ativos na residência.
- Botão de ação rápida: `Fixar Novo Recado`.

### 2.2 Mural de Recados & Avisos Interativo
- Grade responsiva de cartões post-it coloridos (Amarelo, Menta, Rosa, Lavanda, Cinza).
- Suporte a dois modos: **Recado de Texto** e **Checklist / Lista de Compras**.
- Nos cards de Checklist: lista interativa com checkboxes acessíveis, tachado suave em itens concluídos e badge com contador de progresso (ex: `2/4`).
- Título opcional, conteúdo/contexto completo e quebra de linhas respeitada.
- Identificação do autor do recado, papel e timestamp de criação.
- Ação de exclusão rápida de recados concluídos ou obsoletos.

### 2.3 Modal de Fixação de Recado
- **Seletor de Modo:** Alternador entre `[ Recado de Texto ]` e `[ Checklist / Lista de Compras ]`.
- No modo Checklist: adição dinâmica de múltiplos itens com tecla Enter ou botão "Inserir", e remoção individual antes de fixar.
- Campo de título da lista/recado e observação opcional de contexto.
- **Autoria Imutável e Verificada:** O autor é preenchido e travado automaticamente como o usuário autenticado (`authUser.name`), prevenindo fraudes ou impersonações.
- Seletor de cor do cartão (Amarelo, Menta, Rosa, Lavanda, Cinza).
- Sincronização em tempo real via WebSocket de novos recados, atualizações de checklist e exclusões com todos os dispositivos na mesma residência.

---

## 3. Persistência Centralizada & Endpoints (PostgreSQL)
- **Fonte da Verdade:** Todos os recados do mural são armazenados centralizadamente no PostgreSQL sob o modelo `BulletinBoard` indexado por `house_id`.
- **Formato Estruturado Retrocompatível:** O campo `content` armazena de forma transparente payloads JSON contendo `{ type, title, text, color, items }` ou texto puro (zero migração DDL).
- **Endpoints Oficiais:**
  - `GET /api/v1/dashboard`: Carrega os recados oficiais da casa via BFF agregador no carregamento inicial da aplicação.
  - `POST /api/v1/dashboard/bulletin`: Persiste novo recado no banco (`house_id`, `author_id`, `content`, `meta: { title, color, type, items }`).
  - `PATCH /api/v1/dashboard/bulletin/:id`: Atualiza itens ou conteúdo do recado (ex.: marcar/desmarcar item da lista).
  - `DELETE /api/v1/dashboard/bulletin/:id`: Remove recado do banco com validação de autoria ou permissão de Admin Geral.
  - **Broadcast WebSocket:** Eventos `house:note_created`, `house:note_updated` e `house:note_deleted` garantem atualização instantânea para todos os moradores conectados à sala da residência.

---

## 4. Estados de Carregamento & Perceived Performance
- **`DashboardSkeleton`:** Durante a busca inicial de dados (`GET /api/v1/dashboard`), a interface exibe um esqueleto estruturado com animação de pulso suave nos tons da marca DOMUS (`#e4f0ee` e `#d0dddb`), eliminando a exibição prematura de falsos estados vazios e prevenindo deslocamentos acumulados de layout (CLS).
- **Fallback Acessível:** Usuários com a diretiva `prefers-reduced-motion: reduce` visualizam o esqueleto estático sem ciclo de pulsação.


