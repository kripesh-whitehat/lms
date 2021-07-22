import axios from 'axios'
// import _ from "lodash";
// import moment from "moment";
import { put, select, takeLatest } from 'redux-saga/effects'
import {
  AUTHORIZE,
  FETCH_DATES,
  FETCH_LOCATIONS,
  SET_COMPANY_DATA,
  SET_GLOBAL_REPORT_ATTRIBUTE,
  SET_LOCATIONS_BY_REGION,
  SET_DATA_FETCHING,
} from 'actions/types'
import { sortDivisions } from 'utils'
import isEmpty from 'helpers/isEmpty'

function* getConfig() {
  const state = yield select()
  return {
    headers: {
      Authorization: `Token token=${state.company.token}`,
      'Content-Type': 'application/json',
    },
  }
}

export function* auth(action) {
  const params = new URLSearchParams(window.location.search)
  const payload = {
    secret_key: process.env.REACT_APP_SECRET_KEY,
    user_id: params.get('user_id'),
    unit_id: params.get('unit_id'),
    // user_id: 20483,
    // unit_id: 2,
  }
  const config = {
    headers: {
      Authorization: `Token token=${process.env.REACT_APP_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  }
  yield setDataFetching(true)
  try {
    const response = yield axios.post(
      `${process.env.REACT_APP_API_URL}/rsi_token`,
      payload,
      config,
    )
    console.log(response)
    const { token_id, group_id, start_date, end_date, group_name, user_id } =
      response.data
    const startDate = localStorage.getItem('startDateZaru') || start_date
    const endDate = localStorage.getItem('endDateZaru') || end_date
    const selectedYear = new Date(endDate).getFullYear()
    const companyData = {
      token: token_id,
      user_id,
      group_id,
      group_name,
      selectedYear,
    }
    yield put({ type: SET_COMPANY_DATA, companyData })
    yield put({
      type: SET_GLOBAL_REPORT_ATTRIBUTE,
      attribute: { startDate: new Date(startDate) },
    })
    yield put({
      type: SET_GLOBAL_REPORT_ATTRIBUTE,
      attribute: { endDate: new Date(endDate) },
    })
    yield put({
      type: SET_GLOBAL_REPORT_ATTRIBUTE,
      attribute: { selectedYear },
    })
    yield put({ type: FETCH_LOCATIONS })
  } catch (error) {
    const responseMessage = error.response
      ? error.response.data.UserMessage
      : null
    const message =
      responseMessage || 'An Error occured authenticating the User and Unit.'
    yield put({ type: SET_COMPANY_DATA, companyData: { error: message } })
  } finally {
    yield setDataFetching(false)
  }
}

export function* fetchLocations(action) {
  yield setDataFetching(true)
  const config = yield getConfig()
  const params = new URLSearchParams(window.location.search)
  const userId = params.get('user_id')
  const { user_id } = yield select((state) => state.company)
  const url = `${process.env.REACT_APP_API_URL}/divisions?user_id=${
    userId ?? user_id
  }`
  try {
    const response = yield axios.get(url, config)

    const responseData = response.data || []
    yield put({
      type: SET_LOCATIONS_BY_REGION,
      responseData: sortDivisions(responseData),
    })
  } catch (error) {
    console.error(error)
  } finally {
    yield setDataFetching(false)
  }
}

export function* fetchDates(action) {
  yield setDataFetching(true)
  if (isEmpty(action.units)) return
  const config = yield getConfig()
  const url = `${process.env.REACT_APP_API_URL}/get_unit_financial_calendar_ranges?year=${action.year}&units=${action.units}`
  try {
    const response = yield axios.get(url, config)

    const responseData = response.data || {}
    yield put({
      type: SET_COMPANY_DATA,
      companyData: { calendarRanges: responseData },
    })
  } catch (error) {
    console.error(error)
  } finally {
    yield setDataFetching(false)
  }
}

export function* watchCompany() {
  yield takeLatest(FETCH_LOCATIONS, fetchLocations)
  yield takeLatest(AUTHORIZE, auth)
  yield takeLatest(FETCH_DATES, fetchDates)
}

export function* setDataFetching(fetching) {
  const { isDataFetching } = yield select((state) => state.dashboards)
  if (isDataFetching !== fetching)
    yield put({
      type: SET_DATA_FETCHING,
      isDataFetching: fetching,
    })
}
