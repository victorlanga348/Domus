# Módulo: Carteira Doméstica & Despesas Compartilhadas

## 1. Visão Geral
O módulo financeiro do DOMUS gerencia o fluxo de caixa doméstico, compras de mercado, contas de consumo (água, luz, internet) e manutenções prediais.

---

## 2. Regras de Cálculo & Divisão
1. **Lançamento de Despesa:**
   - Registra o pagador (`payerId`), valor total (`amount`), categoria e data.
   - Define a lista de membros participantes da divisão (`splitBetween`).
2. **Divisão Padrão (Paritária):**
   - $\text{Valor por membro} = \frac{\text{amount}}{N}$ onde $N = \text{total de membros participantes}$.
3. **Cálculo de Saldos Líquidos (Balanço):**
   - Para cada membro $U$:
     $$\text{Saldo}(U) = \sum \text{Total Pago por } U - \sum \text{Parcela Devida por } U$$
   - Saldo positivo indica crédito (a receber); saldo negativo indica débito (a pagar).
4. **Liquidação / Acerto de Contas (Settlement):**
   - Permite registrar transferências diretas entre membros para zerar saldos devedores.
