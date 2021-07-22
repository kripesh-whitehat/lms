import { SET_DEFAULT_TREND_BY } from 'actions/types'

const INITIAL_STATE = {
  trend_by: 'invoice_date',
}

export default (state = INITIAL_STATE, action = null) => {
  switch (action.type) {
    case SET_DEFAULT_TREND_BY: {
      return { ...state, trend_by: action.trendBy }
    }
    default: {
      return { ...state }
    }
  }
}
