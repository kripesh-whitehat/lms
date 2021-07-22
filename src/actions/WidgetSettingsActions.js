import { SET_BY_INVOICE_DATE } from './types'
export const setByInvoiceDate = (widgetName, byInvoiceDate) => ({
  type: SET_BY_INVOICE_DATE,
  widgetName,
  byInvoiceDate,
})
