import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Chart from './Chart'

function getChartData(props) {
  const { glName } = props
  const { gauge_percentage } = props.reports[props.id]
  const glAmount = Math.round(gauge_percentage[props.glName])

  const chartConfig = {
    chart: {
      type: 'solidgauge',
      margin: [0, 0, 0, 0],
      backgroundColor: 'transparent',
    },
    title: props.glName,
    yAxis: {
      min: 0,
      max: props.budgetAmount,
      lineWidth: 0,
      tickWidth: 0,
      minorTickLength: 0,
      minTickInterval: [500],
      labels: {
        enabled: false,
      },
      stops: [
        [0, '#000088'],
        [1000 / 5000, '#000088'],
        [2000 / 5000, '#00ff00'],
        [3000 / 5000, '#00ff00'],
        [4000 / 5000, '#ff8c00'],
        [5000 / 5000, '#ff0000'],
      ],
    },
    pane: {
      size: '100%',
      center: ['50%', '60%'],
      startAngle: -130,
      endAngle: 130,
      background: {
        borderWidth: 20,
        backgroundColor: '#DBDBDB',
        shape: 'arc',
        borderColor: '#DBDBDB',
        outerRadius: '90%',
        innerRadius: '90%',
      },
    },
    tooltip: {
      enabled: false,
    },
    plotOptions: {
      solidgauge: {
        borderColor: '#009CE8',
        borderWidth: 20,
        radius: 90,
        innerRadius: '90%',
        dataLabels: {
          y: 35,
          borderWidth: 0,
          useHTML: true,
        },
      },
    },
    series: [
      {
        data: [glAmount],
        dataLabels: {
          format: `<div style="Width: 60px;text-align:left"><span style="font-size:14px;color:#88C425">\${y}</span><br/><span style="font-size: 13px;color: black;"> ${glName} </span></div>`,
        },
      },
    ],

    credits: {
      enabled: false,
    },
  }
  return chartConfig
}

class WeeklySpendGaugeChart extends Component {
  render() {
    return (
      <Chart config={getChartData(this.props)} modules={[]} {...this.props} />
    )
  }
}

WeeklySpendGaugeChart.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => {
  const { reports } = state
  return { reports }
}

export default connect(mapStateToProps)(WeeklySpendGaugeChart)
