import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'styles/MultiUnitVendorSpend.css'
import { formatIntoDollars } from 'utils'
import ChartWrapper from '../ChartWrapper'

function buildConfig(data) {
  const vendors = data.map((d) => d.name)
  const amounts = data.map((d) => d.amount)

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
      title: {
        text: 'Amount ($)',
      },
    },
    tooltip: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        animation: false,
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
        dataLabels: {
          formatter() {
            return formatIntoDollars(this.y)
          },
        },
      },
    ],
  }

  return chartConfig
}
class MultiUnitVendorSpend extends Component {
  constructor(props) {
    super(props)
    this.state = { select: 10 }
    this.handleSelectChange = this.handleSelectChange.bind(this)
  }

  handleSelectChange(event) {
    this.setState({ select: event.target.value })
  }

  render() {
    const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']
    const { reports, id, type } = this.props
    const { select } = this.state
    const report = reports[id][type] || []
    const numVendors = Math.min(report.length, select)
    const data = report.slice(0, numVendors)
    return (
      <div>
        <div className="num-vendors-container">
          <label htmlFor="num-vendors">Number of Vendors</label>
          <select
            id="num-vendors"
            defaultValue="10"
            onChange={this.handleSelectChange}
          >
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value={report.length}>All Vendors</option>
          </select>
        </div>
        <ChartWrapper
          dataIsPresent={!_.isEmpty(data)}
          config={buildConfig(data)}
          theme={theme}
          {...this.props}
        />
      </div>
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
