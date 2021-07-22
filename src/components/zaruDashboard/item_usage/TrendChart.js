import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ChartWrapper from '../ChartWrapper'

function buildConfig(data, title, unit) {
  if (_.isEmpty(data)) return {}
  const chartConfig = {
    title: {
      text: `${title || ''} Trend`,
    },
    yAxis: {
      title: {
        text: 'Percent',
      },
    },
    xAxis: {
      type: 'datetime',
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      enabled: false,
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        pointStart: 2010,
      },
    },

    series: [
      {
        name: 'Inventory',
        data: data.map((d) => [Date.parse(d.date), d.inventory]),
      },
      {
        name: 'Purchase',
        data: data.map((d) => [Date.parse(d.date), d.purchase]),
      },
      {
        name: 'Usage',
        data: data.map((d) => [Date.parse(d.date), d.usage]),
      },
    ],
  }

  return chartConfig
}
class TrendChart extends Component {
  render() {
    const theme = ['#50B432', '#ED561B', '#33A8FF', '#64E572', '#6AF9C4']
    const { reports, id, type, data, title } = this.props
    return (
      <ChartWrapper
        dataIsPresent={!_.isEmpty(data)}
        config={buildConfig(data, title)}
        modules={[]}
        theme={theme}
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
