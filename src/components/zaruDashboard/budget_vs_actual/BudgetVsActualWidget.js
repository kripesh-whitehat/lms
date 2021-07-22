import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Select from 'react-select'
import {
  fetchReport,
  pushHistory,
  setChartType,
  setCompanyData,
  setDrilldownIndex,
  setReportAttribute,
  setWidgetState,
  sliceHistory,
} from 'actions'
import 'styles/FruitConsumptionWidget.css'
import { selectedDivisions, selectedUnits } from 'utils'
import moment from 'moment'
import AggregateItemsSpendTable from '../ap_spend/AggregateItemsSpendTable'
import ItemTrendChart from '../ap_spend/ItemTrendChart'
import VendorByGLLocationChart from '../ap_spend/VendorByGLLocationChart'
import InvoiceTable from '../vendor_spend/InvoiceTable'
import Widget from '../Widget'
import BudgetHeader from './BudgetHeader'
import CompanyChart from './CompanyChart'
import DivisionsChart from './DivisionsChart'
import UnitsChart from './UnitsChart'

class CostWidget extends Component {
  constructor(props) {
    super(props)
    this.renderChart = this.renderChart.bind(this)
    this.wrapChart = this.wrapChart.bind(this)
    this.getChart = this.getChart.bind(this)
    this.drilldown = this.drilldown.bind(this)
    this.params = this.params.bind(this)
    this.handleGlClick = this.handleGlClick.bind(this)
    this.handleDivisionClick = this.handleDivisionClick.bind(this)
    this.handleUnitsClick = this.handleUnitsClick.bind(this)
    this.handleVendorClick = this.handleVendorClick.bind(this)
    this.onCompressClick = this.onCompressClick.bind(this)
    this.handleAggregateItemsSpendTableClick =
      this.handleAggregateItemsSpendTableClick.bind(this)
    this.handleItemTrendClick = this.handleItemTrendClick.bind(this)
  }

  UNSAFE_componentWillMount() {
    const { id, fullscreen } = this.props
    if (_.isEmpty(this.widget().selectedGls))
      this.props.setWidgetState(id, { selectedGls: [] })
    // set breadcrumb in redux state
    if (!fullscreen) {
      this.props.pushHistory(id, 'budget_vs_actual_company', `Company`)
      // set which chart is shown in redux state
      this.props.setChartType(id, 'budget_vs_actual_company')
      // call the api for the first chart
      this.props.fetchReport(
        this.props.id,
        'budget_vs_actual_company',
        this.budgetVsActualParams(),
      )
    }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const {
      id,
      reports,
      dashboard: { fullscreenOpen },
      byInvoiceDate,
    } = nextProps
    const byInvoiceDateChanged = this.props.byInvoiceDate !== byInvoiceDate
    const lastActiveWidgetId = this.props.dashboard.activeWidget
      ? this.props.dashboard.activeWidget.id
      : null
    const fullscreenDidClose =
      !fullscreenOpen &&
      this.props.dashboard.fullscreenOpen &&
      this.props.dashboard.updatedInFullscreen &&
      this.props.id !== lastActiveWidgetId
    const { chartType } = this.widget(nextProps)
    const { drillUp } = this.widget(nextProps)
    const dateChanged =
      this.props.startDate !== nextProps.startDate ||
      this.props.endDate !== nextProps.endDate
    const locationsChanged = !_.isEqual(
      this.props.company.locations,
      nextProps.company.locations,
    )
    const chartTypeChanged =
      !_.isEqual(this.widget().chartType, this.widget(nextProps).chartType) &&
      drillUp
    // call the api with new dates or locations if changed
    if (nextProps.fullscreen) return
    if (locationsChanged) {
      this.goToInitialChart()
      if (this.widget(nextProps).chartType === 'budget_vs_actual_company') {
        this.props.fetchReport(
          id,
          'budget_vs_actual_company',
          this.budgetVsActualParams(nextProps),
        )
      }
    }
    if (
      dateChanged ||
      chartTypeChanged ||
      fullscreenDidClose ||
      byInvoiceDateChanged
    ) {
      this.props.fetchReport(
        this.props.id,
        this.widget(nextProps).chartType,
        this.params(nextProps),
      )
      this.props.setWidgetState(id, { drillUp: false })
    }

    if (chartType === 'aggregate_item_spend') {
      if (
        reports[id].aggregate_item_spend &&
        reports[id].aggregate_item_spend.length === 0
      ) {
        this.props.setChartType(id, 'ap_vendor_by_gl_location')
        this.props.fetchReport(
          this.props.id,
          'ap_vendor_by_gl_location',
          this.aggItemsParams(),
        )
      }
    }

    if (chartType === 'budget_vs_actual_company') {
      const report = reports[id][chartType] || {}
      const budget = report.Budget ? report.Budget : 0
      if (budget !== this.widget(nextProps).initialBudget) {
        this.props.setWidgetState(id, { budget, initialBudget: budget })
      }
    }
  }

  params(props = this.props) {
    switch (this.widget(props).chartType) {
      case 'budget_vs_actual_company':
        return this.budgetVsActualParams(props)
      case 'budget_vs_actual_divisions':
        return this.byDivisonsParams(props)
      case 'budget_vs_actual_units':
        return this.byUnitsParams(props)
      case 'aggregate_item_spend':
        return this.aggItemsParams(props)
      case 'ap_vendor_by_gl_location':
        return this.aggItemsParams(props)
      case 'invoices_by_vendor_gl':
        return this.invoicesByVendorGlParams(props)
      case 'item_trend_report':
        return this.itemTrendParams(props)
      default:
        return ''
    }
  }

  onCompressClick() {
    this.goToInitialChart()
    this.props.onCompressClick()
  }

  widget(props = this.props) {
    const { id, widgets } = props
    return widgets.find((w) => w.id === id)
  }

  getDateParams(props = this.props) {
    // format date parameters from redux state
    const { startDate, endDate } = props.reports
    return `&startDate=${moment(startDate).format(
      'MM/DD/YYYY',
    )}&endDate=${moment(endDate).format('MM/DD/YYYY')}`
  }

  wrapChart(chart) {
    // wrap chart in container for high charts functionality and styling
    return <div className="fruit-main-chart">{chart}</div>
  }

  renderChart() {
    // put chart in container if its not a table
    const { chartType } = this.widget()
    const chartTypeSplit = chartType.split('_')
    const isTable = chartTypeSplit[chartTypeSplit.length - 1] === 'table'
    const chart = this.getChart(chartType)
    if (isTable) return chart
    return this.wrapChart(chart)
  }

  getChart(chartType) {
    // return chart based on chart type in redux state
    const { reports, id } = this.props
    const container = `chart-${id}`

    switch (chartType) {
      case 'budget_vs_actual_company':
        return (
          <div>
            <CompanyChart
              onDataClick={this.handleGlClick}
              totalBudgetAmount={this.widget().budget}
              data={reports[id].budget_vs_actual_company}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.5}
              selectedGls={this.widget().selectedGls.map((gl) => gl.value)}
              fullscreenHeightRatio={0.95}
              {...this.props}
            />
          </div>
        )
      case 'budget_vs_actual_divisions':
        return (
          <div>
            <DivisionsChart
              onDataClick={(event) =>
                this.handleDivisionClick(
                  event.point.Id,
                  event.point.Description,
                )
              }
              totalBudgetAmount={this.widget().budget}
              data={reports[id].budget_vs_actual_divisions}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.55}
              selectedGls={this.widget().selectedGls.map((gl) => gl.value)}
              fullscreenHeightRatio={0.95}
              {...this.props}
            />
          </div>
        )
      case 'budget_vs_actual_units':
        return (
          <div>
            <UnitsChart
              onDataClick={this.handleUnitsClick}
              totalBudgetAmount={this.widget().budget}
              data={reports[id].budget_vs_actual_units}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.55}
              selectedGls={this.widget().selectedGls.map((gl) => gl.value)}
              fullscreenHeightRatio={0.95}
              {...this.props}
            />
          </div>
        )
      case 'aggregate_item_spend':
        return (
          <div className="agg-item-spend">
            <AggregateItemsSpendTable
              onDataClick={this.handleAggregateItemsSpendTableClick}
              showPagination={!!this.props.fullscreen}
              type={chartType}
              {...this.props}
            />
          </div>
        )
      case 'item_trend_report':
        return (
          <ItemTrendChart
            type={chartType}
            item_name={this.widget().item_name}
            container={container}
            widthRatio={0.9}
            heightRatio={0.4}
            fullscreenHeightRatio={0.75}
            onDataClick={this.handleItemTrendClick}
            {...this.props}
          />
        )
      case 'ap_vendor_by_gl_location':
        const agg_report = reports[id].aggregate_item_spend
        const invoiceTableToggleVisible = agg_report
          ? agg_report.length > 0
          : true
        const display = invoiceTableToggleVisible ? 'inherit' : 'none'
        return (
          <div style={{ height: '60%' }}>
            <button
              className="btn btn-small btn-primary"
              onClick={() => null}
              style={{ marginBottom: '1em', display }}
            >
              Show Item Spend
            </button>
            <VendorByGLLocationChart
              type={chartType}
              container={container}
              onDataClick={this.handleVendorClick}
              widthRatio={0.85}
              heightRatio={0.55}
              {...this.props}
            />
          </div>
        )
      case 'invoices_by_vendor_gl':
        return (
          <InvoiceTable
            container={container}
            type={chartType}
            showPagination={!!this.props.fullscreen}
            {...this.props}
          />
        )
      default:
        return <div>Whoops!</div>
    }
  }

  drilldown(chartType, breadcrumb) {
    // set chart type and breadcrumbs in redux
    // called in every chart click with drilldown functionality
    const { id } = this.props
    this.props.onExpandClick(id)
    this.props.setChartType(id, chartType)
    this.props.pushHistory(id, chartType, breadcrumb)
  }

  // below are functions for handling drilldown events and
  // defining parameters to be sent in api calls
  budgetVsActualParams(props = this.props) {
    return `?units=${selectedUnits(props.company.locations).map(
      (unit) => unit.unit_id,
    )}${this.getDateParams(props)}`
  }

  byDivisonsParams(props = this.props, glCode = this.widget().glCode) {
    return `${this.budgetVsActualParams(props)}&glCode=${glCode}`
  }

  byUnitsParams(
    props = this.props,
    divisionName = this.widget().divisionName,
    divisionId = this.widget().divisionId,
    glCode = this.widget().glCode,
  ) {
    const unitIds = selectedUnits(props.company.locations)
      .filter((unit) => unit.region === divisionName)
      .map((unit) => unit.unit_id)
    return `?units=${unitIds}&divisionId=${divisionId}&glCode=${glCode}${this.getDateParams(
      props,
    )}`
  }

  aggItemsParams(props = this.props, unitId = this.widget().unitId) {
    const { glCode } = this.widget()
    const { startDate, endDate } = props.reports
    const dateParams = `&start_date=${moment(startDate).format(
      'MM/DD/YYYY',
    )}&end_date=${moment(endDate).format('MM/DD/YYYY')}`
    return `?unit_id=${unitId}&gl_code=${glCode}${dateParams}`
  }

  itemTrendParams(
    props = this.props,
    inventory_item_id = this.widget().inventory_item_id,
    vendor_id = this.widget().vendor_id,
  ) {
    const { startDate, endDate } = props.reports
    const dateParams = `&start_date=${moment(startDate).format(
      'MM/DD/YYYY',
    )}&end_date=${moment(endDate).format('MM/DD/YYYY')}`
    return `?id=${inventory_item_id}&vendor_id=${vendor_id}${dateParams}`
  }

  invoicesByVendorGlParams(props, vendorId = this.widget().vendorId) {
    const {
      reports: { startDate, endDate },
    } = this.props
    const { glCode, unitId } = this.widget()
    const dateParams = `&start_date=${moment(startDate).format(
      'MM/DD/YYYY',
    )}&end_date=${moment(endDate).format('MM/DD/YYYY')}`
    return `?unit_ids=${unitId}&vendor_id=${vendorId}&gl_code=${glCode}${dateParams}`
  }

  handleGlClick(event) {
    const {
      id,
      company: { locations },
    } = this.props
    const { Id, Description } = event.point
    const units = selectedUnits(locations)
    const division = selectedDivisions(locations)[0]
    if (units.length === 1) {
      this.props.setWidgetState(id, { glCode: Id, glName: Description })
      this.props.onExpandClick(id)
      return this.handleDivisionClick(
        division.division_id,
        division.name,
        Id,
        Description,
      )
    }
    this.props.fetchReport(
      this.props.id,
      'budget_vs_actual_divisions',
      this.byDivisonsParams(this.props, Id),
    )
    setTimeout(() => {
      this.props.setWidgetState(id, { glCode: Id, glName: Description })
      this.props.onExpandClick(id)
      this.props.pushHistory(id, 'budget_vs_actual_divisions', Description)
      this.props.setChartType(id, 'budget_vs_actual_divisions')
    }, 100)
  }

  handleItemTrendClick(e) {
    const { id } = this.props
    const { imageLink } =
      this.props.reports[id].item_trend_report.items[e.point.index]
    if (_.isEmpty(imageLink)) {
      return
    }
    window.open(imageLink, '_blank')
  }

  handleDivisionClick(
    divisionId,
    divisionName,
    glCode = this.widget().glCode,
    description = '',
  ) {
    const { id } = this.props
    this.props.fetchReport(
      this.props.id,
      'budget_vs_actual_units',
      this.byUnitsParams(this.props, divisionName, divisionId, glCode),
    )
    setTimeout(() => {
      this.props.setWidgetState(id, { divisionId, divisionName })
      if (!_.isEmpty(description)) {
        divisionName = `${divisionName} (${description})`
      }

      this.props.pushHistory(id, 'budget_vs_actual_units', divisionName)
      this.props.setChartType(id, 'budget_vs_actual_units')
    }, 100)
  }

  handleUnitsClick(event) {
    const { id } = this.props
    const { Id, Description } = event.point
    this.props.fetchReport(
      this.props.id,
      'aggregate_item_spend',
      this.aggItemsParams(this.props, Id),
    )
    setTimeout(() => {
      this.props.setWidgetState(id, { unitId: Id, unitName: Description })
      this.props.pushHistory(id, 'aggregate_item_spend', Description)
      this.props.setChartType(id, 'aggregate_item_spend')
    }, 100)
  }

  handleAggregateItemsSpendTableClick(rowInfo) {
    const { inventory_item_id, item_name } = rowInfo.original
    const { reports, id } = this.props
    const { vendor_id } = reports[id].aggregate_item_spend[rowInfo.index]

    this.props.fetchReport(
      this.props.id,
      'item_trend_report',
      this.itemTrendParams(this.props, inventory_item_id, vendor_id),
    )
    setTimeout(() => {
      this.drilldown('item_trend_report', item_name)
      this.props.setWidgetState(id, {
        item_name,
        inventory_item_id,
        vendor_id,
      })
    }, 100)
  }

  handleVendorClick(event) {
    const { id, reports } = this.props
    const vendor_name = event.point.x
    const { vendor_id } = reports[id].ap_vendor_by_gl_location.find(
      (vendor) => vendor.name === vendor_name,
    )
    this.props.fetchReport(
      id,
      'invoices_by_vendor_gl',
      this.invoicesByVendorGlParams(this.props, vendor_id),
    )
    setTimeout(() => {
      this.props.setWidgetState(id, { vendor_id })
      this.drilldown('invoices_by_vendor_gl', vendor_name)
    }, 100)
  }

  goToInitialChart() {
    const { id } = this.props
    this.props.sliceHistory(id, -1)
    this.props.pushHistory(id, 'budget_vs_actual_company', `Company`)
    this.props.setChartType(id, 'budget_vs_actual_company')
  }

  render() {
    const { id, fullscreen } = this.props
    const { chartType } = this.widget()
    const { startDate, endDate, budget } = this.widget()
    const dates =
      startDate && endDate
        ? {
            startDate: moment(startDate).format('MM/DD/YYYY'),
            endDate: moment(endDate).format('MM/DD/YYYY'),
          }
        : { startDate: '', endDate: '' }

    if (!chartType) return <div></div>
    const initialReport = this.props.reports[id].budget_vs_actual_company || {}
    const selectDisplay =
      chartType === 'budget_vs_actual_company' && fullscreen ? '' : 'none'
    const displayHeader = chartType.includes('budget_vs_actual')
    const details = _.isEmpty(initialReport) ? [] : initialReport.Details
    const options = details.map((d) => ({
      value: d.Description,
      label: d.Description,
    }))
    return (
      <Widget
        title="Budget vs. Actual"
        type={chartType}
        shouldFetch={false}
        history={this.props.history}
        dates={dates}
        showDatesCanvas={startDate && endDate}
        {...this.props}
        onCompressClick={this.onCompressClick}
      >
        <div
          style={{
            marginLeft: '.5em',
            marginRight: '.5em',
            display: selectDisplay,
          }}
        >
          <Select
            options={options}
            isMulti
            placeholder="Select GLs"
            value={this.widget().selectedGls}
            onChange={(values) =>
              this.props.setWidgetState(id, { selectedGls: values || [] })
            }
          />
        </div>
        <BudgetHeader
          selected_gls={this.widget().selectedGls}
          data={initialReport}
          widgetId={id}
          budget={budget}
          fullscreen={fullscreen}
          visible={displayHeader}
          initialBudget={initialReport.Budget}
        />
        {this.renderChart()}
      </Widget>
    )
  }
}

const mapStateToProps = (state) => ({
  widgets: state.widgets.widgets,
  reports: state.reports,
  startDate: state.reports.startDate,
  endDate: state.reports.endDate,
  company: state.company,
  dashboard: state.dashboard,
  byInvoiceDate: state.widget_settings.budget_vs_actual.byInvoiceDate,
})

export default connect(mapStateToProps, {
  setDrilldownIndex,
  setReportAttribute,
  fetchReport,
  pushHistory,
  sliceHistory,
  setChartType,
  setCompanyData,
  setWidgetState,
})(CostWidget)
