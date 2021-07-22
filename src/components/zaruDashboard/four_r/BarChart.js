import annotations from 'highcharts/modules/annotations'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'styles/SpendByWeek.css'
import { formatIntoDollars, sortDivisions } from 'utils'
import ChartWrapper from '../ChartWrapper'
import Select from './Select'

class FourRBarChart extends Component {
  constructor(props) {
    super(props)
    this.state = { selected: 'Margin' }
    this.buildConfig = this.buildConfig.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
  }

  handleSelect(event) {
    this.setState({ selected: event.target.value })
  }

  buildConfig(reportData) {
    if (_.isEmpty(reportData)) return {}
    const data = sortDivisions(reportData)
    const divisions = data.map((d) => d.DivisionName)
    const { selected } = this.state

    const sales = data.map((d) => {
      if (d.Recipe) {
        return {
          y: d.Recipe.GrossPrice.Value,
          name: d.DivisionName,
          id: d.DivisionId,
          marginPercent: d.Recipe.MarginPercent
            ? d.Recipe.MarginPercent.FormattedValue
            : '0%',
          costPercent: d.Recipe.FoodCostPercent
            ? d.Recipe.FoodCostPercent.FormattedValue
            : '0%',
          percentType: selected,
        }
      }
      return { y: 0, name: d.DivisionName, id: d.DivisionId }
    })

    const series2 = data.map((d) => {
      if (d.Recipe) {
        let y = 0
        if (this.state.selected === 'Margin') {
          y = d.Recipe.Impact.Value
        } else {
          y = d.Recipe.NetCost.Value
        }
        return {
          y,
          name: d.DivisionName,
          id: d.DivisionId,
          marginPercent: d.Recipe.MarginPercent
            ? d.Recipe.MarginPercent.FormattedValue
            : '0%',
          costPercent: d.Recipe.FoodCostPercent
            ? d.Recipe.FoodCostPercent.FormattedValue
            : '0%',
          percentType: selected,
        }
      }
      return { y: 0, name: d.DivisionName, id: d.DivisionId }
    })

    const chartConfig = {
      chart: {
        type: 'column',
      },
      title: {
        text: '',
      },
      xAxis: {
        categories: divisions,
        title: {
          text: null,
        },
      },
      yAxis: {
        labels: {
          overflow: 'justify',
        },
        title: {
          text: 'Amount ($)',
        },
      },
      tooltip: {
        enabled: true,
        formatter() {
          const { marginPercent, costPercent, percentType } = this.point
          const percent = percentType === 'Margin' ? marginPercent : costPercent
          return (
            `<b>${this.series.name}:<b>` +
            `<br>${formatIntoDollars(this.y)}<br>` +
            `<br>` +
            `<b>${percentType} Percent:<b>` +
            `<br>${percent}`
          )
        },
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
          },
        },
      },
      credits: {
        enabled: false,
      },
      series: [
        { data: sales, name: 'Sales' },
        { data: series2, name: this.state.selected, tooltip: {} },
      ],
    }

    return chartConfig
  }

  render() {
    const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']
    const { reports, id, type } = this.props
    return (
      <div className="spend-by-week">
        <Select
          options={['Margin', 'Cost']}
          handleSelect={this.handleSelect}
          selected={this.state.selected}
        />
        <ChartWrapper
          dataIsPresent={!_.isEmpty(reports[id][type])}
          config={this.buildConfig(reports[id][type])}
          modules={[annotations]}
          theme={theme}
          {...this.props}
        />
      </div>
    )
  }
}

FourRBarChart.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.7,
}

FourRBarChart.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(FourRBarChart)
