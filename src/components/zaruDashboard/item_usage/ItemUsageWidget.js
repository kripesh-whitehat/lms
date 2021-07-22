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
// cost_across_company
// cost_across_company_by_category
// cost_across_units
// cost_trend_gl_unit
// cost_trend_gl_unit
// cost_trend_across_company
// cost_trend_across_division

import _ from 'lodash'
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
import ItemUsageTable from './ItemUsageTable'
import TrendChart from './TrendChart'

class CostWidget extends Component {
  constructor(props) {
    super(props)
    this.state = {
      trendData: {},
      gl_code: 'ALL',
      trendTitle: '',
      chartType: '',
    }
    this.renderChart = this.renderChart.bind(this)
    this.wrapChart = this.wrapChart.bind(this)
    this.getChart = this.getChart.bind(this)
    this.drilldown = this.drilldown.bind(this)
    this.params = this.params.bind(this)
    this.unit_ids = this.unit_ids.bind(this)
    this.unitsByDivision = this.unitsByDivision.bind(this)
    this.toggleTrend = this.toggleTrend.bind(this)
    this.handleByCompanyClick = this.handleByCompanyClick.bind(this)
    this.handleByDivisionClick = this.handleByDivisionClick.bind(this)
    this.byUnitsParams = this.byUnitsParams.bind(this)
    this.handleGlSelect = this.handleGlSelect.bind(this)
  }

  UNSAFE_componentWillMount() {
    const { id, company, category, fullscreen } = this.props
    const { group_id, user_id } = company
    this.props.setWidgetState(this.props.id, { gl_code: 'ALL' })
    // set breadcrumb in redux state
    if (!fullscreen) {
      this.props.pushHistory(id, 'item_usage_by_company', `Company Item Usage`)
      // set which chart is shown in redux state
      this.props.setChartType(id, 'item_usage_by_company')
      // call the api for the first chart
      this.props.fetchReport(
        this.props.id,
        'item_usage_by_company',
        this.byCompanyParams(this.props, 'ALL'),
      )
      this.props.fetchReport(
        this.props.id,
        'item_usage_gls',
        `?unit_ids=${this.unit_ids()}`,
      )
    }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const { group_id } = this.props.company
    const dateChanged =
      this.props.startDate !== nextProps.startDate ||
      this.props.endDate !== nextProps.endDate
    const locationsChanged = !_.isEqual(
      this.props.company.locations,
      nextProps.company.locations,
    )
    const glChanged = this.widget().gl_code !== this.widget(nextProps).gl_code
    const { chartType } = this.widget()
    // call the api with new dates or locations if changed
    if (dateChanged || locationsChanged || (glChanged && chartType)) {
      this.props.fetchReport(
        this.props.id,
        this.widget().chartType,
        this.params(nextProps),
      )
    }
  }

  params(props = this.props) {
    switch (this.widget().chartType) {
      case 'item_usage_by_company':
        return this.byCompanyParams(props)
      case 'item_usage_by_division':
        return this.byDivisionParams(this.state.item_id, props)
      case 'item_usage_by_units':
        return this.byUnitsParams(props)
    }
  }

  unit_ids(props = this.props) {
    // return array of relevant selected user ids
    const { division } = this.widget()
    if (_.isEmpty(division)) {
      return props.company.locations
        .filter((l) => l.type === 'location' && l.checked)
        .map((l) => l.unit_id)
    }
    return props.company.locations
      .filter(
        (l) => l.type === 'location' && l.checked && l.region === division,
      )
      .map((l) => l.unit_id)
  }

  widget(props = this.props) {
    const { id, widgets } = props
    return widgets.find((w) => w.id === id)
  }

  getDateParams(props = this.props) {
    // format date parameters from redux state
    const { startDate, endDate } = props.reports
    return `&start_date=${moment(startDate).format(
      'MM/DD/YYYY',
    )}&end_date=${moment(endDate).format('MM/DD/YYYY')}`
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

  toggleTrend(trendData) {
    const { reports, id } = this.props
    this.setState({
      trendData,
      trendTitle: trendData.item,
      chartType: this.widget().chartType,
    })
    this.props.setChartType(this.props.id, 'item_usage_trend')
  }

  handleGlSelect(event) {
    this.props.setWidgetState(this.props.id, { gl_code: event.target.value })
  }

  getChart(chartType) {
    // return chart based on chart type in redux state
    const { reports, id, data } = this.props
    const container = `chart-${id}`

    switch (chartType) {
      case 'item_usage_by_company': {
        const data = reports[id].item_usage_by_company
        return (
          <div>
            <ItemUsageTable
              data={data}
              handleGlSelect={this.handleGlSelect}
              glCode={this.widget().gl_code}
              glSelectVisible
              nameHeader="Item Name"
              container={container}
              type={chartType}
              onRowClick={this.handleByCompanyClick}
              onTrendClick={this.toggleTrend}
              widthRatio={0.85}
              heightRatio={0.75}
              {...this.props}
            />
          </div>
        )
      }
      case 'item_usage_by_division': {
        const data = reports[id].item_usage_by_division
        return (
          <div>
            <ItemUsageTable
              data={data}
              handleGlSelect={this.handleGlSelect}
              glCode={this.widget().gl_code}
              nameHeader="Division Name"
              container={container}
              type={chartType}
              onRowClick={this.handleByDivisionClick}
              onTrendClick={this.toggleTrend}
              widthRatio={0.85}
              heightRatio={0.75}
              {...this.props}
            />
          </div>
        )
      }
      case 'item_usage_by_units': {
        const data = reports[id].item_usage_by_units
        return (
          <div>
            <ItemUsageTable
              data={data}
              handleGlSelect={this.handleGlSelect}
              glCode={this.widget().gl_code}
              nameHeader="Unit Name"
              container={container}
              type={chartType}
              onTrendClick={this.toggleTrend}
              widthRatio={0.85}
              heightRatio={0.75}
              {...this.props}
            />
          </div>
        )
      }
      case 'item_usage_trend': {
        return (
          <div>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={() =>
                this.props.setChartType(this.props.id, this.state.chartType)
              }
            >
              Show Usage Table
            </button>
            <TrendChart
              data={this.state.trendData.ipus}
              title={this.state.trendTitle}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.6}
              {...this.props}
            />
          </div>
        )
      }
      default:
        return <div>Whoops!</div>
    }
  }

  drilldown(chartType, breadcrumb) {
    // set chart type and breadcrumbs in redux
    // called in every chart click with drilldown functionality
    const { id } = this.props
    this.props.setChartType(id, chartType)
    this.props.pushHistory(id, chartType, breadcrumb)
  }

  // below are functions for handling drilldown events and
  // defining parameters to be sent in api calls
  byCompanyParams(props = this.props, gl = null) {
    const { id, reports, company } = props
    const { group_id } = company
    const gl_code = gl || this.widget(props).gl_code
    return `?group_id=${group_id}&unit_ids=${this.unit_ids(
      props,
    )}&${this.getDateParams(props)}&gl_code=${gl_code}`
  }

  handleByCompanyClick(row) {
    const { id } = this.props
    const { item, item_id } = row
    this.drilldown('item_usage_by_division', item)
    this.setState({ item_id })
    this.props.fetchReport(
      this.props.id,
      'item_usage_by_division',
      this.byDivisionParams(item_id),
    )
  }

  handleByDivisionClick(row) {
    const { id } = this.props
    const { item } = row
    this.drilldown('item_usage_by_units', item)
    this.props.fetchReport(
      this.props.id,
      'item_usage_by_units',
      this.byUnitsParams(),
    )
  }

  byUnitsParams(props = this.props) {
    const { item_id } = this.state
    const { group_id } = props.company
    const { gl_code } = this.widget(props)
    return `?group_id=${group_id}&gl_code=${gl_code}&${this.getDateParams(
      props,
    )}&unit_ids=${this.unit_ids(props)}&item_id=${item_id}`
  }

  unitsByDivision(props = this.props) {
    const { locations, locations_by_region } = props.company
    const divisions = locations_by_region.map((division) => ({
      divisionId: division.division_id,
      divisionName: division.name,
      unitIds: division.locations
        .filter((unit) => {
          const loc = locations.find((l) => l.unit_id === unit.unit_id)
          return loc.checked
        })
        .map((unit) => unit.unit_id),
    }))
    return JSON.stringify(divisions)
  }

  byDivisionParams(item_id, props = this.props) {
    const { id, reports, company } = props
    const { group_id } = company
    const { category, gl_code } = this.widget()
    return `?group_id=${group_id}&gl_code=${gl_code}&${this.getDateParams(
      props,
    )}&divisions=${this.unitsByDivision(props)}&item_id=${item_id}`
  }

  render() {
    const { widgets, id, reports, category } = this.props
    const userId = reports[id] ? reports[id].unit_id : ''
    const { chartType } = this.widget()

    if (!chartType) return <div></div>
    return (
      <Widget
        title="Item Usage"
        type={chartType}
        shouldFetch={false}
        history={this.props.history}
        {...this.props}
      >
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
