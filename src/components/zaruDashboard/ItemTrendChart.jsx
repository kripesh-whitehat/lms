import _ from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ChartWrapper from './ChartWrapper'
import Stats from './Stats'


class ItemTrendChart extends Component {
  constructor(props) {
    super(props)
    this.state = { seriesSelected: [true, false] }
    this.convertRatesToFloats = this.convertRatesToFloats.bind(this)
    this.handleSeriesLegendClick = this.handleSeriesLegendClick.bind(this)
    this.buildConfig = this.buildConfig.bind(this)
  }

  buildConfig() {
    const { reports, id, item_name } = this.props
    const { item_trend_report } = reports[id]
    if (_.isEmpty(item_trend_report)) return {}
    const byDate = {}
    item_trend_report.items.forEach((d) => {
      if (byDate[d.date]) {
        const average = byDate[d.date]
        const numItems = average.numItems + 1
        const total_qty = parseFloat(average.total_qty) + parseFloat(d.qty)
        const total_rate = parseFloat(average.total_rate) + parseFloat(d.rate)
        byDate[d.date] = {
          ...average,
          total_qty,
          total_rate,
          qty: (total_qty / numItems),
          rate: (total_rate /numItems),
          isAverage: true,
          numItems
        }
      } else {
        byDate[d.date] = {
          ...d,
          total_qty: parseFloat(d.qty),
          total_rate: parseFloat(d.rate),
          numItems: 1
        }
      }
    })
    const items = Object.values(byDate).map( item => ({
      x: Date.parse(item.date),
      y: parseFloat(item.rate),
      className: _.isEmpty(item.imageLink) ? 'no-pointer' : '',
      ...item
    }))

    return {

        title: {
            text: `${item_name} Price Trend`
        },
        xAxis: {
          type: 'datetime',
          title: {
              text: 'Date'
          }
        },
        yAxis: {
              title: {
                  text: 'Rate ($)'
              }
        },

        plotOptions: {
            line: {
              marker: {
                enabled: true
              }
            },
            series: {
                label: {
                    connectorAllowed: false
                },
                pointStart: 2010,
            }
        },

        series: [
          {
            name: 'Items',
            data: items
          }
        ],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        },
        tooltip: {
          formatter: function() {
                          const item = this.points[0].point
                          const averageText = item.isAverage ? `<br/><div style='color:orange'>(Average of ${item.numItems} items)<div>` : ''
                          var toolTip = "";
                          toolTip += "Vendor: " + item.vendor + '<br/>'
                          toolTip += "Date: " + moment(Date.parse(item.date)).format('MM/DD/YYYY') + '<br/>'
                          toolTip += "Rate: $" + item.rate.toFixed(2) + '<br/>'
                          toolTip += "Amount: $" + (parseFloat(item.rate) * parseFloat(item.qty)).toFixed(2) + '<br/>'
                          toolTip += averageText
                          return toolTip;
                      },
                      shared: true,
                      useHTML: true,
                      xDateFormat: '%m/%d/%Y'
        }
    }
  }

  handleSeriesLegendClick(event) {
    const { index } = event.target
    const seriesSelected = this.state.seriesSelected.slice()
    seriesSelected[index] = !seriesSelected[index]

    this.setState({ seriesSelected })
    return seriesSelected[index]
  }

  convertRatesToFloats() {
    const { reports, id, type } = this.props
    const { items } = reports[id][type]

    const newData = []
    return items.map((item) => {
      return [item.date, parseFloat(item.rate)]
    })
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
      '#6AF9C4'
    ]

    const data = reports[id][type]
    const items = data ? data.items : []
    return (
      <div>
        <ChartWrapper
          dataIsPresent={!_.isEmpty(reports[id][type])}
          config={this.buildConfig()}
          modules={[]}
          theme={theme}
          {...this.props}
        />
        <Stats ratesAndDates={items} onSeeAllStatsClick={this.props.onSeeAllStatsClick} />
      </div>
    )
  }
}

ItemTrendChart.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.5
}

ItemTrendChart.propTypes = {
  container: PropTypes.string.isRequired
}

const mapStateToProps = state => {
  const { reports } = state
  return { reports }
}


export default connect(mapStateToProps)(ItemTrendChart)
