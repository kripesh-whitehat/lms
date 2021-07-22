import {
  SET_COMPANY_DATA,
  SET_LOCATIONS,
  SET_LOCATIONS_BY_REGION,
} from 'actions/types'

const INITIAL_STATE = {
  locations_by_region: [],
  locations: [],
  region: '',
  token: '',
  group_id: '',
  user_id: '',
  error: null,
  calendarRanges: {},
  currentRange: 'WeeklyRanges',
}

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_LOCATIONS_BY_REGION:
      return { ...state, locations_by_region: action.responseData }
    case SET_LOCATIONS:
      return { ...state, locations: action.locations }
    case SET_COMPANY_DATA:
      return { ...state, ...action.companyData }
    default:
      return state
  }
}
