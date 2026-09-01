# Tela: Configurações & Gestão da Residência

## 1. Objetivo da Tela
Gerenciamento de membros da casa, governança de cargos administrativos, alternância do modo de férias, preferências de rotinas, logs de acesso e troca de residência.

---

## 2. Estrutura e Seções do Layout

### 2.1 Preferências Globais do Sistema
- **Night Mode:** Toggle de agendamento automático de dimmer de iluminação, sensores e termostato.
- **Modo Férias:** Toggle com acionamento inteligente de iluminação e pausa no rodízio de tarefas.

### 2.2 Gestão de Membros & Governança de Cargos
- **Hierarquia de Cargos:**
  - `👑 Admin Geral`: Único por residência. Possui governança total, é o único capaz de promover a `Admin`, destituir para `Resident` ou transferir o cargo de Admin Geral.
  - `Admin`: Administrador auxiliar. Pode adicionar novos membros e gerenciar tarefas, mas não pode alterar categorias.
  - `Resident` / `Resident Restricted` / `Guest`: Moradores regulares. Não podem adicionar membros nem alterar papéis.
- **Ações Exclusivas do Admin Geral:**
  - Botão "Tornar Admin": Promove um morador regular a Administrador Normal.
  - Botão "Destituir p/ Morador": Rebaixa um Administrador Normal para Morador.
  - Botão "Passar Admin Geral": Abre o modal institucional de transferência de liderança única.
- **Botão Convidar Membro (`+`):** Visível exclusivamente para quem possui cargo `Admin Geral` ou `Admin`.

### 2.3 Troca de Residência & Logs de Acesso
- Ação de troca rápida de casa ("Trocar Residência") sem deslogar a conta de usuário.
- Visualização de logs de auditoria e segurança em modal dedicado.
