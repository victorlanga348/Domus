# Task: Auditoria de Design e Limpeza de Vícios & Clichês de IA
**Data:** 2026-09-02  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/copywriting/microcopy.md]]`, `[[docs/brand/identity.md]]`, `[[docs/pages/settings.md]]`, `[[docs/components/sidebar-header.md]]`, `[[docs/components/modals.md]]`

---

## 1. Contexto & Problema

A interface do DOMUS acumulou padrões visuais, cópias e micro-interações típicas de código gerado por IA sem curadoria humana/editorial:
1. **Animações e Efeitos Desnecessários (Cosmetic Slop):**
   - Notificações tipo toast utilizando `animate-bounce` contínuo e `shadow-2xl` desproporcional (`App.tsx`, `ReportsView.tsx`), que distraem e poluem visualmente a tela.
   - Botão de Modo Férias no cabeçalho com `animate-pulse` infinito (`Header.tsx`).
2. **Artefatos e Imagens Ocultas de IA:**
   - Imagem de fundo em `SettingsView.tsx` vinculada a URL externa efêmera do Google AI (`lh3.googleusercontent.com/aida-public/...`).
   - URLs do Google AI em avatares do modal de membros (`Modals.tsx`).
3. **Inconsistência Tipográfica e Emojis em Elementos de Controle:**
   - Emojis inseridos diretamente no meio de `<option>` e badges (`🔁`, `👑`, `🛒`, `🔧`, `⚡`, `🌐`, `🍕`, `🌅`, `☀️`, `🌙`) em vez de ícones vetoriais padronizados do Material Symbols.
4. **Copywriting Genérico, Jargões Corporativos e Alucinações de Escopo:**
   - Subtítulos com frases batidas de IA como *"Gestão Colaborativa de Convivência & Escalas Inteligentes"*.
   - Metáforas fora do contrato de dados (*"Arquiteto Principal"* em vez de *Admin Geral*).
   - Descrição de Modo Noturno alucinando funções de domótica (*"ativa sensores de segurança e ajusta luzes ambiente"*), quando o DOMUS é uma plataforma de convivência residencial.
   - Inconsistência de idioma: termos em inglês (*"ACTIVE MEMBERS"*, *WalletView*) em um app em português.

---

## 2. Solução Proposta

1. **Higienização Visual e de Interação:**
   - Remover `animate-bounce` dos toasts em `App.tsx` e `ReportsView.tsx`, adotando animação serena de entrada (`animate-in fade-in slide-in-from-bottom-2 duration-200`) e sombra equilibrada (`shadow-lg`).
   - Remover `animate-pulse` perpétuo do botão de Modo Férias no `Header.tsx`.
   - Eliminar a imagem de fundo oculta de URL externa em `SettingsView.tsx`, mantendo a superfície sóbria em `#16302e` com bordas sutis.
   - Substituir avatares com URL de IA por referências padronizadas do Unsplash/Unisex em `Modals.tsx`.
2. **Remoção de Emojis em Controles e Padronização de Ícones:**
   - Substituir emojis soltos em `TasksRotationsView.tsx` e `Modals.tsx` por ícones Material Symbols vetoriais com alinhamento refinado (`repeat`, `shopping_cart`, etc.).
   - Remover emojis de coroas `👑` em tags e opções, substituindo pelo selo/ícone `workspace_premium` ou `verified` do design system.
3. **Refatoração Editorial do Copywriting (Microcopy Humana e Precisa):**
   - `AuthView.tsx` e `HouseSelectionView.tsx`: Substituir jargões por microcopy funcional (*"Gestão compartilhada da casa, tarefas e despesas em família."*).
   - `HouseSelectionView.tsx`: Corrigir papel atribuído na criação da residência para *"Admin Geral"*.
   - `SettingsView.tsx`: Adequar o texto do Modo Noturno à realidade do sistema (*"Define o horário de silêncio e repouso da casa, pausando notificações e alertas sonoros de tarefas."*).
   - `Sidebar.tsx`: Traduzir *"ACTIVE MEMBERS"* para *"MORADORES ONLINE"*.
4. **Sincronização com a Documentação Oficial:**
   - Registrar as diretrizes de anti-clichê e tom de voz em `docs/copywriting/microcopy.md` e `docs/brand/identity.md`.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - Interface com aparência profissional, autoral e editorial, eliminando a estética genérica de template de IA.
  - Eliminação de requisições de rede para URLs externas não confiáveis.
  - Coerência de linguagem (100% português consistente) e alinhamento com as regras de negócio reais do sistema.
  - Micro-interações calmas que respeitam a atenção do usuário.
- **Desvantagens / Riscos:**
  - Nenhuma perda de funcionalidade. Todas as ações e fluxos de estado permanecem idênticos.

---

## 4. Critérios de Aceitação

- [x] Toasts entram com animação suave e sem `animate-bounce`.
- [x] Modo Férias no Header exibe estado ativo sólido sem `animate-pulse`.
- [x] Nenhuma URL externa efêmera (`lh3.googleusercontent.com/aida-public/...`) permanece no código.
- [x] Nenhum emoji solto dentro de `<option>`, badges ou tags em `TasksRotationsView.tsx` e `Modals.tsx`.
- [x] Copywriting em `AuthView`, `HouseSelectionView`, `SettingsView`, `DashboardView` e `Sidebar` refatorado para tom humano, sem jargões corporativos de IA.
- [x] `rtk npm run typecheck` e `rtk npm run build` no frontend executam com código 0.
- [x] Specs afetadas em `/docs` atualizadas.

---

## 5. Plano de Implementação (Passo a Passo)

1. [x] **Documentação & Governança:**
   - Atualizar `docs/copywriting/microcopy.md` e `docs/brand/identity.md`.
2. [x] **Refatoração de Layout e Toasts (`App.tsx` e `ReportsView.tsx`):**
   - Substituir a classe `animate-bounce` e ajustar o container do toast.
3. [x] **Refatoração do Cabeçalho (`Header.tsx`):**
   - Remover `animate-pulse` do Modo Férias.
4. [x] **Limpeza de Copy e URLs em Configurações (`SettingsView.tsx`):**
   - Corrigir descrição do Modo Noturno e remover div de fundo externo.
5. [x] **Limpeza de Emojis e Avatares (`Modals.tsx`):**
   - Limpar emojis de `<option>` e badges; substituir URLs de avatar.
6. [x] **Limpeza de Emojis em Tarefas (`TasksRotationsView.tsx`):**
   - Substituir `🔁` e emojis de turnos por ícones Material Symbols.
7. [x] **Ajuste de Copywriting em Autenticação (`AuthView.tsx` e `HouseSelectionView.tsx`):**
   - Substituir slogans corporativos por copy direta e humana.
8. [x] **Tradução em Sidebar (`Sidebar.tsx`):**
   - Trocar "ACTIVE MEMBERS" por "MORADORES ONLINE".
9. [x] **Validação Técnica e Commit:**
   - Executar typecheck e build; concluir a sprint com commit.

---

## 6. Validação e Testes

- [x] `rtk npm run typecheck` concluído com sucesso.
- [x] `rtk npm run build` concluído com sucesso.
- [x] Verificação visual da eliminação de animações pulantes e emojis fora do padrão.

---

## 7. Sincronização com /docs

- [x] `docs/copywriting/microcopy.md`
- [x] `docs/brand/identity.md`
- [x] Matriz de impacto validada em `[[docs/documentation-governance.md]]`.
