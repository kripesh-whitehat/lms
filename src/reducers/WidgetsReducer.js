import {
  ADD_WIDGET,
  PUSH_HISTORY,
  SET_CHART_TYPE,
  SET_DASHBOARD_LAYOUT,
  SET_DRILLDOWN_INDEX,
  SET_WIDGETS,
  SET_WIDGET_STATE,
  SLICE_HISTORY,
} from 'actions/types'

const INITIAL_STATE = {
  didFetch: false,
  widgets: [
    // { id: 1, x: 0, y: 0, w: 21, h: 14 }
  ],
}

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_WIDGETS: {
      return { ...state, widgets: action.widgets, didFetch: true }
    }
    case SET_DASHBOARD_LAYOUT: {
      return { ...state, widgets: action.layout }
    }
    case ADD_WIDGET: {
      return { ...state, widgets: [action.widget, ...state.widgets] }
    }
    case SET_WIDGET_STATE: {
      const widgetIndex = state.widgets.findIndex(
        (widget) => widget.id === action.id,
      )
      return {
        ...state,
        widgets: [
          ...state.widgets.slice(0, widgetIndex),
          { ...state.widgets[widgetIndex], ...action.newState },
          ...state.widgets.slice(widgetIndex + 1),
        ],
      }
    }
    case SET_DRILLDOWN_INDEX: {
      const widgetIndex = state.widgets.findIndex(
        (widget) => widget.id === action.widgetId,
      )
      return {
        ...state,
        widgets: [
          ...state.widgets.slice(0, widgetIndex),
          { ...state.widgets[widgetIndex], drilldownIndex: action.index },
          ...state.widgets.slice(widgetIndex + 1),
        ],
      }
    }
    case SET_CHART_TYPE: {
      const widgetIndex = state.widgets.findIndex(
        (widget) => widget.id === action.widgetId,
      )
      return {
        ...state,
        widgets: [
          ...state.widgets.slice(0, widgetIndex),
          { ...state.widgets[widgetIndex], chartType: action.chartType },
          ...state.widgets.slice(widgetIndex + 1),
        ],
      }
    }
    case PUSH_HISTORY: {
      const { widgets } = state
      const widgetIdx = widgets.findIndex(
        (widget) => widget.id === action.widgetId,
      )
      return {
        ...state,
        widgets: [
          ...widgets.slice(0, widgetIdx),
          {
            ...widgets[widgetIdx],
            history: [
              ...(widgets[widgetIdx].history || []),
              { breadcrumb: action.breadcrumb, chartType: action.chartType },
            ],
          },
          ...widgets.slice(widgetIdx + 1),
        ],
      }
    }
    case SLICE_HISTORY: {
      const idx = state.widgets.findIndex(
        (widget) => widget.id === action.widgetId,
      )
      return {
        ...state,
        widgets: [
          ...state.widgets.slice(0, idx),
          {
            ...state.widgets[idx],
            history: [...state.widgets[idx].history.slice(0, action.idx + 1)],
            drillUp: true,
          },
          ...state.widgets.slice(idx + 1),
        ],
      }
    }
    default:
      return state
  }
}
