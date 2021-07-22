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
// top_vendor_spend_by_company
// vendor_spend
// vendor_spend_by_week
// gl_spend
// invoices_by_vendor_gl

import _ from 'lodash'
import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'
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
import Widget from '../Widget'
import GlSpend from './GlSpend'
import InvoiceTable from './InvoiceTable'
import MultiUnitVendorSpend from './MultiUnitVendorSpend'
import SpendByUnit from './SpendByUnit'
import SpendByWeek from './SpendByWeek'

const contextRoutes = {
  top_vendor_spend_by_company: 'top_vendor_spend_by_company',
  vendor_spend: 'vendor_spend',
  vendor_spend_by_week: 'vendor_spend_by_week',
  gl_spend: 'gl_subcategory_spend',
}

class VendorWidget extends Component {
  constructor(props) {
    super(props)
    this.renderChart = this.renderChart.bind(this)
    this.wrapChart = this.wrapChart.bind(this)
    this.getChart = this.getChart.bind(this)
    this.drilldown = this.drilldown.bind(this)
    this.fetchChartData = this.fetchChartData.bind(this)
    this.handleMultiUnitClick = this.handleMultiUnitClick.bind(this)
    this.handleByUnitClick = this.handleByUnitClick.bind(this)
    this.handleByWeekClick = this.handleByWeekClick.bind(this)
    this.unit_ids = this.unit_ids.bind(this)
    this.handleGlClick = this.handleGlClick.bind(this)
    this.onCompressClick = this.onCompressClick.bind(this)
    this.goToInitialChart = this.goToInitialChart.bind(this)
  }

  UNSAFE_componentWillMount() {
    const { id, fullscreen } = this.props
    // set breadcrumb in redux state
    if (!fullscreen) {
      this.props.pushHistory(
        id,
        'top_vendor_spend_by_company',
        'top_vendor_spend_by_company',
      )
      // set which chart is shown in redux state
      this.props.setChartType(id, 'top_vendor_spend_by_company')
      // call the api for the first chart
      this.props.fetchReport(
        this.props.id,
        'top_vendor_spend_by_company',
        this.multiUnitParams(),
      )
    }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const {
      id,
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
    const { drillUp } = this.widget(nextProps)
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
    // call the api with new dates or locations if changed
    if (nextProps.fullscreen) return
    if (locationsChanged) {
      this.goToInitialChart(nextProps)
      if (this.widget(nextProps).chartType === 'top_vendor_spend_by_company') {
        this.props.fetchReport(
          this.props.id,
          'top_vendor_spend_by_company',
          this.multiUnitParams(nextProps),
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
  }

  params(props = this.props) {
    switch (this.widget(props).chartType) {
      case 'top_vendor_spend_by_company':
        return this.multiUnitParams(props)
      case 'vendor_spend':
        return this.byUnitParams(props)
      case 'vendor_spend_by_week':
        return this.byWeekParams(props)
      case 'gl_spend':
        return this.glParams(props)
      case 'invoices_by_vendor_gl':
        return this.invoicesParams(props)
      default:
        return ''
    }
  }

  unit_ids(props = this.props) {
    // return array of relevant selected user ids
    return props.company.locations
      .filter((l) => l.type === 'location' && l.checked)
      .map((l) => l.unit_id)
  }

  fetchChartData(type, props = this.props) {
    const { vendor_id } = this.widget()
    this.props.fetchReport(
      this.props.id,
      type,
      `?unit_ids=${this.unit_ids()}&vendor_id=${vendor_id}${this.getDateParams()}`,
    )
  }

  widget(props = this.props) {
    // get data for this widget from redux state
    const { id, widgets } = props
    return widgets.find((w) => w.id === id)
  }

  getDateParams(props = this.props) {
    const { startDate, endDate } = props.reports
    return `&start_date=${moment(startDate).format(
      'MM/DD/YYYY',
    )}&end_date=${moment(endDate).format('MM/DD/YYYY')}`
  }

  wrapChart(chart) {
    // wrap chart in container for high charts functionality and styling
    if (this.widget().chartType === 'invoices_by_vendor_gl') return chart
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
    const container = `chart-${this.props.id}`

    switch (chartType) {
      case 'top_vendor_spend_by_company':
        return (
          <MultiUnitVendorSpend
            onDataClick={this.handleMultiUnitClick}
            container={container}
            type={chartType}
            widthRatio={0.85}
            heightRatio={0.5}
            {...this.props}
          />
        )
      case 'vendor_spend':
        return (
          <div>
            <button
              className="btn btn-small btn-primary"
              onClick={() => this.toggleChart('vendor_spend_by_week')}
            >
              Show Vendor Spend By Week
            </button>
            <SpendByUnit
              onDataClick={this.handleByUnitClick}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.55}
              {...this.props}
            />
          </div>
        )
      case 'vendor_spend_by_week':
        return (
          <div>
            <button
              className="btn btn-small btn-primary"
              onClick={() => this.toggleChart('vendor_spend')}
            >
              Show Vendor Spend By Unit
            </button>
            <SpendByWeek
              onDataClick={this.handleByWeekClick}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.6}
              {...this.props}
            />
          </div>
        )
      case 'gl_spend':
        return (
          <GlSpend
            onDataClick={this.handleGlClick}
            container={container}
            type={chartType}
            widthRatio={0.85}
            heightRatio={0.68}
            fromByUnit={this.widget().fromByUnit}
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
    setTimeout(() => {
      const { id } = this.props
      this.props.onExpandClick(id)
      this.props.setChartType(id, chartType)
      this.props.pushHistory(id, chartType, breadcrumb)
    }, 100)
  }

  // below are functions for handling drilldown events and
  // defining parameters to be sent in api calls

  multiUnitParams(props = this.props) {
    return `?unit_ids=${this.unit_ids(props)}${this.getDateParams(props)}`
  }

  handleMultiUnitClick(event) {
    const { id, reports } = this.props
    const { category } = event.point
    const data = reports[id].top_vendor_spend_by_company
    const { vendor_id } = data.find((d) => d.name === category)
    this.props.fetchReport(
      this.props.id,
      'vendor_spend',
      `?unit_ids=${this.unit_ids()}&vendor_id=${vendor_id}${this.getDateParams()}`,
    )
    this.props.setWidgetState(id, { vendor_id, vendor_name: category })
    this.drilldown('vendor_spend', category)
  }

  byUnitParams(props = this.props) {
    const { vendor_id } = this.widget()
    return `?unit_ids=${this.unit_ids(
      props,
    )}&vendor_id=${vendor_id}${this.getDateParams(props)}`
  }

  handleByUnitClick(event) {
    const { id, reports } = this.props
    const { category } = event.point
    const { vendor_id } = this.widget()
    const data = reports[id].vendor_spend.vendor_spend
    const { unit_id } = data.find((d) => d.name === category)
    this.props.fetchReport(
      this.props.id,
      'gl_spend',
      `?unit_ids=${[unit_id]}&vendor_id=${vendor_id}${this.getDateParams()}`,
    )
    this.props.setWidgetState(id, { unit_id, fromByUnit: true })
    this.drilldown('gl_spend', category)
  }

  byWeekParams(props = this.props) {
    const { vendor_id } = this.widget()
    return `?unit_ids=${this.unit_ids(
      props,
    )}&vendor_id=${vendor_id}${this.getDateParams(props)}`
  }

  handleByWeekClick(event) {
    const { vendor_id } = this.widget()
    const { category } = event.point
    const startWeek = moment(category).format('MM/DD/YYYY')
    const endWeek = moment(category).add(6, 'days').format('MM/DD/YYYY')
    this.props.fetchReport(
      this.props.id,
      'gl_spend',
      `?unit_ids=${this.unit_ids()}&vendor_id=${vendor_id}&start_date=${startWeek}&end_date=${endWeek}`,
    )
    this.props.setWidgetState(this.props.id, {
      fromByUnit: false,
      startWeek,
      endWeek,
    })
    this.drilldown('gl_spend', event.point.category)
  }

  glParams(props = this.props) {
    const { vendor_id, unit_id, fromByUnit } = this.widget()
    const unit_ids = fromByUnit ? [unit_id] : this.unit_ids(props)
    return `?unit_ids=${unit_ids}&vendor_id=${vendor_id}${this.getDateParams(
      props,
    )}`
  }

  handleGlClick(event) {
    const { id, reports } = this.props
    const { gl_code } = reports[id].gl_spend.find(
      (gl) => gl.gl_name === event.point.x,
    )
    this.props.fetchReport(
      this.props.id,
      'invoices_by_vendor_gl',
      this.invoicesParams(this.props, gl_code),
    )
    this.props.setWidgetState(id, { gl_code })
    this.drilldown('invoices_by_vendor_gl', event.point.x)
  }

  invoicesParams(props = this.props, gl_code = this.widget().gl_code) {
    const { vendor_id, unit_id, fromByUnit, startWeek, endWeek } = this.widget()
    let unit_ids = []
    let dateParams = ''
    if (fromByUnit) {
      unit_ids = [unit_id]
      dateParams = this.getDateParams(props)
    } else {
      unit_ids = this.unit_ids(props)
      dateParams = `&start_date=${startWeek}&end_date=${endWeek}`
    }
    return `?unit_ids=${unit_ids}&vendor_id=${vendor_id}&gl_code=${gl_code}${dateParams}`
  }

  toggleChart(chartType) {
    const { id } = this.props
    this.fetchChartData(contextRoutes[chartType])
    setTimeout(() => {
      this.props.sliceHistory(id, 0)
      this.props.pushHistory(id, chartType, this.widget().vendor_name)
      this.props.setChartType(id, chartType)
    }, 100)
  }

  onCompressClick() {
    this.goToInitialChart()
    this.props.onCompressClick()
  }

  goToInitialChart() {
    const { id } = this.props
    this.props.setChartType(id, 'top_vendor_spend_by_company')
    this.props.sliceHistory(id, -1)
    this.props.pushHistory(
      id,
      'top_vendor_spend_by_company',
      'top_vendor_spend_by_company',
    )
  }

  render() {
    // const urlParams = `?unit_id=${userId}&group_id=stellands`
    const { chartType } = this.widget()

    if (!chartType) return <div></div>
    return (
      <Widget
        title="Vendor Spend"
        type={contextRoutes[chartType]}
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

VendorWidget.propTypes = {}

const mapStateToProps = (state) => ({
  widgets: state.widgets.widgets,
  reports: state.reports,
  startDate: state.reports.startDate,
  endDate: state.reports.endDate,
  company: state.company,
  dashboard: state.dashboard,
  byInvoiceDate: state.widget_settings.vendor_spend.byInvoiceDate,
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
})(VendorWidget)
