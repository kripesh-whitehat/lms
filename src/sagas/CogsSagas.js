import axios from 'axios'
// import _ from 'lodash'
import { put, select, takeLatest } from 'redux-saga/effects'
import {
  FETCH_INVOICES_BY_ITEM,
  FETCH_INVOICES_BY_ITEM_SUCCESS,
  FETCH_INVOICES_GL,
  FETCH_INVOICES_GL_SUCCESS,
  FETCH_ITEM_GL,
  FETCH_ITEM_GL_SUCCESS,
  FETCH_ITEM_INV_LOC,
  FETCH_ITEM_INV_LOC_SUCCESS,
  FETCH_TREND_UNIT_GROUP_BY_GL,
  FETCH_TREND_UNIT_GROUP_BY_GL_SUCCESS,
} from 'actions/types'
import isEmpty from 'helpers/isEmpty'
import { getStandardDateFormat } from 'helpers/dateFormat'

function* getConfig() {
  const state = yield select()
  return {
    headers: {
      Authorization: `Token token=${state.company.token}`,
      'Content-Type': 'application/json',
    },
  }
}

// /cost_trend_unit_group_by_gl?unit_id=482&category=FOOD COST&start_date=11/04/2019&end_date=03/01/2020
export function* fetchTrendUnitGroupByGL({ params }) {
  const config = yield getConfig()
  try {
    const { unitId, category, startDate, endDate, byInvoiceDate } = params
    const formattedCategory = encodeURIComponent(category)
    const url = `${process.env.REACT_APP_API_URL}/cost_trend_unit_group_by_gl?unit_id=${unitId}&category=${formattedCategory}&start_date=${startDate}&end_date=${endDate}&byInvoiceDate=${byInvoiceDate}`
    const response = yield axios.get(url, config)
    yield put({
      type: FETCH_TREND_UNIT_GROUP_BY_GL_SUCCESS,
      payload: response.data,
    })
  } catch (e) {
    console.log(e)
  }
}

export function* fetchItemTrendLevel({
  glCode,
  updateDataOnly,
  byInvoiceDate,
}) {
  const config = yield getConfig()
  const state = yield select()
  const { reports, dashboard } = state
  try {
    const startDate = getStandardDateFormat(reports.startDate)
    const endDate = getStandardDateFormat(reports.endDate)
    const unitId = dashboard.activeWidget.unit_id

    const url = `${process.env.REACT_APP_API_URL}/cost_trend_gl_group_by_item?unit_id=${unitId}&gl_code=${glCode}&start_date=${startDate}&end_date=${endDate}&byInvoiceDate=${byInvoiceDate}`
    const response = yield axios.get(url, config)
    yield put({
      type: FETCH_ITEM_GL_SUCCESS,
      payload: response.data,
      updateDataOnly,
    })
  } catch (e) {
    console.log(e)
  }
}

function* fetchItemInvLoc({
  startDate,
  unit_inventory_item_id,
  byInvoiceDate,
}) {
  const config = yield getConfig()
  const state = yield select()
  const { dashboard } = state

  try {
    const unitId = dashboard.activeWidget.unit_id
    const url = `${process.env.REACT_APP_API_URL}/item_inventory_level_by_location?unit_id=${unitId}&start_date=${startDate}&unit_inventory_item_id=${unit_inventory_item_id}&byInvoiceDate=${byInvoiceDate}`
    const response = yield axios.get(url, config)
    yield put({ type: FETCH_ITEM_INV_LOC_SUCCESS, payload: response.data })
  } catch (e) {
    console.log(e)
  }
}

function* fetchInvoicesGL({ glCode, byInvoiceDate }) {
  const config = yield getConfig()
  const state = yield select()
  const { reports, dashboard } = state

  try {
    const startDate = getStandardDateFormat(reports.startDate)
    const endDate = getStandardDateFormat(reports.endDate)
    const unitId = dashboard.activeWidget.unit_id

    const url = `${process.env.REACT_APP_API_URL}/cost_of_goods_gl_invoices?gl_code=${glCode}&unit_id=${unitId}&start_date=${startDate}&end_date=${endDate}&byInvoiceDate=${byInvoiceDate}`
    const response = yield axios.get(url, config)
    yield put({ type: FETCH_INVOICES_GL_SUCCESS, payload: response.data })
  } catch (e) {
    console.log(e)
  }
}

function* fetchInvoicesByItem({ params }) {
  const config = yield getConfig()
  const state = yield select()
  const { reports, dashboard } = state

  try {
    let startDate = getStandardDateFormat(reports.startDate)
    let endDate = getStandardDateFormat(reports.endDate)
    const unitId = dashboard.activeWidget.unit_id
    const { itemId, byInvoiceDate } = params
    if (!isEmpty(params.startDate) && !isEmpty(params.endDate)) {
      startDate = params.startDate
      endDate = params.endDate
    }
    const url = `${process.env.REACT_APP_API_URL}/cost_of_goods_item_invoices?unit_id=${unitId}&start_date=${startDate}&end_date=${endDate}&item_id=${itemId}&byInvoiceDate=${byInvoiceDate}`
    const response = yield axios.get(url, config)
    yield put({ type: FETCH_INVOICES_BY_ITEM_SUCCESS, payload: response.data })
  } catch (e) {
    console.log(e)
  }
}

export function* watchCogs() {
  yield takeLatest(FETCH_TREND_UNIT_GROUP_BY_GL, fetchTrendUnitGroupByGL)
  yield takeLatest(FETCH_ITEM_GL, fetchItemTrendLevel)
  yield takeLatest(FETCH_ITEM_INV_LOC, fetchItemInvLoc)
  yield takeLatest(FETCH_INVOICES_GL, fetchInvoicesGL)
  yield takeLatest(FETCH_INVOICES_BY_ITEM, fetchInvoicesByItem)
}
