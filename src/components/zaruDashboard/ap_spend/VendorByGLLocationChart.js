import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { formatIntoDollars } from 'utils'
import ChartWrapper from '../ChartWrapper'

function buildConfig(data) {
  if (_.isEmpty(data)) return {}
  const vendors = data.map((vendor) => ({
    x: vendor.name,
    y: parseFloat(vendor.amount),
  }))
  const chartConfig = {
    chart: {
      type: 'pie',
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: vendors,
      title: {
        text: null,
      },
    },
    yAxis: {
      title: {
        text: 'Amount',
      },
    },
    tooltip: {
      enabled: true,
      formatter() {
        return (
          this.point.x +
          '<br>' +
          'Amount: ' +
          formatIntoDollars(this.y) +
          '<br>' +
          'Percent: ' +
          +Math.round(this.percentage) +
          '%'
        )
      },
    },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          formatter() {
            return `${this.point.x}<br>${formatIntoDollars(this.y)}`
          },
        },
      },
    },
    series: [
      {
        name: 'Categories',
        data: vendors,
      },
    ],
  }

  return chartConfig
}
class APVendorByGLLocationChart extends Component {
  render() {
    const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']
    const { reports, id, type } = this.props
    const data = reports[id][type]
    return (
      <ChartWrapper
        dataIsPresent={!_.isEmpty(data)}
        config={buildConfig(data)}
        theme={theme}
        modules={[]}
        {...this.props}
      />
    )
  }
}

APVendorByGLLocationChart.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.7,
}

APVendorByGLLocationChart.propTypes = {
  container: PropTypes.string.isRequired,
  widthRatio: PropTypes.number,
  heightRatio: PropTypes.number,
}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(APVendorByGLLocationChart)
