import {
  SET_DASHBOARD_LAYOUT,
  ADD_WIDGET_TO_DASHBOARD,
  FETCH_DASHBOARD,
  UPDATE_DASHBOARD,
  DESTROY_DASHBOARD,
  SET_DASHBOARD_STATE,
} from './types'

export const setDashboardLayout = (layout) => ({
  type: SET_DASHBOARD_LAYOUT,
  layout,
})
export const addWidgetToDashboard = (widget) => ({
  type: ADD_WIDGET_TO_DASHBOARD,
  widget,
})
export const fetchDashboard = (id) => ({ type: FETCH_DASHBOARD, id })
export const updateDashboard = (dashboard) => ({
  type: UPDATE_DASHBOARD,
  dashboard,
})
export const destroyDashboard = (id) => ({ type: DESTROY_DASHBOARD, id })
export const setDashboardState = (newState) => ({
  type: SET_DASHBOARD_STATE,
  newState,
})
