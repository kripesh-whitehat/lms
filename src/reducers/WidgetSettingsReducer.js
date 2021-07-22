import { SET_BY_INVOICE_DATE } from 'actions/types'

const INITIAL_STATE = {
  cost: {
    byInvoiceDate: false,
  },
  ap_spend: {
    byInvoiceDate: false,
  },
  vendor_spend: {
    byInvoiceDate: false,
  },
  four_r: {
    byInvoiceDate: false,
  },
  budget_vs_actual: {
    byInvoiceDate: false,
  },
}

export default (state = INITIAL_STATE, action = null) => {
  switch (action.type) {
    case SET_BY_INVOICE_DATE: {
      return {
        ...state,
        [action.widgetName]: {
          byInvoiceDate: action.byInvoiceDate,
        },
      }
    }
    default: {
      return { ...state }
    }
  }
}
