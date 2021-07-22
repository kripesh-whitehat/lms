// this widget renders a chart (or table) based on the chart type provided by the redux store
// we set the intitial chart type in the componentWillMount react life cycle method
// on a drilldown event (example: user clicks on data point) we call the api and
// set the next chart type in redux
// when the data for the next chart comes back from the api the component automatically
// renders the next chart with the new data based on the chart type we set
// we provide these functions to the given chart component through the onDataClick prop
// when we change a date in the date picker or select/deselect locations
// we call the api with the current chart type and the new locations or date
// each chart type has its own function to handle a drilldown event (if applicable)
// and a function to provide the parameters for the appropriate api call

// charts:
// ap_divisions_spend
// ap_location_spend
// gl_subcategory_spend
// aggregate_item_spend
// ap_vendor_by_gl_location
// item_trend_report

import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  addReport,
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
import { allDivisions } from 'utils'
import AggregateItemsSpendTable from './AggregateItemsSpendTable'
import APSpendDrilldownGlSubcategorySpendChart from './APSpendDrilldownGlSubcategorySpendChart'
import APSpendDrilldownMultiLocationSpendChart from './APSpendDrilldownMultiLocationSpendChart'
import APVendorByGLLocationChart from './APVendorByGLLocationChart'
import ItemTrendChart from './ItemTrendChart'
import RegionSpendChart from './RegionSpendChart'
import VendorSpendChart from './VendorSpendChart'
import InvoiceTable from './vendor_spend/InvoiceTable'
import Widget from './Widget'

const contextRoutes = {
  ap_divisions_spend: 'ap_divisions_spend',
  ap_location_spend: 'ap_location_spend',
  gl_subcategory_spend: 'gl_subcategory_spend',
  aggregate_item_spend: 'aggregate_item_spend',
  item_trend_report: 'item_trend_report',
  item_stats_table: 'item_trend_report',
  vendor_spend_chart: 'vendor_spend_report',
}

class DrilldownWidget extends Component {
  constructor(props) {
    super(props)
    this.renderChart = this.renderChart.bind(this)
    this.wrapChart = this.wrapChart.bind(this)
    this.getChart = this.getChart.bind(this)
    this.drilldown = this.drilldown.bind(this)
    this.handleRegionSpendChartClick =
      this.handleRegionSpendChartClick.bind(this)
    this.handleMultiLocationClick = this.handleMultiLocationClick.bind(this)
    this.handleWeeklySpendClick = this.handleWeeklySpendClick.bind(this)
    this.handleGLSpendClick = this.handleGLSpendClick.bind(this)
    this.handleAggregateItemsSpendTableClick =
      this.handleAggregateItemsSpendTableClick.bind(this)
    this.handleItemTrendClick = this.handleItemTrendClick.bind(this)
    this.getDateParams = this.getDateParams.bind(this)
    this.toggleChart = this.toggleChart.bind(this)
    this.handleVendorSpendClick = this.handleVendorSpendClick.bind(this)
    this.fetchApDivisionsSpend = this.fetchApDivisionsSpend.bind(this)
    this.goToRegionSpendChart = this.goToRegionSpendChart.bind(this)
    this.goToInvoicesByVendorGL = this.goToInvoicesByVendorGL.bind(this)
    this.invoicesByVendorGlParams = this.invoicesByVendorGlParams.bind(this)
    this.onCompressClick = this.onCompressClick.bind(this)
    this.goToInitialChart = this.goToInitialChart.bind(this)
  }

  UNSAFE_componentWillMount() {
    const { id, company } = this.props
    // set breadcrumb in redux state
    if (!this.props.fullscreen) {
      this.fetchInitialChart()
    }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    // call the api with new dates or locations if changed
    const {
      id,
      company,
      reports,
      dashboard: { fullscreenOpen },
    } = nextProps
    const lastActiveWidgetId = this.props.dashboard.activeWidget
      ? this.props.dashboard.activeWidget.id
      : null
    const fullscreenDidClose =
      !fullscreenOpen &&
      this.props.dashboard.fullscreenOpen &&
      this.props.dashboard.updatedInFullscreen &&
      this.props.id !== lastActiveWidgetId
    const { drillUp } = this.widget(nextProps)
    const fetchingData = reports[id] ? reports[id].fetchingData : false
    const dateChanged =
      this.props.startDate !== nextProps.startDate ||
      this.props.endDate !== nextProps.endDate
    const locationsChanged = !_.isEqual(
      this.props.company.locations,
      nextProps.company.locations,
    )
    const chartTypeChanged =
      !_.isEqual(
        this.widget(this.props).chartType,
        this.widget(nextProps).chartType,
      ) && drillUp
    const { chartType } = this.widget(nextProps)
    if (nextProps.fullscreen) return

    if (locationsChanged) {
      this.goToInitialChart(nextProps)
      const { intitialChartType } = this.widget(nextProps)
      if (this.widget(nextProps).chartType === intitialChartType) {
        this.props.fetchReport(
          this.props.id,
          intitialChartType,
          this.params(nextProps, intitialChartType),
        )
      }
    }

    if (dateChanged || chartTypeChanged || fullscreenDidClose) {
      this.props.fetchReport(
        this.props.id,
        this.widget(nextProps).chartType,
        this.params(nextProps),
      )

      this.props.setWidgetState(id, { drillUp: false })
    }

    // Auto Nav for after gl click
    if (
      chartType !== 'aggregate_item_spend' &&
      chartType !== 'ap_vendor_by_gl_location' &&
      reports[id] &&
      reports[id].aggregate_item_spend
    ) {
      this.props.addReport(id, 'aggregate_item_spend', null)
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
    if (_.isEmpty(chartType)) {
      this.fetchInitialChart(nextProps)
    }
  }

  fetchInitialChart(props = this.props) {
    const { company, chartType, id } = props
    if (!_.isEmpty(company.locations)) {
      const divisions = allDivisions(company.locations)
      if (divisions.length === 1) {
        this.props.setWidgetState(id, {
          chartType: 'ap_location_spend',
          intitialChartType: 'ap_location_spend',
        })
        this.goToRegionSpendChart(divisions[0])
      } else {
        this.props.pushHistory(id, 'ap_divisions_spend', 'Divisions')
        // set which chart is shown in redux state
        this.props.setWidgetState(id, {
          intitialChartType: 'ap_divisions_spend',
        })
        this.props.setChartType(id, 'ap_divisions_spend')
        // call the api for the first chart
        this.fetchApDivisionsSpend(props)
      }
    }
  }

  fetchApDivisionsSpend(props = this.props) {
    const { group_id, user_id } = this.props.company
    this.props.fetchReport(
      this.props.id,
      'ap_divisions_spend',
      this.regionSpendChartParams(props),
    )
  }

  urlParams(userId, chartType) {
    const { group_id } = this.props.company
    const chartTypeToParams = {
      ap_divisions_spend: `?unit_id=${userId}&group_id=${group_id}`,
      ap_location_spend: `?unit_id=${userId}&group_id=${group_id}`,
      gl_subcategory_spend: `?unit_id=${userId}&group_id=${group_id}`,
      aggregate_item_spend: `?unit_id=${userId}&group_id=${group_id}`,
      item_trend_report: `?unit_id=${userId}&group_id=${group_id}`,
      item_stats_table: `?unit_id=${userId}&group_id=${group_id}`,
      vendor_spend_chart: `?unit_id=${userId}&group_id=${group_id}`,
    }

    return chartTypeToParams[chartType]
  }

  unit_ids(props = this.props, division = this.widget().division) {
    // return array of relevant selected user ids
    const { locations } = props.company
    if (_.isEmpty(division)) {
      return locations
        .filter((l) => l.type === 'location' && l.checked)
        .map((l) => l.unit_id)
    }
    return locations
      .filter(
        (l) => l.type === 'location' && l.checked && l.region === division.name,
      )
      .map((l) => l.unit_id)
  }

  widget(props = this.props) {
    const { id, widgets } = props
    return widgets.find((w) => w.id === id)
  }

  getDateParams(props = this.props) {
    // format date parameters from redux state
    if (_.isEmpty(props.reports)) return ''
    const { startDate, endDate } = props.reports
    return `&start_date=${moment(startDate).format(
      'MM/DD/YYYY',
    )}&end_date=${moment(endDate).format('MM/DD/YYYY')}`
  }

  wrapChart(chart) {
    // wrap chart in container for high charts functionality and styling
    if (this.widget().chartType === 'aggregate_item_spend') return chart
    return (
      <div
        className="fruit-main-chart"
        style={{ height: this.props.widgetHeight * 0.65 || 0 }}
      >
        {chart}
      </div>
    )
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

  params(props = this.props, chartType = null) {
    const chart = chartType || this.widget(props).chartType
    switch (chart) {
      case 'ap_divisions_spend':
        return this.regionSpendChartParams(props)
      case 'ap_location_spend':
        return this.locationSpendParams(props)
      case 'gl_subcategory_spend':
        return this.glSpendParams(props)
      case 'aggregate_item_spend':
        return this.aggItemsParams(props)
      case 'item_trend_report':
        return this.itemTrendParams(props)
      case 'ap_vendor_by_gl_location':
        return this.aggItemsParams(props)
      case 'invoices_by_vendor_gl':
        return this.invoicesByVendorGlParams(props)
    }
  }

  getChart(chartType) {
    // return chart based on chart type in redux state
    const container = `chart-${this.props.id}`
    const { reports, id } = this.props
    const { division } = this.widget()
    const agg_report = reports[id].aggregate_item_spend
    switch (chartType) {
      case 'ap_divisions_spend':
        return (
          <RegionSpendChart
            onDataClick={(event) =>
              this.handleRegionSpendChartClick(event.point.category)
            }
            container={container}
            type={chartType}
            widthRatio={0.85}
            heightRatio={0.45}
            fullscreenHeightRatio={0.75}
            {...this.props}
          />
        )
      case 'ap_location_spend':
        return (
          <APSpendDrilldownMultiLocationSpendChart
            onDataClick={this.handleMultiLocationClick}
            container={container}
            divisionName={division ? division.name : ''}
            type={chartType}
            widthRatio={0.85}
            heightRatio={0.5}
            fullscreenHeightRatio={0.75}
            {...this.props}
          />
        )
      case 'gl_subcategory_spend':
        return (
          <div>
            <APSpendDrilldownGlSubcategorySpendChart
              onDataClick={this.handleGLSpendClick}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.65}
              {...this.props}
            />
          </div>
        )
      case 'vendor_spend_chart':
        return (
          <div>
            <button
              className="btn btn-small btn-primary"
              onClick={() => this.toggleChart('gl_subcategory_spend')}
            >
              Show GL Subcategory Report
            </button>
            <VendorSpendChart
              onDataClick={this.handleVendorSpendClick}
              container={container}
              type="vendor_spend_report"
              widthRatio={0.85}
              heightRatio={0.65}
              {...this.props}
            />
          </div>
        )
      case 'aggregate_item_spend':
        return (
          <div className="agg-item-spend" style={{ height: '95%' }}>
            <button
              className="btn btn-small btn-primary"
              onClick={() => this.toggleChart('ap_vendor_by_gl_location')}
              style={{ margin: '1em' }}
            >
              Show Vendor Spend
            </button>
            <AggregateItemsSpendTable
              onDataClick={this.handleAggregateItemsSpendTableClick}
              showPagination={!!this.props.fullscreen}
              type={chartType}
              {...this.props}
            />
          </div>
        )
      case 'ap_vendor_by_gl_location':
        const invoiceTableToggleVisible = agg_report
          ? agg_report.length > 0
          : true
        const display = invoiceTableToggleVisible ? 'inherit' : 'none'
        return (
          <div style={{ height: '60%' }}>
            <button
              className="btn btn-small btn-primary"
              onClick={() => this.toggleChart('aggregate_item_spend')}
              style={{ marginBottom: '1em', display }}
            >
              Show Item Spend
            </button>
            <APVendorByGLLocationChart
              type={chartType}
              container={container}
              onDataClick={this.goToInvoicesByVendorGL}
              widthRatio={0.85}
              heightRatio={0.55}
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
      case 'invoices_by_vendor_gl':
        return (
          <InvoiceTable
            container={container}
            type={chartType}
            widthRatio={0.85}
            heightRatio={0.75}
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

  toggleChart(chartType) {
    const { id, widget } = this.props
    const { unit_id } = this.props.reports[id]
    const { gl_code, gl_name } = this.widget()
    this.props.setChartType(id, chartType)
    this.props.sliceHistory(id, this.widget().history.length - 2)
    this.props.pushHistory(id, chartType, gl_name)
    this.props.fetchReport(
      id,
      chartType,
      `?unit_id=${unit_id}&gl_code=${gl_code}${this.getDateParams()}`,
    )
  }

  goToInvoicesByVendorGL(event) {
    const { id, reports } = this.props
    const vendor_name = event.point.x
    const { vendor_id } = reports[id].ap_vendor_by_gl_location.find(
      (vendor) => vendor.name === vendor_name,
    )
    this.props.setWidgetState(id, { vendor_id })
    this.drilldown('invoices_by_vendor_gl', vendor_name)
    this.props.fetchReport(
      id,
      'invoices_by_vendor_gl',
      this.invoicesByVendorGlParams(this.props, vendor_id),
    )
  }

  invoicesByVendorGlParams(props, vendor_id = this.widget().vendor_id) {
    const { id, reports } = this.props
    const { unit_id } = this.props.reports[id]
    const { gl_code } = this.widget()
    return `?unit_ids=${unit_id}&vendor_id=${vendor_id}&gl_code=${gl_code}${this.getDateParams(
      props,
    )}`
  }

  regionSpendChartParams(props = this.props, division_id) {
    const { group_id, user_id } = this.props.company
    return `?group_id=${group_id}&user_id=${user_id}&unit_ids=${this.unit_ids(
      props,
      null,
    )}${this.getDateParams(props)}`
  }

  handleRegionSpendChartClick(division_name) {
    const { id, reports } = this.props
    const { group_id, user_id } = this.props.company
    const { ap_divisions_spend } = reports[id]
    const idx = ap_divisions_spend.findIndex((r) => r.name === division_name)
    const division = ap_divisions_spend[idx]
    this.props.setWidgetState(id, { division })

    this.drilldown('ap_location_spend', division_name)
    this.props.setCompanyData({ region: division_name })
    this.props.fetchReport(
      this.props.id,
      'ap_location_spend',
      this.locationSpendParams(this.props, division),
    )
  }

  goToRegionSpendChart(division) {
    // handle auto navigate to units chart
    const { id, reports } = this.props
    const { group_id, user_id } = this.props.company
    const division_name = division.name

    // this.props.setWidgetState(id, { division })
    this.props.setChartType(id, 'ap_location_spend')
    this.props.pushHistory(id, 'ap_location_spend', division_name)
    this.props.setWidgetState(id, { division })
    this.props.fetchReport(
      this.props.id,
      'ap_location_spend',
      this.locationSpendParams(this.props, division),
    )
  }

  locationSpendParams(props = this.props, division = this.widget().division) {
    const { group_id, user_id, locations } = props.company
    // handle auto navigate to units chart
    if (!division) {
      division = allDivisions(locations)[0]
      this.props.setWidgetState(props.id, { division })
    }
    return `?division_id=${
      division.division_id
    }&user_id=${user_id}&group_id=${group_id}&unit_ids=${this.unit_ids(
      props,
      division,
    )}${this.getDateParams(props)}`
  }

  handleMultiLocationClick(event) {
    this.drilldown('gl_subcategory_spend', event.point.category)
    const unit_name = event.point.category
    const { unit_id } = this.props.reports[
      this.props.id
    ].ap_location_spend.find((l) => l.unit_name === unit_name)
    this.props.fetchReport(
      this.props.id,
      'gl_subcategory_spend',
      `?unit_id=${unit_id}${this.getDateParams()}`,
    )
    this.props.setReportAttribute(this.props.id, { unit_id })
    this.props.setWidgetState(this.props.id, { unit_id })
  }

  glSpendParams(props = this.props) {
    const { unit_id } = this.widget()
    return `?unit_id=${unit_id}${this.getDateParams(props)}`
  }

  handleWeeklySpendClick(event) {
    const { category } = event.point
    this.drilldown('gl_subcategory_spend', category)
    const { unit_id } = this.props.reports[this.props.id]
    this.props.fetchReport(
      this.props.id,
      'gl_subcategory_spend',
      `?unit_id=${unit_id}${this.getDateParams()}`,
    )
  }

  handleGLSpendClick(event) {
    this.drilldown('aggregate_item_spend', event.point.name)
    const { reports, id } = this.props
    const { unit_id } = reports[id]
    const { name } = event.point
    const gl = reports[id].gl_subcategory_spend.gl_spend.find(
      (gl) => gl.gl_name === name,
    )
    this.props.setWidgetState(id, { gl_code: gl.gl_code, gl_name: gl.gl_name })
    this.props.fetchReport(
      this.props.id,
      'aggregate_item_spend',
      this.aggItemsParams(),
    )
  }

  handleVendorSpendClick(event) {
    const vendor_name = event.point.category
    const { reports, id } = this.props
    const { unit_id } = reports[id]
    this.props.setWidgetState(id, { vendor_name })
    this.drilldown('aggregate_item_spend', vendor_name)
    this.props.fetchReport(
      this.props.id,
      'aggregate_item_spend',
      this.aggItemsParams(),
    )
  }

  aggItemsParams(props = this.props) {
    const { unit_id, gl_code } = this.widget(props)
    return `?unit_id=${unit_id}&gl_code=${gl_code}${this.getDateParams(props)}`
  }

  handleAggregateItemsSpendTableClick(rowInfo) {
    const { inventory_item_id, item_name } = rowInfo.original
    const { reports, id } = this.props
    const { vendor_id } = reports[id].aggregate_item_spend[rowInfo.index]

    this.drilldown('item_trend_report', item_name)
    this.props.setWidgetState(id, { item_name, inventory_item_id, vendor_id })
    this.props.fetchReport(
      this.props.id,
      'item_trend_report',
      `?id=${inventory_item_id}&vendor_id=${vendor_id}${this.getDateParams()}`,
    )
  }

  itemTrendParams(props = this.props) {
    const { inventory_item_id, vendor_id } = this.widget()
    return `?id=${inventory_item_id}&vendor_id=${vendor_id}${this.getDateParams(
      props,
    )}`
  }

  handleItemTrendClick(e) {
    const { widgets, id, reports } = this.props
    const { imageLink } =
      this.props.reports[id].item_trend_report.items[e.point.index]
    if (_.isEmpty(imageLink)) {
      return
    }
    window.open(imageLink, '_blank')
  }

  onCompressClick() {
    this.goToInitialChart()
    this.props.onCompressClick()
  }

  goToInitialChart() {
    const { id } = this.props
    const { intitialChartType, division } = this.widget()
    if (_.isEmpty(division)) return
    const breadcrumb =
      intitialChartType === 'ap_divisions_spend' ? 'divisions' : division.name
    this.props.setChartType(id, intitialChartType)
    this.props.sliceHistory(id, -1)
    this.props.pushHistory(id, intitialChartType, breadcrumb)
  }

  render() {
    const { widgets, id, reports } = this.props
    const userId = reports[id] ? reports[id].unit_id : ''
    // const urlParams = `?unit_id=${userId}&group_id=stellands`
    const { chartType } = this.widget()

    if (!chartType) return <div></div>
    return (
      <Widget
        title="AP Spend"
        type={contextRoutes[chartType]}
        urlParams={this.urlParams(userId, chartType)}
        shouldFetch={false}
        history={this.props.history}
        {...this.props}
        onCompressClick={this.onCompressClick}
      >
        {this.renderChart()}
      </Widget>
    )
  }
}

DrilldownWidget.propTypes = {}

const mapStateToProps = (state) => ({
  widgets: state.widgets.widgets,
  reports: state.reports,
  startDate: state.reports.startDate,
  endDate: state.reports.endDate,
  company: state.company,
  dashboard: state.dashboard,
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
  addReport,
})(DrilldownWidget)
