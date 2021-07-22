import {
  FETCH_REPORT,
  SET_REPORT_ATTRIBUTE,
  SET_GLOBAL_REPORT_ATTRIBUTE,
  ADD_REPORT,
} from './types'

export const fetchReport = (
  widgetId,
  reportType,
  urlParams,
  showLoadbar = true,
) => ({ type: FETCH_REPORT, widgetId, reportType, urlParams, showLoadbar })

export const setGlobalReportAttribute = (attribute) => ({
  type: SET_GLOBAL_REPORT_ATTRIBUTE,
  attribute,
})
export const setReportAttribute = (widgetId, attribute) => ({
  type: SET_REPORT_ATTRIBUTE,
  widgetId,
  attribute,
})
export const addReport = (widgetId, reportType, responseData) => ({
  type: ADD_REPORT,
  responseData,
  widgetId,
  reportType,
})
