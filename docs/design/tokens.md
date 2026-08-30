# Design Tokens & Sistema de Estilos

## 1. Tokens de Cores

| Token CSS | Valor HSL / Hex | Aplicação Principal |
| :--- | :--- | :--- |
| `--bg-app` | `#0f172a` (`slate-900`) | Fundo principal da aplicação |
| `--bg-card` | `rgba(30, 41, 59, 0.7)` | Fundo de cartões com glassmorphism |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Bordas divisórias de cartões e tabelas |
| `--text-primary` | `#f8fafc` (`slate-50`) | Títulos, valores de destaque e texto principal |
| `--text-secondary`| `#94a3b8` (`slate-400`) | Subtítulos, labels, datas e metadados |
| `--accent-emerald`| `#10b981` (`emerald-500`) | Status `COMPLETED`, badges positivos |
| `--accent-amber`  | `#f59e0b` (`amber-500`)   | Status `LOCKED`, alertas e pendências |
| `--accent-rose`   | `#f43f5e` (`rose-500`)    | Status `BLOCKED`, alertas críticos |
| `--accent-indigo` | `#6366f1` (`indigo-500`)  | Botões primários e seleções ativas |

---

## 2. Espaçamentos e Raios de Borda
- **Border Radius:**
  - `rounded-xl` (`12px`): Botões, inputs e badges.
  - `rounded-2xl` (`16px`): Cartões de visualização e painéis de turno.
  - `rounded-3xl` (`24px`): Modais e painéis flutuantes.
- **Glassmorphism:** `backdrop-blur-md bg-slate-800/60 border border-white/10 shadow-xl`.
