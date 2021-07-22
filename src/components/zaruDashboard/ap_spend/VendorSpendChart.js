import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ChartWrapper from '../ChartWrapper'

function getChartData(vendor_hash_data) {
  if (!vendor_hash_data) {
    return {}
  }

  const vendors = vendor_hash_data.map((vendor) => vendor.name)
  const amounts = vendor_hash_data.map((vendor) => vendor.amount)

  const chartConfig = {
    chart: {
      type: 'bar',
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
      labels: {
        overflow: 'justify',
      },
    },
    tooltip: {
      valueSuffix: '',
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
      {
        name: 'Vendors',
        data: amounts,
      },
    ],
  }

  return chartConfig
}
class VendorSpendChart extends Component {
  render() {
    const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']
    const { reports, id, type } = this.props
    return (
      <ChartWrapper
        dataIsPresent={!_.isEmpty(reports[id][type])}
        config={getChartData(reports[id][type])}
        modules={[]}
        theme={theme}
        {...this.props}
      />
    )
  }
}

VendorSpendChart.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.7,
}

VendorSpendChart.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(VendorSpendChart)
