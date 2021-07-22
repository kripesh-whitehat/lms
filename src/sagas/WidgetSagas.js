import axios from 'axios'
import { put, select, takeLatest } from 'redux-saga/effects'
import {
  ADD_WIDGET,
  ADD_WIDGET_TO_DASHBOARD,
  CREATE_WIDGET,
  DESTROY_WIDGET,
  SET_WIDGETS,
  UPDATE_WIDGETS,
} from 'actions/types'

function* getConfig() {
  const state = yield select()
  return {
    headers: {
      Authorization: `Token token=${state.company.token}`,
      'Content-Type': 'application/json',
    },
  }
}

const getCooridinates = (widgets) => indexToCoordinates(widgets.length)

const indexToCoordinates = (index) => {
  switch (index) {
    case 0:
      return { x: 0, y: 0 }
    case 1:
      return { x: 15, y: 0 }
    case 2:
      return { x: 0, y: 9 }
    case 3:
      return { x: 15, y: 9 }
    case 4:
      return { x: 0, y: 18 }
    default:
      return { x: 0, y: 0 }
  }
}

const redrawLayout = (widgets) => {
  const sortedWidgets = widgets.sort((a, b) => a.x + a.y * 2 - (b.x + b.y * 2))
  sortedWidgets.forEach((widget, index) => {
    const { x, y } = indexToCoordinates(index)
    widget.x = x
    widget.y = y
  })

  return sortedWidgets
}

export function* createWidget(action) {
  const config = yield getConfig()
  const state = yield select()
  const dashboard_id = state.dashboards.items.slice(-1)[0].id
  const { x, y } = getCooridinates(state.widgets.widgets)
  const url = `${process.env.REACT_APP_API_URL}/widgets`
  const payload = {
    user_id: state.company.user_id,
    dashboard_id,
    x,
    y,
    w: 15,
    h: 9,
    name: action.name,
  }

  try {
    const response = yield axios.post(url, payload, config)
    const { x, y, w, h, id } = response.data
    const widget = { x, y, w, h, i: String(id) }

    yield put({
      type: ADD_WIDGET,
      widget: { ...response.data, id: String(id) },
    })
    yield put({ type: ADD_WIDGET_TO_DASHBOARD, widget })
  } catch (error) {
    console.warn(error)
  }
}

export function* updateWidgets(action) {
  const url = `${process.env.REACT_APP_API_URL}/widgets/update_multiple`
  const config = yield getConfig()
  try {
    yield axios.put(url, action.widgets, config)
  } catch (error) {
    console.warn(error)
  }
}

export function* destroyWidget(action) {
  const url = `${process.env.REACT_APP_API_URL}/widgets/${action.id}`
  const state = yield select()
  const config = yield getConfig()
  const widgets = state.widgets.widgets
    .slice()
    .filter((widget) => widget.id !== action.id)
  try {
    yield axios.delete(url, config)
    yield put({
      type: UPDATE_WIDGETS,
      widgets: { widgets: redrawLayout(widgets) },
    })
    yield put({ type: SET_WIDGETS, widgets: redrawLayout(widgets) })
  } catch (error) {
    console.warn(error)
  }
}

export function* watchWidgets() {
  yield takeLatest(CREATE_WIDGET, createWidget)
  yield takeLatest(UPDATE_WIDGETS, updateWidgets)
  yield takeLatest(DESTROY_WIDGET, destroyWidget)
}
