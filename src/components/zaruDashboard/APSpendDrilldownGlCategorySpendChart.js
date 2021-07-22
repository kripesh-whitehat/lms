import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Chart from './Chart'

function getChartData(weekly_spend_hash) {
  const xAxis = Object.keys(weekly_spend_hash)
  const yAxisTitle = 'Weekly Spend ($)'

  // const weekly_spend_hash = {}
  const categories = []
  _.each(weekly_spend_hash, function (amount_hash, week) {
    _.each(amount_hash, function (amount, category) {
      categories.push(category)
    })
  })
  const uniqueCategories = Array.from(new Set(categories))
  const seriesChartHash = {}

  _.each(uniqueCategories, function (category) {
    const week_arr = []
    _.each(xAxis, function (week) {
      week_arr.push(0.0)
    })
    seriesChartHash[category] = {}
    seriesChartHash[category].data = week_arr
  })

  _.each(weekly_spend_hash, function (amount_hash, week) {
    _.each(amount_hash, function (amount, category) {
      const { data } = seriesChartHash[category]
      const idx = xAxis.indexOf(week)
      data[idx] = parseFloat(amount)
      seriesChartHash[category].data = data
    })
  })

  const finalSeriesData = []
  _.each(uniqueCategories, function (category) {
    finalSeriesData.push({
      name: category,
      data: seriesChartHash[category].data,
    })
  })

  const chartConfig = {
    chart: {
      type: 'column',
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: xAxis,
    },
    yAxis: {
      min: 0,
      title: {
        text: yAxisTitle,
      },
      gridLineColor: 'transparent',
    },
    series: finalSeriesData,
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: false,
          color: 'white',
        },
      },
      series: {
        dataLabels: {
          formatter() {
            const currencyFormattedValue = this.y
              .toFixed(0)
              .replace(/(\d)(?=(\d{4})+\.)/g, '$1,')
            return `${'<p>' + '$'}${currencyFormattedValue}</p>`
          },
          style: {
            fontSize: 8,
          },
        },
      },
    },
  }

  return chartConfig
}

class APSpendDrilldownGlCategorySpendChart extends Component {
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
    return (
      <Chart
        config={getChartData(
          this.props.reports[this.props.id].weekly_spend_report
            .weekly_spend_hash,
        )}
        modules={[]}
        theme={theme}
        {...this.props}
      />
    )
  }
}

APSpendDrilldownGlCategorySpendChart.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(APSpendDrilldownGlCategorySpendChart)
