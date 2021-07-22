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
import { setGlFilters } from 'actions/CogsActions'
import 'styles/FruitConsumptionWidget.css'
import { selectedDivisions, selectedUnits, setFetching } from 'utils'
import Widget from '../Widget'
import APSpendTable from './APSpendTable'
import CogsAcrossUnit from './CogsAcrossUnit'
import CogsAcrossUnitTrend from './CogsAcrossUnitTrend'
import CogsReport from './CogsReport'
import CostAcrossCompanyChart from './CostAcrossCompanyChart'
import CostAcrossUnitsChart from './CostAcrossUnitsChart'
import CostByCategoryChart from './CostByCategoryChart'
import InventoryCountsContainer from './InventoryCountsContainer'
import InvoicesByItem from './InvoicesByItem'
import TrendChart from './TrendChart'

class CostWidget extends Component {
  constructor(props) {
    super(props)
    this.renderChart = this.renderChart.bind(this)
    this.wrapChart = this.wrapChart.bind(this)
    this.getChart = this.getChart.bind(this)
    this.drilldown = this.drilldown.bind(this)
    this.fetchChartData = this.fetchChartData.bind(this)
    this.handleCostAcrossCompanyClick =
      this.handleCostAcrossCompanyClick.bind(this)
    this.handleCostByCategoryClick = this.handleCostByCategoryClick.bind(this)
    this.handleCostAcrossUnitsClick = this.handleCostAcrossUnitsClick.bind(this)
    this.handleGlClick = this.handleGlClick.bind(this)
    this.params = this.params.bind(this)
    this.costByCategoryParams = this.costByCategoryParams.bind(this)
    this.unit_ids = this.unit_ids.bind(this)
    this.toggleDivisionChart = this.toggleDivisionChart.bind(this)
    this.unitIdsByDivision = this.unitIdsByDivision.bind(this)
    this.fetchCostAcrossUnits = this.fetchCostAcrossUnits.bind(this)
    this.fetchCogsAcrossUnit = this.fetchCogsAcrossUnit.bind(this)
    this.setCostDates = this.setCostDates.bind(this)
    this.onCompressClick = this.onCompressClick.bind(this)
    this.goToInitialChart = this.goToInitialChart.bind(this)
  }

  UNSAFE_componentWillMount() {
    const { id, fullscreen } = this.props
    // set breadcrumb in redux state
    if (!fullscreen) {
      this.props.pushHistory(
        id,
        'cost_across_company',
        `Aggregate Company Cost Of Sales`,
      )
      // set which chart is shown in redux state
      this.props.setChartType(id, 'cost_across_company')
      // call the api for the first chart
      this.props.fetchReport(
        this.props.id,
        'cost_across_company',
        this.costAcrossCompanyParams(),
      )
    }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const byInvoiceDateChanged =
      this.props.widget_settings.byInvoiceDate !==
      nextProps.widget_settings.byInvoiceDate

    const {
      id,
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
      this.goToInitialChart(nextProps)
      if (this.widget(nextProps).chartType === 'cost_across_company') {
        this.props.fetchReport(
          this.props.id,
          'cost_across_company',
          this.costAcrossCompanyParams(nextProps),
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

      this.props.setWidgetState(id, {
        drillUp: false,
        startDate: null,
        endDate: null,
      })
    }

    const { startDate, endDate, costDatesInvalid } = this.widget(nextProps)
    const shouldSetDates = !startDate && !endDate && !costDatesInvalid
    if (shouldSetDates) this.setCostDates(nextProps)
  }

  setCostDates(nextProps) {
    const { id, reports } = nextProps
    const { chartType } = this.widget(nextProps)
    if (
      reports[id] &&
      !_.isEmpty(reports[id][chartType]) &&
      !reports[id].fetchingData
    ) {
      const report = reports[id][chartType]
      const { StartDate, EndDate } = report[0]
        ? report[0]
        : report[chartType][0]
      if (StartDate && EndDate) {
        if (isNaN(Date.parse(StartDate)) || isNaN(Date.parse(EndDate))) {
          this.setWidgetState({ costDatesInvalid: true })
        } else {
          this.props.setWidgetState(id, {
            startDate: moment(Date.parse(StartDate)),
            endDate: moment(Date.parse(EndDate)),
          })
        }
      }
    }
  }

  params(props = this.props) {
    switch (this.widget(props).chartType) {
      case 'cost_across_company':
        return this.costAcrossCompanyParams(props)
      case 'cost_across_company_by_category':
        return this.costByCategoryParams(props)
      case 'cogs_across_company':
        return this.costByCategoryParams(props)
      case 'cost_across_units':
        return this.costAcrossUnitsParams(props, true)
      case 'cogs_across_division':
        return this.costTrendDivisionParams(props)
      case 'cogs_across_unit':
        return this.glParams(props)
      case 'cost_trend_gl_unit':
        return this.glUnitParams(props)
      case 'cost_trend_across_company':
        return this.costByCategoryParams(props)
      case 'cost_trend_across_division':
        return this.costTrendDivisionParams(props)
      default:
        return ''
    }
  }

  unitIdsByDivision(divisionName, props = this.props) {
    return props.company.locations
      .filter(
        (l) => l.type === 'location' && l.checked && l.region === divisionName,
      )
      .map((l) => l.unit_id)
  }

  unit_ids(props = this.props, byDivision = false) {
    // return array of relevant selected user ids
    const { division } = this.widget()
    if (byDivision) {
      return this.unitIdsByDivision(division, props)
    }
    return props.company.locations
      .filter((l) => l.type === 'location' && l.checked)
      .map((l) => l.unit_id)
  }

  fetchChartData(type, params = '') {
    const formattedCategory = encodeURIComponent(this.widget().category)
    this.props.fetchReport(
      this.props.id,
      type,
      `?category=${formattedCategory}${this.getDateParams()}${params}`,
    )
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
    if (isTable) {
      return chart
    }
    return this.wrapChart(chart)
  }

  getChart(chartType) {
    // return chart based on chart type in redux state
    const { reports, id } = this.props
    const container = `chart-${id}`

    switch (chartType) {
      case 'cost_across_company':
        return (
          <div>
            <CostAcrossCompanyChart
              onDataClick={this.handleCostAcrossCompanyClick}
              data={reports[id].cost_across_company}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.65}
              {...this.props}
            />
          </div>
        )
      case 'cost_across_company_by_category': {
        const show_trend = reports[id].cost_across_company_by_category
          ? reports[id].cost_across_company_by_category.show_trend
          : true
        return (
          <div>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={() =>
                this.toggleCompanyByCatChart('cost_trend_across_company')
              }
              disabled={!show_trend}
            >
              Show Trend Across Company
            </button>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={() =>
                this.toggleCompanyByCatChart('cogs_across_company')
              }
            >
              Show COGS Across Company
            </button>
            <CostByCategoryChart
              onDataClick={(event) =>
                this.handleCostByCategoryClick(event.point.category)
              }
              data={reports[id].cost_across_company_by_category}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.55}
              {...this.props}
            />
          </div>
        )
      }
      case 'cost_across_units': {
        const show_trend = reports[id].cost_across_company_by_category
          ? reports[id].cost_across_company_by_category.show_trend
          : true
        return (
          <div>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={() =>
                this.toggleDivisionChart('cost_trend_across_division')
              }
              disabled={!show_trend}
            >
              Show Trend Across Division
            </button>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={() => this.toggleDivisionChart('cogs_across_division')}
            >
              Show COGS Across Division
            </button>
            <CostAcrossUnitsChart
              onDataClick={(event) =>
                this.handleCostAcrossUnitsClick(event.point.category)
              }
              data={reports[id].cost_across_units}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.55}
              {...this.props}
            />
          </div>
        )
      }
      case 'cogs_across_unit': {
        return (
          <CogsAcrossUnit
            widget_id={id}
            data={reports[id].cogs_across_unit}
            container={container}
            type={chartType}
            widthRatio={0.85}
            heightRatio={0.4}
            category={this.widget().category}
            {...this.props}
          />
        )
      }
      case 'cost_trend_across_company':
        return (
          <div>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={() => this.toggleBack('cost_across_company_by_category')}
            >
              Show Cost Across Company
            </button>
            <TrendChart
              data={reports[id].cost_trend_across_company}
              title={this.widget().category}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.68}
              {...this.props}
            />
          </div>
        )
      case 'cost_trend_across_division':
        return (
          <div>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={() => this.toggleBack('cost_across_units')}
            >
              Show Cost Across Division
            </button>
            <TrendChart
              data={reports[id].cost_trend_across_division}
              title={this.widget().division}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.68}
              {...this.props}
            />
          </div>
        )
      case 'cost_trend_gl_unit':
        return (
          <TrendChart
            data={reports[id].cost_trend_gl_unit}
            title={this.widget().gl_name}
            container={container}
            type={chartType}
            widthRatio={0.85}
            heightRatio={0.75}
            {...this.props}
          />
        )
      case 'cogs_across_company':
        return (
          <div>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={() => this.toggleBack('cost_across_company_by_category')}
            >
              Show Cost Across Company
            </button>
            <CogsReport
              data={reports[id].cogs_across_company}
              title={this.widget().gl_name}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.4}
              {...this.props}
            />
          </div>
        )
      case 'cogs_across_division':
        return (
          <div>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={() => this.toggleBack('cost_across_units')}
            >
              Show Cost Across Division
            </button>
            <CogsReport
              data={reports[id].cogs_across_division}
              title={this.widget().gl_name}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.4}
              {...this.props}
            />
          </div>
        )
      case 'cogs_across_unit_trend': {
        return <CogsAcrossUnitTrend widget_id={id} />
      }
      case 'inventory_counts_table': {
        return <InventoryCountsContainer widget_id={id} />
      }
      case 'ap_spend_table': {
        return <APSpendTable widget_id={id} />
      }
      case 'invoices_by_item': {
        return <InvoicesByItem widget_id={id} />
      }
      default:
        return <div>Whoops!</div>
    }
  }

  drilldown(chartType, breadcrumb) {
    // set chart type and breadcrumbs in redux
    // called in every chart click with drilldown functionality
    const { id } = this.props
    setTimeout(() => {
      this.props.onExpandClick(id)
      this.props.setChartType(id, chartType)
      this.props.pushHistory(id, chartType, breadcrumb)
    }, 100)
  }

  // below are functions for handling drilldown events and
  // defining parameters to be sent in api calls

  costAcrossCompanyParams(props = this.props) {
    const { group_id } = props.company
    return `?group_id=${group_id}&unit_ids=${this.unit_ids(
      props,
    )}${this.getDateParams(props)}`
  }

  handleCostAcrossCompanyClick(event) {
    setFetching(false)
    const { id, company } = this.props
    const { locations } = company
    const { category } = event.point
    this.props.setGlFilters([])
    this.props.setWidgetState(id, { category })

    const divisions = selectedDivisions(locations)
    const units = selectedUnits(locations)
    if (units.length === 1) {
      this.fetchCogsAcrossUnit(units[0], category)
      this.drilldown('cogs_across_unit', category)
    } else if (divisions.length === 1) {
      const divisionName = divisions[0] ? divisions[0].name : ''
      this.fetchCostAcrossUnits(divisionName, category)
      this.drilldown('cost_across_units', category)
    } else {
      this.props.fetchReport(
        this.props.id,
        'cost_across_company_by_category',
        this.costByCategoryParams(),
      )
      this.props.setWidgetState(id, { category })
      this.drilldown('cost_across_company_by_category', category)
    }
  }

  fetchCostAcrossUnits(divisionName, category) {
    const formattedCategory = encodeURIComponent(category)
    const params = `?unit_ids=${this.unitIdsByDivision(
      divisionName,
    )}&category=${formattedCategory}${this.getDateParams()}`
    const { id } = this.props
    this.props.fetchReport(this.props.id, 'cost_across_units', params)
    setTimeout(() => {
      this.props.setWidgetState(id, { division: divisionName, category })
    }, 75)
  }

  fetchCogsAcrossUnit(unit, category = this.widget().category) {
    const { id, company } = this.props
    const { group_id } = company
    const formattedCategory = encodeURIComponent(category)
    const params = `?unit_id=${
      unit.unit_id
    }&group_id=${group_id}&category=${formattedCategory}${this.getDateParams()}`
    this.props.fetchReport(this.props.id, 'cogs_across_unit', params)
    setTimeout(() => {
      this.props.setWidgetState(id, { unit_id: unit.unit_id, category })
    }, 75)
  }

  costByCategoryParams(props = this.props) {
    const { company } = props
    const { group_id } = company
    const { category } = this.widget()
    const formattedCategory = encodeURIComponent(category)

    return `?group_id=${group_id}&unit_ids=${this.unit_ids(
      props,
    )}&category=${formattedCategory}${this.getDateParams(props)}`
  }

  handleCostByCategoryClick(division) {
    const { id, company } = this.props
    this.props.setWidgetState(id, { division })
    const units = selectedUnits(
      company.locations.filter((loc) => loc.region === division),
    )
    if (units.length === 1) {
      this.fetchCogsAcrossUnit(units[0])
      this.drilldown('cogs_across_unit', units[0].name)
    } else {
      this.props.fetchReport(
        this.props.id,
        'cost_across_units',
        this.costAcrossUnitsParams(),
      )
      this.drilldown('cost_across_units', division)
    }
  }

  costAcrossUnitsParams(props = this.props) {
    const { category } = this.widget()
    const formattedCategory = encodeURIComponent(category)
    return `?unit_ids=${this.unit_ids(
      props,
      true,
    )}&category=${formattedCategory}${this.getDateParams(props)}`
  }

  handleCostAcrossUnitsClick(unitName) {
    const { id, reports } = this.props
    const { unit_id } = reports[id].cost_across_units.cost_across_units.find(
      (u) => u.name === unitName,
    )

    this.props.setWidgetState(id, { unit_id })

    setFetching(false)

    this.props.fetchReport(this.props.id, 'cogs_across_unit', this.glParams())
    this.drilldown('cogs_across_unit', unitName)
  }

  glParams(props = this.props) {
    const { company } = props
    const { unit_id, category } = this.widget()
    const formattedCategory = encodeURIComponent(category)
    const { group_id } = company
    return `?unit_id=${unit_id}&group_id=${group_id}&category=${formattedCategory}${this.getDateParams(
      props,
    )}`
  }

  handleGlClick(event) {
    const { reports, id } = this.props
    const gl = event.point.x
    const { gl_code } = reports[id].cogs_across_unit.find(
      (d) => d.gl_name === gl,
    )
    this.props.setWidgetState(this.props.id, { gl_code, gl_name: gl })
    this.props.fetchReport(
      this.props.id,
      'cost_trend_gl_unit',
      this.glUnitParams(),
    )
    this.drilldown('cost_trend_gl_unit', gl)
  }

  glUnitParams(props = this.props) {
    const { gl_code, unit_id, category } = this.widget()
    const formattedCategory = encodeURIComponent(category)
    return `?gl_code=${gl_code}&unit_id=${unit_id}&category=${formattedCategory}${this.getDateParams(
      props,
    )}`
  }

  costTrendDivisionParams(props = this.props) {
    const { company } = props
    const { locations_by_region, group_id } = company
    const { division, category } = this.widget()
    const formattedCategory = encodeURIComponent(category)
    const { division_id } = locations_by_region.find(
      (div) => div.name === division,
    )
    const unit_ids = company.locations
      .filter(
        (l) =>
          l.type === 'location' &&
          l.region === this.widget().division &&
          l.checked,
      )
      .map((l) => l.unit_id)

    return `?unit_ids=${unit_ids}&group_id=${group_id}&division_id=${division_id}&category=${formattedCategory}${this.getDateParams(
      props,
    )}`
  }

  toggleBack(chartType) {
    this.props.setChartType(this.props.id, chartType)
  }

  toggleCompanyByCatChart(chartType) {
    this.props.setChartType(this.props.id, chartType)
    this.props.fetchReport(
      this.props.id,
      chartType,
      this.costByCategoryParams(),
    )
  }

  toggleDivisionChart(chartType) {
    const { id } = this.props
    this.props.setChartType(id, chartType)
    this.props.fetchReport(
      this.props.id,
      chartType,
      this.costTrendDivisionParams(),
    )
  }

  onCompressClick() {
    this.goToInitialChart()
    this.props.onCompressClick()
  }

  goToInitialChart() {
    const { id } = this.props
    this.props.setChartType(id, 'cost_across_company')
    this.props.sliceHistory(id, -1)
    this.props.pushHistory(
      id,
      'cost_across_company',
      `Aggregate Company Cost Of Sales`,
    )
  }

  render() {
    const { chartType } = this.widget()
    const { startDate, endDate } = this.widget()
    const dates =
      startDate && endDate
        ? {
            startDate: moment(startDate).format('MM/DD/YYYY'),
            endDate: moment(endDate).format('MM/DD/YYYY'),
          }
        : { startDate: '', endDate: '' }

    if (!chartType) return <div></div>
    return (
      <Widget
        title="Cost of Sales"
        type={chartType}
        shouldFetch={false}
        history={this.props.history}
        dates={dates}
        showDatesCanvas={startDate && endDate}
        {...this.props}
        onCompressClick={this.onCompressClick}
      >
        {this.renderChart()}
      </Widget>
    )
  }
}

const mapStateToProps = (state) => ({
  widgets: state.widgets.widgets,
  widget_settings: state.widget_settings.cost,
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
  setGlFilters,
})(CostWidget)
