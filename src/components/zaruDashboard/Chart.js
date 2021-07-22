import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts-more'
import _ from 'lodash'
import React, { Component } from 'react'

class Chart extends Component {
  constructor(props) {
    super(props)
    this.state = { display: 'flex', chartId: String(Math.random()) }
    this.handleDataClick = this.handleDataClick.bind(this)
    this.updateCategories = this.updateCategories.bind(this)
    this.updatePlotLines = this.updatePlotLines.bind(this)
    this.updateFourRBubbleChart = this.updateFourRBubbleChart.bind(this)
    this.barXAxisConfig = this.barXAxisConfig.bind(this)
  }

  componentDidMount() {
    const { config, modules, theme, printView } = this.props
    HighchartsMore(Highcharts)
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
        animation: printView ? { duration: 100 } : true,
      },
      title: {
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        },
      },
      xAxis: {
        gridLineWidth: 1,
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
    const { width, height } = this.getSize()

    const configWithSize = {
      ...config,
      xAxis: { ...config.xAxis, labels: this.barXAxisConfig() },
      chart: { ...config.chart, width, height },
      plotOptions: { ...config.plotOptions, series: plotOptionSeries },
    }
    this.chart = new Highcharts.Chart(this.state.chartId, configWithSize)
  }

  handleDataClick(event) {
    const { onDataClick, printView } = this.props
    if (!printView) onDataClick(event)
  }

  updateCategories(config) {
    const categoriesPresent = config.xAxis && config.xAxis.categories
    if (!categoriesPresent) return
    this.chart.xAxis[0].setCategories(config.xAxis.categories)
  }

  barXAxisConfig() {
    const { config, fullscreen } = this.props
    const highchartsType = _.isEmpty(config.chart) ? null : config.chart.type
    let commonAtts = { style: { fontSize: '12px', whiteSpace: 'nowrap' } }
    if (config && config.force && config.xAxis && config.xAxis.labels) {
      commonAtts = { ...commonAtts, ...config.xAxis.labels }
    }
    return highchartsType === 'bar'
      ? {
          ...commonAtts,
          formatter() {
            if (!(typeof this.value.substring === 'function')) return this.value
            const maxChars = fullscreen ? 35 : 14
            if (this.value.length > maxChars) {
              return `${this.value.substring(0, maxChars)}...`
            }
            return this.value
          },
        }
      : commonAtts
  }

  updatePlotLines(config) {
    ;['xAxis', 'yAxis'].forEach((axis) => {
      const plotLinesPresent =
        config[axis] && config[axis].plotLines && config[axis].plotLines[0]
      if (plotLinesPresent) {
        this.chart[axis][0].options.plotLines[0].label.text =
          config[axis].plotLines[0].label.text
        this.chart[axis][0].options.plotLines[0].value =
          config[axis].plotLines[0].value
        this.chart[axis][0].update()
      }
    })
  }

  updateFourRBubbleChart(newSeries) {
    while (this.chart.series.length > 0) this.chart.series[0].remove(true)
    newSeries.forEach((series) => {
      this.chart.addSeries(series)
    })
  }

  updateSeries(newSeries) {
    if (this.chart.series.length === 0) {
      newSeries.forEach((series) => {
        this.chart.addSeries(series)
      })
    } else {
      this.chart.series.forEach((series, index) => {
        series.update(newSeries[index])
      })
    }
  }

  updateDrilldown(config) {
    if (this.chart.options.drilldown && config.drilldown) {
      this.chart.options.drilldown.series = config.drilldown.series
    }
  }

  getSize() {
    const {
      widgetHeight,
      widgetWidth,
      widthRatio,
      heightRatio,
      fullscreen,
      fullscreenHeightRatio,
      printView,
    } = this.props
    if (printView) {
      return {
        width: 900,
        height: heightRatio * 850,
      }
    }
    if (!fullscreen) {
      return {
        width: widthRatio * widgetWidth,
        height: heightRatio * widgetHeight,
      }
    }
    const elements = document.getElementsByClassName('fruit-main-chart')
    const element = elements[elements.length - 1]
    return {
      width: element.offsetWidth,
      height: element.offsetHeight * fullscreenHeightRatio,
    }
  }

  setDimensions() {
    // this takes the size of of the container on resize and resizes
    // the chart using the highcharts api
    const { width, height } = this.getSize()
    this.chart.setSize(width, height)
  }

  componentDidUpdate(prevProps) {
    // a series of operations defined by the highcharts api to
    // update charts when data or size changes
    const { config, type, theme } = this.props
    this.setDimensions()
    Highcharts.theme = { colors: theme }
    Highcharts.setOptions(Highcharts.theme)
    if (!_.isEqual(config, prevProps.config)) {
      if (type === '4r_menu_recipe_by_type_company') {
        this.updateFourRBubbleChart(config.series)
        return this.chart.redraw()
      }
      this.updateSeries(config.series)

      this.chart.setTitle({ text: config.title.text })
      this.updateDrilldown(config)
      this.updateCategories(config)
      this.updatePlotLines(config)
      this.chart.redraw()
    }
  }

  render() {
    // id is passed down from the grid layout as container prop and tells
    // highcharts what element to attach to
    return (
      <div
        style={{ display: 'flex' }}
        id={this.state.chartId}
        className="chart"
      />
    )
  }
}

Chart.defaultProps = {
  type: 'Chart',
  widthRatio: 1,
  heightRatio: 1,
  fullscreenHeightRatio: 0.85,
  theme: [],
  onDataClick: () => null,
}

export default Chart
