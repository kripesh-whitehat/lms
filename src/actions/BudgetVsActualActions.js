import { SET_TOTAL_BUDGET_AMOUNT } from './types'

export const setTotalBudgetAmount = (budgetedAmount) => ({
  type: SET_TOTAL_BUDGET_AMOUNT,
  budgetedAmount,
})
