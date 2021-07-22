import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import NonResponsiveChart from '../NonResponsiveChart'

function buildConfig(data, title) {
  if (_.isEmpty(data)) return {}
  const chartConfig = {
    chart: {
      backgroundColor: null,
      borderWidth: 0,
      type: 'line',
      margin: [2, 0, 2, 4],
      width: 120,
      height: 25,
      style: {
        overflow: 'visible',
      },
    },
    title: {
      text: '',
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      labels: {
        enabled: false,
      },
      title: {
        text: null,
      },
      startOnTick: false,
      endOnTick: false,
      tickPositions: [],
      type: 'datetime',
    },
    yAxis: {
      endOnTick: false,
      startOnTick: false,
      labels: {
        enabled: false,
      },
      title: {
        text: null,
      },
      tickPositions: [0],
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      hideDelay: 0,
      outside: true,
      shared: true,
      xDateFormat: '%m/%d/%Y',
    },
    series: [
      {
        name: 'Inventory',
        data: data.map((d) => [Date.parse(d.date), d.inventory]),
        marker: { radius: 2 },
      },
      {
        name: 'Purchase',
        data: data.map((d) => [Date.parse(d.date), d.purchase]),
        marker: { radius: 2 },
      },
      {
        name: 'Usage',
        data: data.map((d) => [Date.parse(d.date), d.usage]),
        marker: { radius: 2 },
      },
    ],
  }

  return chartConfig
}
class SparkLine extends Component {
  render() {
    const theme = ['#50B432', '#ED561B', '#33A8FF', '#64E572', '#6AF9C4']
    const { reports, id, type, chartData, title } = this.props
    return (
      <NonResponsiveChart
        config={buildConfig(chartData, title)}
        modules={[]}
        theme={theme}
        {...this.props}
      />
    )
  }
}

SparkLine.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.7,
}

SparkLine.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(SparkLine)
