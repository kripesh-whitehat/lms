import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { formatIntoDollars } from 'utils'
import ChartWrapper from './ChartWrapper'

function getChartData(report, dataIsEmpty) {
  if (dataIsEmpty) {
    return {}
  }
  const subcategories = report.gl_subcategory_spend.gl_spend
  const data = subcategories.map((subcat) => [
    subcat.gl_name,
    parseFloat(subcat.gl_amount),
  ])

  const series = [
    {
      name: 'GL Spend',
      colorByPoint: true,
      data: data.sort((a, b) => a[1] - b[1]),
    },
  ]

  const chartConfig = {
    chart: {
      type: 'pie',
    },
    title: {
      text: '',
    },
    subtitle: {
      text: '',
    },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          formatter() {
            return `${this.key}<br>${formatIntoDollars(this.y)}`
          },
        },
      },
    },

    tooltip: {
      enabled: true,
      formatter() {
        return `${this.key}<br>${formatIntoDollars(this.y)}`
      },
    },
    series,
  }
  return chartConfig
}
class APSpendDrilldownGlSubcategorySpendChart extends Component {
  render() {
    const theme = [
      '#058DC7',
      '#800080',
      '#24CBE5',
      '#DDDF00',
      '#50B432',
      '#ED561B',
      '#64E572',
      '#FF9655',
      '#6AF9C4',
    ]
    const report = this.props.reports[this.props.id]
    const dataIsEmpty =
      _.isEmpty(report) ||
      _.isEmpty(report.gl_subcategory_spend) ||
      _.isEmpty(report.gl_subcategory_spend.gl_spend)
    return (
      <ChartWrapper
        dataIsPresent={!dataIsEmpty}
        config={getChartData(report, dataIsEmpty)}
        modules={[]}
        theme={theme}
        {...this.props}
      />
    )
  }
}

APSpendDrilldownGlSubcategorySpendChart.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => {
  const { reports } = state
  return { reports }
}

export default connect(mapStateToProps)(APSpendDrilldownGlSubcategorySpendChart)
