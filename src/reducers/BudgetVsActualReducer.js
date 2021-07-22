import { SET_TOTAL_BUDGET_AMOUNT } from 'actions/types'

const INITIAL_STATE = {
  budgetedAmount: 0,
}

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_TOTAL_BUDGET_AMOUNT: {
      return { ...state, budgetedAmount: action.budgetedAmount }
    }
    default: {
      return { ...state }
    }
  }
}
