import {
  SET_DASHBOARDS_ITEMS,
  SET_TITLE_INPUT,
  DELETE_DASHBOARD,
  SET_CURRENTLY_SELECTED_DASHBOARD,
  SET_EDITING_DASHBOARD_TITLE,
  EDIT_DASHBOARD_TITLE,
  FETCH_DASHBOARDS,
  CREATE_DASHBOARD,
} from './types'

export const setDashboardsItems = (items) => ({
  type: SET_DASHBOARDS_ITEMS,
  items,
})
export const setTitleInput = (titleInput) => ({
  type: SET_TITLE_INPUT,
  titleInput,
})
export const deleteDashboard = (id) => ({ type: DELETE_DASHBOARD, id })
export const setSelectedDashboard = (index) => ({
  type: SET_CURRENTLY_SELECTED_DASHBOARD,
  index,
})
export const setEditingDashboardTitle = (editingTitle) => ({
  type: SET_EDITING_DASHBOARD_TITLE,
  editingTitle,
})
export const editDashboardTitle = (title, idx) => ({
  type: EDIT_DASHBOARD_TITLE,
  title,
  idx,
})
export const fetchDashboards = (id) => ({ type: FETCH_DASHBOARDS, id })
export const createDashboard = (title) => ({ type: CREATE_DASHBOARD, title })
