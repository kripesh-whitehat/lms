import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'styles/MultiLocationChart.css'
import { formatIntoDollars, sortDivisions } from 'utils'
import ChartWrapper from '../ChartWrapper'



class RegionSpendChart extends Component {
  getChartData(divisions) {
    if (_.isEmpty(divisions)) return {}
    const sortedDivisions = sortDivisions(divisions)
    const data = sortedDivisions.map(div => div.amount)
    const names = sortedDivisions.map(div => div.name)

    // const vendorValues = Object.values(vendor_hash_data).slice(0, 10);

    const chartConfig = {
       chart: {
           type: 'bar'
       },
       title: {
           text: ''
       },
       xAxis: {
           categories: names,
           title: {
               text: null
           }
       },
       yAxis: {
           labels: {
               overflow: 'justify'
           }
       },
       tooltip: {
           valueSuffix: '',
           valuePrefix: '$',
           formatter() {
             return formatIntoDollars(this.y)
           }
       },
       plotOptions: {
           bar: {
               dataLabels: {
                   enabled: true
               }
           }
       },
       legend: { enabled: false},
       credits: {
           enabled: false
       },
       series: [{
           name: '',
           data: data,
           dataLabels: {
             enabled: true,
             formatter: function () {
               return formatIntoDollars(this.y)
             }
           }
       }]
   };

   return chartConfig
  }

  calculateSum() {
    const { ap_divisions_spend } = this.props.reports[this.props.id]
    if (_.isEmpty(ap_divisions_spend)) return 0
    return ap_divisions_spend.map(div => parseFloat(div.amount)).reduce((a, b) => a + b)
  }

  render() {
    const { ap_divisions_spend } = this.props.reports[this.props.id]
    const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']
    const sum = this.calculateSum()

    return (
      <div>
        <div className='multi-location-sum'>Aggregate Company Spend: { formatIntoDollars(sum) }</div>
        <ChartWrapper
          dataIsPresent={!_.isEmpty(ap_divisions_spend)}
          config={this.getChartData(ap_divisions_spend)}
          modules={[]}
          theme={theme}
          {...this.props}
        />
      </div>
    )
  }
}


RegionSpendChart.propTypes = {
  container: PropTypes.string.isRequired
}

const mapStateToProps = state => {
  return { reports: state.reports, company: state.company }
}


export default connect(mapStateToProps)(RegionSpendChart)
