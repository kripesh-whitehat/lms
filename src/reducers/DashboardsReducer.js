import {
  DELETE_DASHBOARD,
  EDIT_DASHBOARD_TITLE,
  SET_CURRENTLY_SELECTED_DASHBOARD,
  SET_DASHBOARDS_ITEMS,
  SET_EDITING_DASHBOARD_TITLE,
  SET_TITLE_INPUT,
  SET_DATA_FETCHING,
} from 'actions/types'

const INITIAL_STATE = {
  items: [
    { id: 'add', title: 'Create A Dashboard' },
    // { id:'a', title: 'Manager' },
    // { id:'b', title: 'Accountant' }
  ],
  titleInput: '',
  selectedDashboard: null,
  editingTitle: false,
  isDataFetching: false,
}

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_DASHBOARDS_ITEMS:
      return {
        ...state,
        items: [state.items[0], ...action.items],
        titleInput: '',
      }
    case SET_TITLE_INPUT:
      return { ...state, titleInput: action.titleInput }
    case SET_CURRENTLY_SELECTED_DASHBOARD:
      return { ...state, selectedDashboard: action.index }
    case SET_EDITING_DASHBOARD_TITLE:
      return { ...state, editingTitle: action.editingTitle }
    case EDIT_DASHBOARD_TITLE:
      const newItem = { ...state.items[action.idx], title: action.title }
      return {
        ...state,
        items: [
          ...state.items.slice(0, action.idx),
          newItem,
          ...state.items.slice(action.idx + 1),
        ],
      }
    case DELETE_DASHBOARD:
      const index = state.selectedDashboard
      const newItems = [
        ...state.items.slice(0, index),
        ...state.items.slice(index + 1),
      ]
      return { ...state, items: newItems }
    case SET_DATA_FETCHING:
      return { ...state, isDataFetching: action.isDataFetching }
    default:
      return state
  }
}
