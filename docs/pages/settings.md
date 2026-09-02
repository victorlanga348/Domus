# Tela: Configurações & Gestão da Residência

## 1. Objetivo da Tela
Gerenciamento de membros da casa, governança de cargos administrativos, remoção hierárquica, regras de convivência, preferências de rotinas e troca de residência.

---

## 2. Estrutura e Seções do Layout

### 2.1 Preferências Globais da Residência (100% em Português)
- **Modo Noturno:** Agendamento automático de dimmer de iluminação, sensores e economia de energia com horários de início e término.
- **Regras de Convivência:** Cadastro, listagem numerada e exclusão de regras comunitárias.

### 2.2 Gestão de Membros & Governança de Cargos
- **Hierarquia de Cargos:**
  - `👑 Admin Geral`: Único por residência. Possui governança total, promove moradores a `Admin`, destitui admins para `Resident`, remove qualquer membro (exceto a si próprio) ou transfere o cargo de Admin Geral.
  - `Admin`: Administrador auxiliar. Pode convidar novos moradores e remover moradores regulares (`Resident`/`Guest`), mas **não pode** remover outros admins nem o Admin Geral.
  - `Resident` / `Resident Restricted` / `Guest`: Moradores regulares. Não podem adicionar nem remover membros nem alterar papéis.
- **Ações Exclusivas do Admin Geral:**
  - Botão "Tornar Admin": Promove um morador regular a Administrador Normal.
  - Botão "Despromover": Rebaixa um Administrador Normal para Morador.
  - Botão "Passar Admin Geral": Abre o modal institucional de transferência de liderança única.
- **Remoção de Membros:** Botão "Remover" nos cartões com validação hierárquica estrita.
- **Botão Convidar Membro (`+`):** Visível exclusivamente para quem possui cargo `Admin Geral` ou `Admin`.

### 2.3 Troca de Residência
- Ação de troca rápida de casa ("Trocar Residência") sem deslogar a conta de usuário.

### 2.4 Sair da Residência & Sucessão Obrigatória
- Botão "Sair da Residência" no rodapé de membros, permitindo desvincular o usuário da casa ativa.
- **Regra de Ouro da Liderança:** Se o solicitante for o `Admin Geral` e existirem outros membros na casa, o sistema bloqueia a saída direta e exige a seleção de um sucessor (`newAdminId`), promovendo o novo líder de forma atômica antes de desvincular o usuário anterior.

