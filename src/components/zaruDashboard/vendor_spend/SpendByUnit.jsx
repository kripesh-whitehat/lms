import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { formatIntoDollars } from 'utils'
import ChartWrapper from '../ChartWrapper'


function buildConfig(data) {
  if (_.isEmpty(data)) return { }
  const { vendor_spend } = data
  const vendors = vendor_spend.map(d => d.name)
  const amounts = vendor_spend.map(d => d.amount)

  const chartConfig = {
     chart: {
         type: 'bar'
     },
     title: {
         text: ''
     },
     xAxis: {
         categories: vendors,
         title: {
             text: null
         }
     },
     yAxis: {
         labels: {
             overflow: 'justify'
         },
         title: {
             text: 'Amount ($)'
         }
     },
     tooltip: {
         enabled: false
     },
     plotOptions: {
         bar: {
             dataLabels: {
                 enabled: true
             }
         }
     },
     credits: {
         enabled: false
     },
     series: [{
         name: 'Vendors',
         data: amounts,
         dataLabels: {
             formatter: function () {
               return formatIntoDollars(this.y)
            }
         }
     }]
 };

 return chartConfig
}
class SpendByUnit extends Component {
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
    const { reports, id } = this.props
    const report = reports[id]['vendor_spend'] || []
    return (
      <ChartWrapper
        dataIsPresent={!_.isEmpty(report)}
        config={buildConfig(report)}
        theme={theme}
        {...this.props}
      />
    )
  }
}

SpendByUnit.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.7
}

SpendByUnit.propTypes = {
  container: PropTypes.string.isRequired
}

const mapStateToProps = state => {
  return { reports: state.reports }
}


export default connect(mapStateToProps)(SpendByUnit)
