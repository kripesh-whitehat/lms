import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ChartWrapper from '../ChartWrapper'

function buildConfig(data) {
  if (_.isEmpty(data)) return {}
  const { cost_across_units } = data
  const vendors = cost_across_units.map((d) => d.name)
  const percents = cost_across_units.map((d) => d.percent)

  const chartConfig = {
    chart: {
      type: 'bar',
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: vendors,
      labels: {
        step: 1,
      },
      title: {
        text: null,
      },
    },
    yAxis: {
      labels: {
        overflow: 'allow',
        step: 1,
      },
      title: {
        text: 'Percent',
      },
    },
    tooltip: {
      enabled: false,
      valueSuffix: '',
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          allowOverlap: true,
          format: '{y} %',
        },
      },
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name: 'Categories',
        data: percents,
        dataLabels: {
          enabled: true,
          allowOverlap: true,
        },
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
        modules={[]}
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
