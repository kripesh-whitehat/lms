import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'styles/MultiLocationChart.css'
import { formatIntoDollars } from 'utils'
import ChartWrapper from './ChartWrapper'

const sum = 0

class APSpendDrilldownMultiLocationSpendChart extends Component {
  constructor(props) {
    super(props)
    this.getChartData = this.getChartData.bind(this)
    this.calculateSum = this.calculateSum.bind(this)
  }

  parseData(vendor_hash_data) {
    if (_.isEmpty(vendor_hash_data)) {
      return []
    }
    return vendor_hash_data.map((loc) => loc.total_spend)
  }

  calculateSum() {
    const vendor_hash_data = this.props.reports[this.props.id].ap_location_spend
    if (_.isEmpty(vendor_hash_data)) {
      return 0
    }
    const data = this.parseData(vendor_hash_data)

    return data.reduce((a, b) => a + b)
  }

  getChartData(vendor_hash_data) {
    if (!vendor_hash_data) {
      return {}
    }
    const vendors = []
    _.each(vendor_hash_data, function (hash, index) {
      vendors.push(hash.unit_name)
      // vendors.push(`test_user_${index + 1}@example.com`)
    })
    const data = this.parseData(vendor_hash_data)

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
        labels: {
          step: 1,
        },
      },
      yAxis: {
        labels: {
          overflow: 'allow',
          step: 1,
        },
      },
      tooltip: {
        valueSuffix: '',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            allowOverlap: true,
          },
        },
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          name: 'Locations',
          data,
          dataLabels: {
            enabled: true,
            allowOverlap: true,
            formatter() {
              return formatIntoDollars(this.y)
            },
          },
        },
      ],
    }

    return chartConfig
  }

  render() {
    const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']
    const { divisionName } = this.props
    const { ap_location_spend } = this.props.reports[this.props.id]
    return (
      <div>
        <div className="multi-location-sum">
          {divisionName}: {formatIntoDollars(this.calculateSum())}
        </div>
        <ChartWrapper
          dataIsPresent={!_.isEmpty(ap_location_spend)}
          config={this.getChartData(ap_location_spend)}
          modules={[]}
          theme={theme}
          {...this.props}
        />
      </div>
    )
  }
}

APSpendDrilldownMultiLocationSpendChart.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({
  reports: state.reports,
  company: state.company,
})

export default connect(mapStateToProps)(APSpendDrilldownMultiLocationSpendChart)
