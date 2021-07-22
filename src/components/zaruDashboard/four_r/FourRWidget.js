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
import { selectedDivisions, selectedUnits } from 'utils'
import moment from 'moment'
import Widget from '../Widget'
import BarChart from './BarChart'
import FourRMenuRecipeByTypeCompany from './FourRMenuRecipeByTypeCompany'
import TrendChart from './TrendChart'
import UnitsBarChart from './UnitsBarChart'
import UnitTrendTable from './UnitTrendTable'

class FourRWidget extends Component {
  constructor(props) {
    super(props)
    this.renderChart = this.renderChart.bind(this)
    this.wrapChart = this.wrapChart.bind(this)
    this.getChart = this.getChart.bind(this)
    this.drilldown = this.drilldown.bind(this)
    this.fetchChartData = this.fetchChartData.bind(this)
    this.params = this.params.bind(this)
    this.unit_ids = this.unit_ids.bind(this)
    this.byCompanyClick = this.byCompanyClick.bind(this)
    this.byCompanyParams = this.byCompanyParams.bind(this)
    this.byDivisionParams = this.byDivisionParams.bind(this)
    this.companyReportSuccess = this.companyReportSuccess.bind(this)
    this.handleRecipeTypeSelect = this.handleRecipeTypeSelect.bind(this)
    this.byDivisionsClick = this.byDivisionsClick.bind(this)
    this.byUnitsClick = this.byUnitsClick.bind(this)
    this.trendParams = this.trendParams.bind(this)
    this.onRecipeSelectAll = this.onRecipeSelectAll.bind(this)
    this.showCompanyTrendClick = this.showCompanyTrendClick.bind(this)
    this.showDivisionTrendClick = this.showDivisionTrendClick.bind(this)
    this.onCompressClick = this.onCompressClick.bind(this)
    this.goToInitialChart = this.goToInitialChart.bind(this)
  }

  componentDidMount() {
    const { id, company, fullscreen } = this.props
    const { group_id } = company

    if (!fullscreen) {
      // set breadcrumb in redux state
      this.props.pushHistory(id, '4r_menu_recipe_by_type_company', `4r Chart`)
      // set which chart is shown in redux state
      this.props.setChartType(id, '4r_menu_recipe_by_type_company')
      // call the api for the first chart
      if (!_.isEmpty(company.locations)) {
        this.props.fetchReport(
          this.props.id,
          '4r_menu_recipe_by_type_company',
          this.byCompanyParams(),
        )
      } else {
        this.props.setReportAttribute(id, { fetchingData: true })
      }
      this.props.fetchReport(
        this.props.id,
        'menu_recipe_types',
        `?unitId=${group_id}`,
        false,
      )
      this.props.setWidgetState(id, {
        companyRecipeIndex: 0,
        selectedRecipes: [],
        fourRTableSelectAllChecked: true,
      })
    }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const { id } = this.props
    const {
      dashboard: { fullscreenOpen },
      byInvoiceDate,
    } = nextProps
    const byInvoiceDateChanged = this.props.byInvoiceDate !== byInvoiceDate
    const { drillUp } = this.widget(nextProps)
    const lastActiveWidgetId = this.props.dashboard.activeWidget
      ? this.props.dashboard.activeWidget.id
      : null
    const fullscreenDidClose =
      !fullscreenOpen &&
      this.props.dashboard.fullscreenOpen &&
      this.props.dashboard.updatedInFullscreen &&
      this.props.id !== lastActiveWidgetId
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
    if (nextProps.fullscreen) return
    // call the api with new dates or locations if changed
    if (locationsChanged) {
      this.goToInitialChart(nextProps)
      this.props.fetchReport(
        this.props.id,
        '4r_menu_recipe_by_type_company',
        this.byCompanyParams(nextProps),
      )
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
    // debugger
    if (this.companyReportSuccess(nextProps)) {
      const { RecipeTypes = {} } =
        nextProps?.reports[id]?.['4r_menu_recipe_by_type_company'] ?? {}
      const recipeType = _.isEmpty(RecipeTypes) ? {} : RecipeTypes[0]
      this.props.setWidgetState(id, {
        recipeType,
        selectedTypeId: recipeType.RecipeTypeId,
      })
    }

    if (
      !_.isEqual(this.widget().recipeType, this.widget(nextProps).recipeType)
    ) {
      const selectedRecipes = _.isEmpty(this.widget(nextProps).recipeType)
        ? []
        : this.mapSelectedRecipes(
            this.widget(nextProps).recipeType.Recipes || [],
          )
      this.props.setWidgetState(id, {
        selectedRecipes,
      })
    }
  }

  mapSelectedRecipes(recipes) {
    return recipes.map((r) => ({ ...r, checked: true }))
  }

  companyReportSuccess(nextProps) {
    const { id, reports } = this.props
    if (!reports[id]) return false

    const thisCompanyReport =
      this.props.reports[id]?.['4r_menu_recipe_by_type_company']
    const nextCompanyReport =
      nextProps.reports[id]?.['4r_menu_recipe_by_type_company']

    return !_.isEqual(thisCompanyReport, nextCompanyReport)
  }

  handleRecipeTypeSelect(event) {
    const { reports, id } = this.props
    const selectedTypeId = event.target.value
    const recipeType = reports[id][
      '4r_menu_recipe_by_type_company'
    ]?.RecipeTypes.find((type) => type.RecipeTypeId === selectedTypeId)
    const payload = { selectedTypeId, recipeType }
    this.props.setWidgetState(id, payload)
  }

  params(props = this.props) {
    switch (this.widget(props).chartType) {
      case '4r_menu_recipe_by_type_company': {
        return this.byCompanyParams(props)
      }
      case '4r_menu_recipe_by_divisions': {
        return this.byDivisionParams(props)
      }
      case '4r_menu_recipe_by_units': {
        return this.byUnitsParams(props)
      }
      case '4r_menu_recipe_trend_by_unit': {
        return this.trendParams(props)
      }
      case '4r_menu_recipe_trend_by_company': {
        return this.byDivisionParams(props)
      }
      case '4r_menu_recipe_trend_by_division': {
        return this.byUnitsParams(props)
      }
      default:
        return ''
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
      case '4r_menu_recipe_by_type_company': {
        const widget = this.widget()
        const { selectedRecipes } = widget

        return (
          <FourRMenuRecipeByTypeCompany
            id={id}
            reports={reports}
            widget={widget}
            initialSelectedRecipes={selectedRecipes}
            handleRecipeTypeSelect={this.handleRecipeTypeSelect}
            byCompanyClick={this.byCompanyClick}
            container={container}
            chartType={chartType}
            onRecipeSelectAll={this.onRecipeSelectAll}
            {...this.props}
          />
        )
      }
      case '4r_menu_recipe_by_divisions': {
        return (
          <div>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={this.showCompanyTrendClick}
            >
              Show Company Trend
            </button>
            <BarChart
              container={container}
              type={chartType}
              onDataClick={(event) => this.byDivisionsClick(event.point.name)}
              widthRatio={0.85}
              heightRatio={0.55}
              {...this.props}
            />
          </div>
        )
      }
      case '4r_menu_recipe_by_units': {
        return (
          <div>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={this.showDivisionTrendClick}
            >
              Show Division Trend
            </button>
            <UnitsBarChart
              container={container}
              type={chartType}
              onDataClick={this.byUnitsClick}
              widthRatio={0.85}
              heightRatio={0.55}
              {...this.props}
            />
          </div>
        )
      }
      case '4r_menu_recipe_trend_by_unit': {
        return (
          <div>
            <TrendChart
              title={this.widget().recipeName}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.5}
              {...this.props}
            />
            <UnitTrendTable
              data={reports[id]['4r_menu_recipe_trend_by_unit']}
              container={container}
              type={chartType}
              widthRatio={0.85}
              {...this.props}
            />
          </div>
        )
      }
      case '4r_menu_recipe_trend_by_company': {
        return (
          <div>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={() =>
                this.props.setChartType(
                  this.props.id,
                  '4r_menu_recipe_by_divisions',
                )
              }
            >
              Show Division Bar Chart
            </button>
            <TrendChart
              title={this.widget().recipeName}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.5}
              data={reports[id]['4r_menu_recipe_trend_by_company']}
              {...this.props}
            />
            <UnitTrendTable
              data={reports[id]['4r_menu_recipe_trend_by_company']}
              container={container}
              type={chartType}
              widthRatio={0.85}
              {...this.props}
            />
          </div>
        )
      }
      case '4r_menu_recipe_trend_by_division': {
        return (
          <div>
            <button
              className="btn btn-small btn-primary btn-toggle"
              onClick={() =>
                this.props.setChartType(
                  this.props.id,
                  '4r_menu_recipe_by_units',
                )
              }
            >
              Show Division Bar Chart
            </button>
            <TrendChart
              title={this.widget().recipeName}
              container={container}
              type={chartType}
              widthRatio={0.85}
              heightRatio={0.5}
              data={reports[id]['4r_menu_recipe_trend_by_division']}
              {...this.props}
            />
            <UnitTrendTable
              data={reports[id]['4r_menu_recipe_trend_by_division']}
              container={container}
              type={chartType}
              widthRatio={0.85}
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
    this.props.onExpandClick(id)
    this.props.setChartType(id, chartType)
    this.props.pushHistory(id, chartType, breadcrumb)
  }

  // below are functions for handling drilldown events and
  // defining parameters to be sent in api calls
  byCompanyParams(props = this.props) {
    return `?units=${this.unit_ids(props)}${this.getDateParams(props)}`
  }

  byCompanyClick(recipeId, name) {
    // const { recipeId, name } = event.point

    const { id, company } = this.props
    this.props.setWidgetState(id, { recipeId, recipeName: name })
    if (selectedUnits(company.locations).length === 1) {
      this.recipeId = recipeId
      this.handleOneUnitSelected()
      return
    }

    if (selectedDivisions(company.locations).length === 1) {
      this.handleOneDivisionSelected()
      return
    }
    this.props.fetchReport(
      this.props.id,
      '4r_menu_recipe_by_divisions',
      this.byDivisionParams(this.props, recipeId),
    )
    setTimeout(() => {
      this.drilldown('4r_menu_recipe_by_divisions', name)
    }, 100)
  }

  handleOneDivisionSelected() {
    const division = selectedDivisions(this.props.company.locations)[0]
    this.byDivisionsClick(division.name)
  }

  handleOneUnitSelected(locations = this.props.company.locations) {
    const unit = selectedUnits(locations)[0]
    const { name } = unit
    const { id } = this.props

    this.props.fetchReport(
      this.props.id,
      '4r_menu_recipe_trend_by_unit',
      this.trendParams(this.props, unit.unit_id),
    )
    setTimeout(() => {
      this.props.setWidgetState(id, { unitId: unit.unit_id })
      this.drilldown('4r_menu_recipe_trend_by_unit', name)
    }, 100)
  }

  byDivisionParams(props = this.props, recipeIdParam = null) {
    const recipeId = recipeIdParam || this.widget().recipeId
    return `?GroupRecipeId=${recipeId}${this.getDateParams(
      props,
    )}&units=${this.unit_ids(props)}`
  }

  byDivisionsClick(name) {
    const { id, company } = this.props
    const locations = company.locations.filter((loc) => loc.region === name)
    this.props.setWidgetState(id, { divisionName: name })
    if (selectedUnits(locations).length === 1) {
      this.handleOneUnitSelected(locations)
      return
    }
    this.props.fetchReport(
      this.props.id,
      '4r_menu_recipe_by_units',
      this.byUnitsParams(this.props, name),
    )
    setTimeout(() => {
      this.drilldown('4r_menu_recipe_by_units', name)
    }, 100)
  }

  byUnitsParams(props = this.props, divisionName = this.widget().divisionName) {
    const { recipeId } = this.widget()
    const { locations } = props.company
    const unitIds = locations
      .filter((loc) => loc.checked && loc.region === divisionName)
      .map((unit) => unit.unit_id)
    console.log(recipeId)
    return `?GroupRecipeId=${recipeId}${this.getDateParams(
      props,
    )}&units=${unitIds}`
  }

  byUnitsClick(event) {
    const { name } = event.point
    const { id } = this.props
    this.props.fetchReport(
      this.props.id,
      '4r_menu_recipe_trend_by_unit',
      this.trendParams(this.props, event.point.id),
    )
    setTimeout(() => {
      this.props.setWidgetState(id, { unitId: event.point.id })
      this.drilldown('4r_menu_recipe_trend_by_unit', name)
    }, 100)
  }

  trendParams(props = this.props, unitId = this.widget().unitId) {
    let { recipeId } = this.widget()
    if (_.isEmpty(recipeId) && this.recipeId) {
      recipeId = this.recipeId
    }
    return `?GroupRecipeId=${recipeId}${this.getDateParams(
      props,
    )}&units=${unitId}`
  }

  onRecipeSelectAll(event) {
    const { checked } = event.target
    const selectedRecipes = this.widget().selectedRecipes.map((recipe) => ({
      ...recipe,
      checked,
    }))
    this.props.setWidgetState(this.props.id, {
      fourRTableSelectAllChecked: checked,
      selectedRecipes,
    })
  }

  showCompanyTrendClick() {
    this.props.fetchReport(
      this.props.id,
      '4r_menu_recipe_trend_by_company',
      this.byDivisionParams(),
    )
    setTimeout(() => {
      this.props.setChartType(this.props.id, '4r_menu_recipe_trend_by_company')
    }, 100)
  }

  showDivisionTrendClick() {
    this.props.fetchReport(
      this.props.id,
      '4r_menu_recipe_trend_by_division',
      this.byDivisionParams(),
    )
    setTimeout(() => {
      this.props.setChartType(this.props.id, '4r_menu_recipe_trend_by_division')
    }, 100)
  }

  onCompressClick() {
    this.goToInitialChart()
    this.props.onCompressClick()
  }

  goToInitialChart() {
    const { id } = this.props
    this.props.setChartType(id, '4r_menu_recipe_by_type_company')
    this.props.sliceHistory(id, -1)
    this.props.pushHistory(id, '4r_menu_recipe_by_type_company', `4r Chart`)
  }

  render() {
    // const urlParams = `?unit_id=${userId}&group_id=stellands`
    const { chartType } = this.widget()

    if (!chartType) return <div></div>
    return (
      <Widget
        title="4R Widget"
        type={chartType}
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

const mapStateToProps = (state) => ({
  widgets: state.widgets.widgets,
  reports: state.reports,
  startDate: state.reports.startDate,
  endDate: state.reports.endDate,
  company: state.company,
  dashboard: state.dashboard,
  byInvoiceDate: state.widget_settings.four_r.byInvoiceDate,
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
})(FourRWidget)
