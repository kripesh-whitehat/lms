import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ChartWrapper from '../ChartWrapper'

function buildConfig(data) {
  if (_.isEmpty(data)) return {}

  const chartConfig = {
    title: {
      text: 'Trend',
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
    tooltip: {
      pointFormat:
        '<span style="color:{series.color}"></span><b>{point.y} %</b><br/>',
      xDateFormat: '%m/%d/%Y',
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
        data: data.map((d) => ({
          x: Date.parse(d.starting_week),
          y: d.percent,
          className: 'no-pointer',
        })),
      },
    ],
  }

  return chartConfig
}

class MultiUnitVendorSpend extends Component {
  render() {
    const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']
    const { data } = this.props
    return (
      <ChartWrapper
        dataIsPresent={!_.isEmpty(data)}
        config={buildConfig(data)}
        theme={theme}
        {...this.props}
      />
    )
  }
}

MultiUnitVendorSpend.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.7,
}

MultiUnitVendorSpend.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(MultiUnitVendorSpend)
