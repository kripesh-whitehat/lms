import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'styles/4rBubbleChart.css'
import ChartWrapper from '../ChartWrapper'

function buildConfig(data) {
  data = data.filter((d) => d.checked)

  let zeroBubble = true
  const series = data.map((recipe) => {
    const x = recipe.QuantitySold
    const y = Number((recipe.MarginPercent.Value * 100).toFixed(2)) || 0
    const z =
      Number((recipe.GrossPrice.Value / recipe.QuantitySold).toFixed(2)) || 0

    if (x === 0 && y === 0 && z === 0) {
      zeroBubble = false
    }

    return {
      x,
      y,
      z,
      name: recipe.Name,
      recipeId: recipe.CorporateRecipeId,
    }
  })

  const xSum = series.map((data) => data.x).reduce((a, b) => a + b, 0)
  const xAverage = xSum / data.length || 0

  const ySum = series.map((data) => data.y).reduce((a, b) => a + b, 0)
  const yAverage = ySum / data.length || 0

  if (zeroBubble) {
    series.unshift({
      name: 'dummy series',
      x: 0,
      y: 0,
      z: 0,
      showInLegend: false,
      color: 'transparent',
      enableMouseTracking: false,
    })
  }

  const seriesData = [{ data: series }]

  return {
    chart: {
      type: 'bubble',
      plotBorderWidth: 1,
      zoomType: 'xy',
      marginRight: 87,
    },

    legend: {
      enabled: false,
    },

    title: {
      text: null,
    },

    xAxis: {
      gridLineWidth: 0.01,
      title: {
        text: 'Quantity Sold',
      },
      labels: {
        format: '{value}',
      },
      lineColor: 'transparent',
      plotLines: [
        {
          color: 'black',
          dashStyle: 'dot',
          width: 2,
          value: xAverage,
          label: {
            rotation: 0,
            y: 15,
            style: {
              fontStyle: 'italic',
            },
            text: `Quantity Sold Average: ${xAverage.toFixed(2)}`,
          },
          zIndex: 1000,
        },
      ],
    },

    yAxis: {
      startOnTick: false,
      endOnTick: false,
      title: {
        text: 'Margin',
      },
      labels: {
        format: '{value} %',
      },
      lineWidth: 0,
      minorGridLineWidth: 0,
      lineColor: 'transparent',
      minorTickLength: 0,
      tickLength: 0,
      maxPadding: 0.2,
      plotLines: [
        {
          color: 'black',
          dashStyle: 'dot',
          width: 2,
          value: yAverage,
          label: {
            align: 'right',
            style: {
              fontStyle: 'italic',
            },
            text: `Margin Average: ${yAverage.toFixed(2)} %`,
            x: -10,
          },
          zIndex: 1000,
        },
      ],
    },

    tooltip: {
      useHTML: true,
      headerFormat: '<table>',
      pointFormat:
        '<tr><th colspan="2"><h3>{point.name}</h3></th></tr>' +
        '<tr><th>Quantity Sold:</th><td> {point.x}</td></tr>' +
        '<tr><th>Margin:</th><td> {point.y} %</td></tr>' +
        '<tr><th>Sale Price:</th><td> $' +
        '{point.z}</td></tr>',
      footerFormat: '</table>',
    },

    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format: '{point.name}',
        },
      },
      bubble: {
        minSize: 3,
        maxSize: 50,
      },
    },
    series: seriesData,
  }
}

class BubbleChart extends Component {
  render() {
    const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']
    const { data, fullscreenOpen } = this.props
    const dataIsPresent = !_.isEmpty(data)
    const buildData = buildConfig(data)

    return (
      <div className={`bubble-chart ${fullscreenOpen ? 'fullscreen' : ''}`}>
        <div className="corner-titles">
          <div>REPLATE</div>
          <div>RETAIN</div>
        </div>
        <ChartWrapper
          dataIsPresent={dataIsPresent}
          config={buildData}
          modules={[]}
          theme={theme}
          fullscreenHeightRatio={0.5}
          is_bubble
          {...this.props}
        />
        <div className="corner-titles corner-bottom">
          <div>RETHINK</div>
          <div>REPRICE</div>
        </div>
      </div>
    )
  }
}

BubbleChart.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.7,
}

BubbleChart.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => {
  const { reports, dashboard } = state
  return {
    reports,
    fullscreenOpen: dashboard.fullscreenOpen,
  }
}

export default connect(mapStateToProps)(BubbleChart)
