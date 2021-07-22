import axios from 'axios'
// import _ from "lodash";
import { put, select, takeLatest } from 'redux-saga/effects'
import {
  CREATE_DASHBOARD,
  DELETE_DASHBOARD,
  EDIT_DASHBOARD_TITLE,
  FETCH_DASHBOARD,
  FETCH_DASHBOARDS,
  SET_DASHBOARDS_ITEMS,
  SET_WIDGETS,
} from 'actions/types'
import isEmpty from 'helpers/isEmpty'
import { setDataFetching } from './CompanySagas'

// const config = {
//   headers: { 'Content-Type': 'application/json' }
// }

function* getConfig() {
  const state = yield select()
  return {
    headers: {
      Authorization: `Token token=${state.company.token}`,
      'Content-Type': 'application/json',
    },
  }
}

const userId = () => new URLSearchParams(window.location.search).get('user_id')

export function* fetchDashboards(action) {
  yield setDataFetching(true)
  const config = yield getConfig()
  const { user_id } = yield select((state) => state.company)
  const url = `${process.env.REACT_APP_API_URL}/dashboards?user_id=${
    userId() ?? user_id
  }`
  try {
    const response = yield axios.get(url, config)
    const dashboards = response.data.map((dashboard) => ({
      ...dashboard,
      id: String(dashboard.id),
      title: dashboard.name,
    }))

    yield put({ type: SET_DASHBOARDS_ITEMS, items: dashboards })
    yield put({ type: FETCH_DASHBOARD, id: action.id })
  } catch (e) {
    console.warn(e)
  } finally {
    yield setDataFetching(false)
  }
}

export function* createDashboard(action) {
  const config = yield getConfig()
  const url = `${process.env.REACT_APP_API_URL}/dashboards`
  const payload = {
    user_id: userId(),
    name: action.title,
  }

  try {
    const response = yield axios.post(url, payload, config)
    const { id, name } = response.data
    const state = yield select()
    const newItems = [
      ...state.dashboards.items.slice(1),
      { id: String(id), title: name },
    ]

    yield put({ type: SET_DASHBOARDS_ITEMS, items: newItems })
  } catch (error) {
    console.warn(error)
  }
}

export function* fetchDashboard(action) {
  yield setDataFetching(true)
  const config = yield getConfig()
  const state = yield select()
  const lastId = state.dashboards.items.slice(-1)[0].id
  const dashboardId = isEmpty(action.id) ? lastId : action.id
  const url = `${process.env.REACT_APP_API_URL}/dashboards/${dashboardId}`
  const response = yield axios.get(url, config)
  const widgets = response.data.widgets.map((widget) => ({
    ...widget,
    id: String(widget.id),
  }))
  yield put({ type: SET_WIDGETS, widgets })
  // yield put({ type: SET_DASHBOARD_LAYOUT,  layout })
  // yield setDataFetching(false);
}

export function* deleteDashboard(action) {
  const url = `${process.env.REACT_APP_API_URL}/dashboards/${action.id}`
  const config = yield getConfig()
  try {
    yield axios.delete(url, config)
  } catch (error) {
    console.warn(error)
  }
}

export function* updateDashboard(action) {
  const state = yield select()
  const config = yield getConfig()
  const { items } = state.dashboards
  const { id } = items[action.idx]
  const url = `${process.env.REACT_APP_API_URL}/dashboards/${id}`
  const payload = { name: action.title }

  try {
    yield axios.put(url, payload, config)
  } catch (error) {
    console.warn(error)
  }
}

export function* watchDashboard() {
  yield takeLatest(FETCH_DASHBOARD, fetchDashboard)
  yield takeLatest(FETCH_DASHBOARDS, fetchDashboards)
  yield takeLatest(CREATE_DASHBOARD, createDashboard)
  yield takeLatest(DELETE_DASHBOARD, deleteDashboard)
  yield takeLatest(EDIT_DASHBOARD_TITLE, updateDashboard)
}
