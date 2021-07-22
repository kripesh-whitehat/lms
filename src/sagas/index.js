import { all } from 'redux-saga/effects'
import * as CogsSagas from './CogsSagas'
import * as CompanySagas from './CompanySagas'
import * as DashboardSagas from './DashboardSagas'
import * as ReportSagas from './ReportSagas'
import * as WidgetSagas from './WidgetSagas'

export default function* rootSaga() {
  yield all([
    DashboardSagas.watchDashboard(),
    WidgetSagas.watchWidgets(),
    ReportSagas.watchReports(),
    CompanySagas.watchCompany(),
    CogsSagas.watchCogs(),
  ])
}
