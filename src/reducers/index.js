import { combineReducers } from 'redux'
import { GLOBAL_OVERWRITE } from 'actions/types'
import APSpendReducer from './APSpendReducer'
import BudgetVsActualReducer from './BudgetVsActualReducer'
import CogsReducer from './CogsReducer'
import CompanyReducer from './CompanyReducer'
import DashboardReducer from './DashboardReducer'
import DashboardsReducer from './DashboardsReducer'
import FourRReducer from './FourRReducer'
import ReportsReducer from './ReportsReducer'
import WidgetSettingsReducer from './WidgetSettingsReducer'
import WidgetsReducer from './WidgetsReducer'

const allReducers = combineReducers({
  dashboard: DashboardReducer,
  dashboards: DashboardsReducer,
  reports: ReportsReducer,
  widgets: WidgetsReducer,
  company: CompanyReducer,
  cogs: CogsReducer,
  ap_spend: APSpendReducer,
  budgetVsActual: BudgetVsActualReducer,
  four_r: FourRReducer,
  widget_settings: WidgetSettingsReducer,
})

const rootReducer = (state, action) => {
  if (action.type === GLOBAL_OVERWRITE) {
    state = action.newState
  }

  return allReducers(state, action)
}

export default rootReducer
