import {
  FETCH_TREND_UNIT_GROUP_BY_GL,
  SET_GL_FILTERS,
  UPDATE_GL_FILTERS,
  FETCH_ITEM_GL,
  SWITCH_TO_SINGLE_GL,
  SWITCH_CHART_TYPE,
  FETCH_ITEM_INV_LOC,
  FETCH_INVOICES_GL,
  SET_ITEMS_TID,
  UPDATE_ITEM_TID,
  SELECT_ALL_GL_FILTERS,
  SELECT_ALL_ITEMS,
  FETCH_INVOICES_BY_ITEM,
  SET_ITEMS_USAGE_DISPLAY,
} from './types'

export const fetchTrendUnitGroupByGl = (params) => ({
  type: FETCH_TREND_UNIT_GROUP_BY_GL,
  params,
})
export const setGlFilters = (glFilters) => ({ type: SET_GL_FILTERS, glFilters })
export const updateGLFilters = (glFilter, isChecked) => ({
  type: UPDATE_GL_FILTERS,
  glFilter,
  isChecked,
})
export const selectAllGLFilters = (isChecked) => ({
  type: SELECT_ALL_GL_FILTERS,
  isChecked,
})
export const fetchItemGL = (
  glName,
  glCode,
  updateDataOnly = false,
  byInvoiceDate = false,
) => ({ type: FETCH_ITEM_GL, glName, glCode, updateDataOnly, byInvoiceDate })
export const itemSelectAll = (isChecked) => ({
  type: SELECT_ALL_ITEMS,
  isChecked,
})
export const switchToSingleGL = (glName) => ({
  type: SWITCH_TO_SINGLE_GL,
  glName,
})
export const switchChartType = (chartType) => ({
  type: SWITCH_CHART_TYPE,
  chartType,
})
export const fetchInventoryItemLoc = (
  startDate,
  unitInventoryItemId,
  byInvoiceDate = false,
) => ({
  type: FETCH_ITEM_INV_LOC,
  startDate,
  unitInventoryItemId,
  byInvoiceDate,
})
export const fetchInvoicesGL = (glCode, byInvoiceDate = false) => ({
  type: FETCH_INVOICES_GL,
  glCode,
  byInvoiceDate,
})
export const setItems = (itemsTid) => ({ type: SET_ITEMS_TID, itemsTid })
export const updateItemCheckbox = (itemTid, isChecked) => ({
  type: UPDATE_ITEM_TID,
  itemTid,
  isChecked,
})
export const fetchInvoicesByItem = (params) => ({
  type: FETCH_INVOICES_BY_ITEM,
  params,
})
export const setItemsUsageDisplay = (displayType) => ({
  type: SET_ITEMS_USAGE_DISPLAY,
  displayType,
})
