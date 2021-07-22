import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Chart from './Chart'

class GlSpendChart extends Component {
  constructor(props) {
    super(props)
    this.getChartData = this.getChartData.bind(this)
  }

  getChartData() {
    const { reports, id, type } = this.props
    const { category_hash_data, subcategory_hash_data } = reports[id][type]
    const series = [
      {
        name: 'GL Spend',
        colorByPoint: true,
        data: category_hash_data,
      },
    ]
    const drilldown = {
      series: subcategory_hash_data,
    }
    const chartConfig = {
      chart: {
        type: 'pie',
      },
      title: {
        text: '',
      },
      subtitle: {
        text: '',
      },
      plotOptions: {
        series: {
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.y:.1f}',
          },
        },
      },

      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat:
          '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}</b><br/>',
      },
      series,
      drilldown,
    }
    return chartConfig
  }

  render() {
    const { id, type, reports } = this.props
    const theme = [
      '#058DC7',
      '#800080',
      '#24CBE5',
      '#DDDF00',
      '#50B432',
      '#ED561B',
      '#64E572',
      '#FF9655',
      '#6AF9C4',
    ]

    return (
      <Chart
        config={this.getChartData()}
        {...this.props}
        modules={[]}
        theme={theme}
      />
    )
  }
}

GlSpendChart.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.5,
}

GlSpendChart.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => {
  const { reports } = state
  return { reports }
}

export default connect(mapStateToProps)(GlSpendChart)
