import Highcharts from 'highcharts'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

class Chart extends Component {
  constructor(props) {
    super(props)
    this.state = { display: 'flex', chartId: String(Math.random()) }
    this.handleDataClick = this.handleDataClick.bind(this)
    this.updateCategories = this.updateCategories.bind(this)
  }

  componentDidMount() {
    const { container, config, modules, type, theme } = this.props
    if (modules) {
      modules.forEach(function (module) {
        module(Highcharts)
      })
    }
    Highcharts.theme = {
      colors: theme,
      chart: {
        backgroundColor: null,
        style: {
          fontFamily: 'Dosis, sans-serif',
        },
      },
      title: {
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        },
      },
      legend: {
        itemStyle: {
          fontWeight: 'bold',
          fontSize: '13px',
        },
      },
      xAxis: {
        gridLineWidth: 1,
        labels: {
          style: {
            fontSize: '12px',
          },
        },
      },
      yAxis: {
        minorTickInterval: 'auto',
        title: {
          style: {
            textTransform: 'uppercase',
          },
        },
        labels: {
          style: {
            fontSize: '12px',
          },
        },
      },
      plotOptions: {
        candlestick: {
          lineColor: '#404048',
        },
      },

      background2: 'whitesmoke',
    }

    // Apply the theme
    Highcharts.setOptions(Highcharts.theme)

    const plotOptionSeries = {
      point: { events: { click: this.handleDataClick } },
    }

    const configWithSize = {
      ...config,
      plotOptions: { ...config.plotOptions, series: plotOptionSeries },
    }
    this.chart = new Highcharts.Chart(this.state.chartId, configWithSize)
  }

  handleDataClick(event) {
    this.props.onDataClick(event)
  }

  updateCategories(config) {
    const categoriesPresent =
      config.xAxis && config.xAxis[0] && config.xAxis[0].categories
    if (!categoriesPresent) return
    this.chart.xAxis[0].setCategories(config.xAxis.categories)
  }

  updateSeries(newSeries) {
    if (this.chart.series.length === 0) {
      newSeries.forEach((series, index) => {
        this.chart.addSeries(series)
      })
    } else {
      this.chart.series.forEach((series, index) => {
        series.update(newSeries[index])
      })
    }
  }

  componentDidUpdate() {
    // a series of operations defined by the highcharts api to
    // update charts when data or size changes
    const { container, config, modules, type, theme } = this.props
    Highcharts.theme = { colors: theme }
    Highcharts.setOptions(Highcharts.theme)
    // this.updateSeries(config.series)
    // this.chart.setTitle({text: config.title.text })
    // this.updateCategories(config)
    this.chart.redraw()
  }

  componentWillUnmount() {
    const element = this.chart.renderTo
    element.parentNode.removeChild(element)
    const tooltips = document.getElementsByClassName(
      'highcharts-tooltip-container',
    )
    if (tooltips.length > 0) tooltips[0].parentNode.removeChild(tooltips[0])
  }

  render() {
    // id is passed down from the grid layout as container prop and tells
    // highcharts what element to attach to
    return <div style={{ display: 'flex' }} id={this.state.chartId} />
  }
}

Chart.defaultProps = {
  type: 'Chart',
  theme: [],
  onDataClick: () => null,
}

Chart.propTypes = {
  widgetHeight: PropTypes.string.isRequired,
  widgetWidth: PropTypes.string.isRequired,
}

export default Chart
