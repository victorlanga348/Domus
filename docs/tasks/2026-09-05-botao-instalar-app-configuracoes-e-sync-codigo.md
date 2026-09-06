# Task: Botão de Instalar App nas Configurações & Sincronização Definitiva do Código da Casa
**Data:** 2026-09-05  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/pages/settings.md]]`
- `[[docs/pages/dashboard.md]]`
- `[[docs/design/responsive.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
1. **Divergência de Código da Casa:** O código da residência exibido em Configurações divergia do código exibido no banner do Mural de Recados devido à inicialização com fallback estático `'CASA-DOMUS'` em `App.tsx` e à ausência de sincronização de `data.house` no estado central de residência.
2. **Acesso Facilitado para Instalação de App (PWA):** O usuário solicitou um botão dedicado nas **Configurações** para permitir instalar o DOMUS como aplicativo no celular ou desktop, tornando a transição para app nativo (`standalone`) acessível e intuitiva.

---

## 2. Solução Proposta

### 2.1 Botão "Instalar Aplicativo DOMUS" nas Configurações (`SettingsView.tsx`)
- Adicionar uma seção dedicada de **Aplicativo & Instalação**:
  - **Detecção de Plataforma e Estado:**
    - Se o app já estiver rodando em tela cheia (`standalone` / PWA instalado): exibe badge esmeralda `"Aplicativo Instalado"` com ícone de verificação e descrição de funcionamento otimizado.
    - Se o navegador suportar `beforeinstallprompt` (Android, Chrome, Edge, Brave, Desktop): o botão **"Instalar Aplicativo DOMUS"** aciona o prompt nativo do sistema operacional com um único toque.
    - Se o usuário estiver no **iOS (Safari)** ou o prompt do navegador falhar: ao clicar no botão, abre um modal explicativo sereno com o passo a passo ilustrado (*1. Toque em Compartilhar; 2. Selecione 'Adicionar à Tela de Início'; 3. Toque em Adicionar*).
  - **Design & Acessibilidade:** Botão com contraste WCAG em tom institucional âmbar/dourado (`#ffca5e` / `#16302e`), ícone `install_mobile` / `download`, feedback tátil e tooltip informativo.

### 2.2 Sincronização Unificada do Código da Residência (`App.tsx` & `DashboardView.tsx`)
- **Eliminação do Placeholder Estático:** Remover o valor `'CASA-DOMUS'` atribuído no login em `App.tsx`.
- **Sincronização Central:** No hook de carregamento em `App.tsx`, atualizar `currentHouse` com `data.house.invite_code` e `data.house.name` retornados do PostgreSQL via `getDashboardData`.
- **Consumo Coerente no Dashboard:** Passar `currentHouse` como prop para `DashboardView` ou sincronizar `dashboardData` para garantir que o banner do Mural e a tela de Configurações exibam rigorosamente o mesmo código.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Experiência Nativa Sem Fricção:** Moradores encontram facilmente onde e como instalar o DOMUS no smartphone direto pelo painel de configurações.
  - **Compatibilidade Total (Android + iOS + Desktop):** Trata tanto navegadores com suporte ao evento nativo quanto o fluxo manual do Safari no iPhone/iPad.
  - **Consistência de Dados 100% Garantida:** Elimina de vez qualquer divergência entre códigos de convite exibidos nas diferentes telas.
- **Desvantagens / Riscos:**
  - Nenhum risco técnico identificado; o fluxo do PWA e a reatividade do React permanecem limpos e desacoplados.

---

## 4. Critérios de Aceitação
- [x] O código da residência exibido no banner do Dashboard e na página de Configurações é estritamente o mesmo em tempo real.
- [x] Botão de "Instalar Aplicativo DOMUS" presente na tela de Configurações.
- [x] No Chrome/Android/Desktop, o clique no botão aciona o prompt nativo de instalação do PWA.
- [x] No iOS Safari, o clique abre instruções visuais claras de como adicionar à tela de início.
- [x] Se o aplicativo já estiver instalado (`display-mode: standalone`), exibe status indicativo de aplicativo ativo.
- [x] Typecheck e build do frontend validados com código de saída 0.
- [x] Documentação de [docs/pages/settings.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/pages/settings.md) sincronizada.

---

## 5. Plano de Implementação (Passo a Passo)
1. Atualizar `App.tsx` para sincronizar `currentHouse` com `data.house` da API e propagar para `DashboardView`.
2. Criar listener global do evento `beforeinstallprompt` no frontend (ex: hook ou listener em `App.tsx` / `SettingsView.tsx`).
3. Adicionar o card/seção de instalação no `SettingsView.tsx` com botão de instalação e modal de instruções para iOS.
4. Validar funcionalidade no navegador e executar typecheck / build.
5. Sincronizar documentação e realizar commit.
