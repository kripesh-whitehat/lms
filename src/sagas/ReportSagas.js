import axios from 'axios'
// import _ from "lodash";
import { put, select, takeEvery } from 'redux-saga/effects'
import {
  ADD_REPORT,
  FETCH_REPORT,
  SET_DASHBOARD_STATE,
  SET_REPORT_ATTRIBUTE,
  SET_REPORT_ERROR,
  SET_REPORT_JOB_ID,
} from 'actions/types'
import { varsFromParams } from 'utils'
import isEmpty from 'helpers/isEmpty'
import { setDataFetching } from './CompanySagas'

function* getConfig() {
  const state = yield select()
  return {
    headers: {
      Authorization: `Token token=${state.company.token}`,
      'Content-Type': 'application/json',
    },
  }
}

const shouldFetchReport = (action, state) => {
  const { reportType, urlParams, widgetId } = action
  const {
    dashboard: { fullscreenOpen, activeWidget },
  } = state
  if (!reportType || !urlParams) return false
  const activeWidgetId = isEmpty(activeWidget) ? null : activeWidget.id
  const widgetIsFullscreen = fullscreenOpen
    ? activeWidgetId === widgetId
    : false
  return widgetIsFullscreen || !fullscreenOpen
}

export function* fetchReport(action) {
  yield setDataFetching(true)
  const { reportType, widgetId, showLoadbar } = action
  let { urlParams } = action
  const state = yield select()

  const { widgets } = state.widgets
  // const widgetName = _.find(widgets,{id: widgetId}).name
  const widgetName = widgets.find((x) => x.id === widgetId).name
  const { widget_settings } = state

  if (
    widget_settings[widgetName] &&
    widget_settings[widgetName].byInvoiceDate
  ) {
    if (urlParams.match(/\?/)) {
      urlParams = `${urlParams}&byInvoiceDate=true`
    }
  }

  if (!shouldFetchReport(action, state)) {
    // Save that the widgets should update on fullscreen close
    yield put({
      type: SET_DASHBOARD_STATE,
      newState: { updatedInFullscreen: true },
    })
    // Remove loading indicator
    yield put({
      type: SET_REPORT_ATTRIBUTE,
      widgetId,
      attribute: { fetchingData: false },
    })
    return
  }
  const { unit_ids, unit_id, unitId, units } = varsFromParams(urlParams)

  const config = yield getConfig()
  const url = `${process.env.REACT_APP_API_URL}/${reportType}${urlParams}`
  const jobId = Math.random()
  const shouldHaveUnitId = reportType !== 'item_trend_report'

  if (
    isEmpty(unit_ids) &&
    isEmpty(unit_id) &&
    isEmpty(unitId) &&
    isEmpty(units) &&
    shouldHaveUnitId
  ) {
    yield put({
      type: SET_REPORT_JOB_ID,
      widgetId,
      reportType,
      jobIdByReport: { [reportType]: null },
    })
    yield put({
      type: ADD_REPORT,
      responseData: [],
      widgetId,
      reportType,
      showLoadbar,
    })
    yield put({
      type: SET_REPORT_ERROR,
      widgetId,
      reportType,
      errorByReport: { [reportType]: 'No locations selected' },
    })
    return
  }

  try {
    yield put({
      type: SET_REPORT_JOB_ID,
      widgetId,
      reportType,
      jobIdByReport: { [reportType]: jobId },
    })
    const response = yield axios.get(url, config)
    const responseData = response.data
    const state = yield select()
    if (jobId === state.reports[widgetId].jobIds[reportType]) {
      yield put({
        type: ADD_REPORT,
        responseData,
        widgetId,
        reportType,
        showLoadbar,
      })
      yield put({
        type: SET_REPORT_ERROR,
        widgetId,
        reportType,
        errorByReport: { [reportType]: null },
      })
    }
  } catch (error) {
    const state = yield select()
    if (jobId === state.reports[widgetId].jobIds[reportType]) {
      const message =
        error.message || 'There was an error handling your request.'
      yield put({
        type: ADD_REPORT,
        responseData: [],
        widgetId,
        reportType,
        showLoadbar,
      })
      yield put({
        type: SET_REPORT_ERROR,
        widgetId,
        reportType,
        errorByReport: { [reportType]: message },
      })
    }
  } finally {
    yield setDataFetching(false)
  }
}

export function* watchReports() {
  yield takeEvery(FETCH_REPORT, fetchReport)
}
