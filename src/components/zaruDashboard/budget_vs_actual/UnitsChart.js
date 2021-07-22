import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { formatIntoDollars } from 'utils'
import ChartWrapper from '../ChartWrapper'

class UnitsChart extends Component {
  getBudgetAmount() {
    return this.props.calcBudgetedAmount
  }

  buildConfig(data) {
    if (_.isEmpty(data)) return {}

    const that = this
    const chartConfig = {
      chart: {
        type: 'bar',
      },
      title: {
        text: '',
      },
      xAxis: {
        categories: data.map((d) => d.Description),
        title: {
          text: null,
        },
      },
      yAxis: {
        labels: {
          overflow: 'justify',
        },
        title: {
          enabled: false,
        },
        reversedStacks: false,
      },
      tooltip: {
        formatter() {
          const budgetAmount =
            this.point.TotalSalesBudgetedPercent * that.getBudgetAmount()

          return (
            `${this.point.Description}<br>` +
            `Budgeted Amount: ${formatIntoDollars(budgetAmount)}<br>` +
            `Budgeted Percent: ${(this.point.BudgetedPercent * 100).toFixed(
              2,
            )}%`
          )
        },
      },

      plotOptions: {
        bar: {
          stacking: 'normal',
          dataLabels: {
            enabled: true,
            formatter() {
              if (this.y === 0) return ''
              return formatIntoDollars(this.y)
            },
          },
          states: {
            inactive: {
              enabled: false,
            },
          },
        },
      },
      series: [
        {
          name: 'Spent',
          data: data.map((d) => ({ ...d, y: d.SpentAmount })),
        },
        {
          name: 'Remaining',
          data: data.map((d) => {
            const budgetAmount =
              d.TotalSalesBudgetedPercent * that.getBudgetAmount()
            const diff = budgetAmount - d.SpentAmount
            return { ...d, y: diff < 0 ? 0 : diff }
          }),
        },
        {
          name: 'Over',
          data: data.map((d) => {
            const budgetAmount =
              d.TotalSalesBudgetedPercent * that.getBudgetAmount()
            const diff = budgetAmount - d.SpentAmount
            return { ...d, y: diff > 0 ? 0 : Math.abs(diff) }
          }),
        },
      ],
    }

    return chartConfig
  }

  render() {
    const theme = ['#50B432', '#2f3540', '#ED561B', '#64E572', '#FF9655']
    const { data } = this.props
    const details = data ? data.Details : []
    return (
      <ChartWrapper
        dataIsPresent={!_.isEmpty(details)}
        config={this.buildConfig(details)}
        theme={theme}
        modules={[]}
        {...this.props}
      />
    )
  }
}

UnitsChart.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.7,
}

UnitsChart.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({
  reports: state.reports,
  calcBudgetedAmount: state.budgetVsActual.budgetedAmount,
})

export default connect(mapStateToProps)(UnitsChart)
