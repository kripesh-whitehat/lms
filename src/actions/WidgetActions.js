import {
  CREATE_WIDGET,
  UPDATE_WIDGETS,
  DESTROY_WIDGET,
  SET_DRILLDOWN_INDEX,
  PUSH_HISTORY,
  SLICE_HISTORY,
  SET_CHART_TYPE,
  SET_WIDGET_STATE,
} from './types'

export const createWidget = (name) => ({ type: CREATE_WIDGET, name })
export const destroyWidget = (id) => ({ type: DESTROY_WIDGET, id })
export const setWidgetState = (id, newState) => ({
  type: SET_WIDGET_STATE,
  id,
  newState,
})
export const updateWidgets = (widgets) => ({
  type: UPDATE_WIDGETS,
  widgets: { widgets },
})
export const setDrilldownIndex = (widgetId, index) => ({
  type: SET_DRILLDOWN_INDEX,
  widgetId,
  index,
})
export const pushHistory = (widgetId, chartType, breadcrumb) => ({
  type: PUSH_HISTORY,
  widgetId,
  chartType,
  breadcrumb,
})
export const sliceHistory = (widgetId, idx) => ({
  type: SLICE_HISTORY,
  widgetId,
  idx,
})
export const setChartType = (widgetId, chartType) => ({
  type: SET_CHART_TYPE,
  widgetId,
  chartType,
})
