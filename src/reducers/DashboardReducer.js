import {
  ADD_WIDGET_TO_DASHBOARD,
  SET_DASHBOARD_LAYOUT,
  SET_DASHBOARD_STATE,
} from 'actions/types'

const INITIAL_STATE = {
  layout: [
    // { id: 1, x: 0, y: 0, w: 21, h: 14 }
  ],
  sidebarOpen: false,
  fullscreenOpen: false,
}

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_DASHBOARD_LAYOUT:
      return { ...state, layout: action.layout }
    case ADD_WIDGET_TO_DASHBOARD:
      return { ...state, layout: [action.widget, ...state.layout] }
    case SET_DASHBOARD_STATE:
      return { ...state, ...action.newState }
    default:
      return state
  }
}
