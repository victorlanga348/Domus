<div align="center">

# 🏠 Domus

**Smart Home Management Dashboard**

*Organize a sua casa de forma inteligente — tarefas, finanças, relatórios e automação, tudo num só lugar.*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev)

</div>

---

## ✨ Sobre o Projeto

**Domus** é uma aplicação web de gestão doméstica inteligente, desenvolvida com React + TypeScript. Centraliza tudo o que a sua família precisa para manter a casa organizada: desde a distribuição de tarefas com rodízio automático, ao controlo de despesas partilhadas, passando por relatórios detalhados e preferências de automação.

> O nome vem do latim *domus* — casa. Uma ferramenta pensada para tornar a vida doméstica mais simples e colaborativa.

---

## 🚀 Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| 📊 **Dashboard** | Visão geral do estado da casa em tempo real |
| ✅ **Tarefas & Rodízios** | Gestão de tarefas domésticas com sistema de rotação entre membros |
| 💰 **Carteira** | Controlo de despesas partilhadas e finanças da casa |
| 📈 **Relatórios** | Estatísticas e histórico de atividade doméstica |
| ⚙️ **Definições** | Modo Noturno, membros da família e regras de convivência |
| 🤖 **IA Integrada** | Assistente inteligente com Gemini AI para sugestões e automação |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Vite 6
- **Animações:** Motion (Framer Motion)
- **Ícones:** Material Symbols, Lucide React
- **IA:** Google Gemini AI (`@google/genai`)
- **Backend (dev):** Express.js + dotenv

---

## 📦 Instalação e Execução

**Pré-requisitos:** Node.js 18+

```bash
# 1. Clonar o repositório
git clone https://github.com/victorlanga348/Domus.git
cd Domus

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local e adicionar a GEMINI_API_KEY

# 4. Iniciar em desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3002`

---

## 🔑 Variáveis de Ambiente

Cria um ficheiro `.env.local` baseado em `.env.example`:

```env
GEMINI_API_KEY=a_tua_chave_gemini_aqui
```

Podes obter uma chave gratuita em [Google AI Studio](https://aistudio.google.com).

---

## 📁 Estrutura do Projeto

```
Domus/
├── src/
│   ├── components/
│   │   ├── DashboardView.tsx
│   │   ├── TasksRotationsView.tsx
│   │   ├── WalletView.tsx
│   │   ├── ReportsView.tsx
│   │   ├── SettingsView.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Modals.tsx
│   ├── App.tsx
│   ├── data.ts
│   ├── types.ts
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📜 Licença

Este projeto é de uso pessoal e educacional.

---
