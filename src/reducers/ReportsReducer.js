// import moment from 'moment'
import {
  ADD_REPORT,
  FETCH_REPORT,
  SET_GLOBAL_REPORT_ATTRIBUTE,
  SET_REPORT_ATTRIBUTE,
  SET_REPORT_ERROR,
  SET_REPORT_JOB_ID,
} from 'actions/types'

const date = new Date()
const INITIAL_STATE = {
  // startDate: moment().startOf('month'),
  // endDate: moment(),
  startDate: new Date(date.getFullYear(), date.getMonth(), 1),
  endDate: date,
  startRange: 'none',
  endRange: 'none',
}

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_REPORT: {
      const fetching = state[action.widgetId]
        ? state[action.widgetId].fetchingData
        : false
      return {
        ...state,
        [action.widgetId]: {
          ...state[action.widgetId],
          fetchingData: action.showLoadbar ? true : fetching || false,
        },
      }
    }
    case ADD_REPORT: {
      return {
        ...state,
        [action.widgetId]: {
          ...state[action.widgetId],
          [action.reportType]: action.responseData,
          fetchingData: action.showLoadbar
            ? false
            : state[action.widgetId].fetchingData,
        },
      }
    }
    case SET_REPORT_ATTRIBUTE: {
      return {
        ...state,
        [action.widgetId]: { ...state[action.widgetId], ...action.attribute },
      }
    }
    case SET_REPORT_JOB_ID: {
      return {
        ...state,
        [action.widgetId]: {
          ...state[action.widgetId],
          jobIds: { ...state[action.widgetId].jobIds, ...action.jobIdByReport },
        },
      }
    }
    case SET_REPORT_ERROR: {
      return {
        ...state,
        [action.widgetId]: {
          ...state[action.widgetId],
          errors: { ...state[action.widgetId].errors, ...action.errorByReport },
        },
      }
    }
    case SET_GLOBAL_REPORT_ATTRIBUTE: {
      const attributeName = Object.keys(action.attribute)[0]
      if (attributeName === 'startDate' || attributeName === 'endDate') {
        localStorage.setItem(
          `${attributeName}Zaru`,
          action.attribute[attributeName],
        )
      }
      return { ...state, ...action.attribute }
    }
    default:
      return state
  }
}
