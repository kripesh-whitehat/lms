import {
  FETCH_LOCATIONS,
  SET_LOCATIONS,
  AUTHORIZE,
  SET_COMPANY_DATA,
  GLOBAL_OVERWRITE,
  FETCH_DATES,
} from './types'

export const fetchLocations = () => ({ type: FETCH_LOCATIONS })
export const fetchDates = (units, year) => ({ type: FETCH_DATES, units, year })
export const setLocations = (locations) => ({ type: SET_LOCATIONS, locations })
export const setCompanyData = (companyData) => ({
  type: SET_COMPANY_DATA,
  companyData,
})
export const authorize = () => ({ type: AUTHORIZE })
export const restoreState = (newState) => ({ type: GLOBAL_OVERWRITE, newState })
