# Task: Correção de Layout Mobile do Botão Regenerar Código de Acesso
**Data:** 2026-09-04  
**Status:** Proposta  
**Specs Impactadas:**  
- `[[docs/pages/settings.md]]`

---

## 1. Contexto & Problema
No painel de Configurações da Residência ([`SettingsView.tsx`](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/settings/components/SettingsView.tsx)), o card do "Código de Acesso da Residência" apresenta dois problemas críticos no mobile e na usabilidade:
1. **Layout Quebrado no Celular:** Dispõe três botões em linha horizontal ("Copiar", "Compartilhar" e "Regenerar") com `flex-1`. Em telas mobile (360px a 414px), cada botão recebe apenas ~90px. As palavras longas "Compartilhar" (12 caracteres) e "Regenerar" (9 caracteres), junto com ícones e padding, quebram em múltiplas linhas, quebrando o layout do botão.
2. **Botão de Compartilhar Inoperante:** A função `handleShareCode` utilizava `navigator.share` sem validação de suporte (`canShare`) e com bloco `catch {}` vazio. Em ambientes de rede local (HTTP na LAN) ou navegadores desktop que bloqueiam Web Share API sem HTTPS ou interação segura, a chamada falhava silenciosamente sem nenhum feedback visual nem fallback de cópia, dando a impressão de botão inoperante.

---

## 2. Solução Proposta
1. **Layout Mobile em Grade Adaptativa (`grid grid-cols-2 sm:flex`):**
   - **Em Telas Pequenas (Mobile `< sm`):**
     - Linha 1: Os botões de ação cotidiana **"Copiar"** e **"Compartilhar"** dividem as 2 colunas com `col-span-1` cada, garantindo largura confortável (~140px) e leitura sem quebra de texto.
     - Linha 2: O botão de segurança administrativa **"Regenerar Código"** ocupa as 2 colunas completas (`col-span-2`), ganhando destaque hierárquico, área de toque expandida (altura mínima acessível de 42px) e texto completo sem truncamento.
   - **Em Telas Maiores (Tablet / Desktop `>= sm`):**
     - Volta suavemente ao alinhamento horizontal em linha única (`sm:flex sm:items-center sm:w-auto`), com botões `sm:flex-none` e `whitespace-nowrap`.
2. **Ativação Funcional e Resiliente do Botão "Compartilhar":**
   - Verificar suporte através de `navigator.share && navigator.canShare`.
   - Montar payload completo com texto formatado de convite contendo o nome da casa, código `CASA-XXXX` e link da aplicação (`window.location.origin`).
   - Se a Web Share API for suportada e autorizada, abre a folha nativa (WhatsApp, Telegram, SMS, etc.).
   - Se a Web Share API não for suportada, estiver em contexto HTTP ou rejeitar/falhar (exceto cancelamento explícito do usuário), executar fallback automático com cópia do texto completo do convite para a área de transferência e feedback visual imediato via Toast ("Mensagem de convite copiada! Cole no WhatsApp ou envie aos moradores.").
   - Incluir fallback com `textarea` temporário para garantir cópia mesmo em contextos HTTP de rede local.
3. **Blindagem do Modal de Confirmação (`ConfirmActionModal`):**
   - No modal disparado por "Regenerar Código", assegurar que os botões de "Cancelar" e "Regenerar Código" adotem `flex-col-reverse sm:flex-row` com `w-full sm:w-auto`, prevenindo quebras ou overflow em telas estreitas.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Usabilidade Mobile Superior:** Botões com área de toque ergonômica (touch targets conformes às diretrizes de acessibilidade mobile).
  - **Compartilhamento Garantido em Qualquer Dispositivo:** Funciona em dispositivos móveis modernos (via Web Share nativo) e em computadores/HTTP local (via cópia formatada com toast).
  - **Zero Quebra de Texto:** Textos e ícones 100% legíveis em viewports a partir de 320px de largura.
- **Desvantagens / Riscos:**
  - O card de código no mobile fica ligeiramente mais alto (~36px adicionais para a segunda linha de botão).
  - **Mitigação:** O ganho em legibilidade, acessibilidade e toque ergonômico supera amplamente a altura marginal adicionada.

---

## 4. Critérios de Aceitação
- [ ] Em telas mobile (360px a 414px), os botões "Copiar", "Compartilhar" e "Regenerar Código" não quebram palavras nem truncam texto.
- [ ] O botão "Regenerar Código" ocupa largura total (`col-span-2`) no mobile quando visível para o Admin Geral.
- [ ] Ao clicar em "Compartilhar", abre a folha de compartilhamento nativo no celular suportado ou copia o texto formatado do convite com toast de sucesso em navegadores sem suporte nativo.
- [ ] Em telas desktop/tablet (`>= sm`), os botões permanecem alinhados horizontalmente sem quebra.
- [ ] O modal de confirmação de regeneração de código adapta seus botões confortavelmente no mobile.
- [ ] Typecheck do frontend passa sem erros (`rtk npm run typecheck`).
- [ ] Build de produção do frontend executa com sucesso (`rtk npm run build`).

---

## 5. Plano de Implementação (Passo a Passo)
1. **Frontend (`SettingsView.tsx`):**
   - Implementar função utilitária resiliente de cópia/compartilhamento em `handleShareCode`.
   - Refatorar o container de botões do card de código para `grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto`.
   - Adicionar `whitespace-nowrap` e `active:scale-98` nos botões.
   - Atribuir `col-span-2 sm:col-span-1` ao botão "Regenerar Código".
   - Expandir o label de "Regenerar" para "Regenerar Código" no mobile/desktop para maior clareza semântica.
2. **Frontend (`Modals.tsx`):**
   - Ajustar container de ações do `ConfirmActionModal` com `flex flex-col-reverse sm:flex-row gap-2.5` e `w-full sm:w-auto` nos botões.
3. **Validação & Testes:**
   - Validar `rtk npm run typecheck` no frontend.
   - Executar `rtk npm run build` no frontend.
4. **Sincronização de Docs:**
   - Atualizar `docs/pages/settings.md`.

---

## 6. Validação e Testes
- [ ] `rtk npm run typecheck` no frontend (0 erros)
- [ ] `rtk npm run build` no frontend (build de produção concluído com sucesso)

---

## 7. Sincronização com /docs
- [ ] `docs/pages/settings.md`
- [ ] `docs/tasks/2026-09-04-correcao-layout-mobile-botao-regenerar-codigo.md`
