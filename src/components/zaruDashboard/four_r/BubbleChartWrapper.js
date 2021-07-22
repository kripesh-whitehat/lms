import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts-more'
import _ from 'lodash'
import Chart from '../Chart'

class BubbleChartWrapper extends Chart {
  componentDidMount() {
    this.renderBubbleChart()
  }

  renderBubbleChart() {
    const { config, theme, printView } = this.props
    HighchartsMore(Highcharts)
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

  updateFourRBubbleChart(newSeries) {
    while (this.chart.series.length > 0) this.chart.series[0].remove(true)
    newSeries.forEach((series) => {
      this.chart.addSeries(series)
    })
  }

  componentDidUpdate(prevProps) {
    const { config, theme } = this.props
    this.setDimensions()

    Highcharts.theme = { colors: theme }
    Highcharts.setOptions(Highcharts.theme)

    if (!_.isEqual(config, prevProps.config)) {
      this.updateFourRBubbleChart(config.series)
      this.chart.setTitle({ text: config.title.text })
      this.updateDrilldown(config)
      this.updateCategories(config)
      this.updatePlotLines(config)
      this.chart.redraw()
    }
  }
}

export default BubbleChartWrapper
