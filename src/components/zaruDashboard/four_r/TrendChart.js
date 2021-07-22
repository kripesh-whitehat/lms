import _ from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { formatIntoDollars } from 'utils'
import ChartWrapper from '../ChartWrapper'

function buildConfig(data, title, unit) {
  if (_.isEmpty(data)) return {}
  const chartConfig = {
    chart: {
      zoomType: 'xy',
    },
    title: {
      text: `${title || ''} Trend`,
    },
    xAxis: [
      {
        categories: data.map((d) =>
          moment(Date.parse(d.EndDate)).format('MM/DD/YYYY'),
        ),
        crosshair: true,
      },
    ],
    yAxis: [
      {
        // Primary yAxis
        labels: {
          // format: '{value}°C',
        },
        title: {
          text: 'Quantity Sold',
        },
      },
      {
        // Secondary yAxis
        title: {
          text: 'Cost Per Plate',
        },
        labels: {
          // format: '{value} mm'
        },
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
      formatter() {
        return (
          `<b>Date:<b><br>${this.x}<br>` +
          `<b>Cost Per Plate:<b>` +
          `<br>${formatIntoDollars(this.points[0].y)}<br>` +
          `<br>` +
          `<b>Quantity Sold:<b>` +
          `<br>${this.points[1].y}`
        )
      },
    },
    series: [
      {
        name: 'Cost Per Plate',
        type: 'spline',
        yAxis: 1,
        data: data.map((d) => ({
          y: d.NetCost.Value / d.QuantitySold || 0,
          className: 'no-pointer',
        })),
      },
      {
        name: 'Quantity Sold',
        type: 'column',
        data: data.map((d) => ({
          y: d.QuantitySold,
          className: 'no-pointer',
        })),
      },
    ],
  }
  return chartConfig
}
class TrendChart extends Component {
  render() {
    const theme = ['#50B432', '#ED561B', '#33A8FF', '#64E572', '#6AF9C4']
    const { reports, id, type, title } = this.props
    return (
      <ChartWrapper
        dataIsPresent={!_.isEmpty(reports[id][type])}
        config={buildConfig(reports[id][type], title)}
        modules={[]}
        theme={theme}
        fullscreenHeightRatio={0.7}
        {...this.props}
      />
    )
  }
}

TrendChart.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.7,
}

TrendChart.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(TrendChart)
