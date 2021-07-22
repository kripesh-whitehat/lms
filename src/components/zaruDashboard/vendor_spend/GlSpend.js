import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { formatIntoDollars } from 'utils'
import ChartWrapper from '../ChartWrapper'

function buildConfig(report, fromByUnitChart) {
  if (!report) return {}
  const data = report.map((subcat) => ({
    x: subcat.gl_name,
    y: parseFloat(subcat.amount),
    locations: subcat.locations,
  }))
  const series = [
    {
      name: 'GL Spend',
      colorByPoint: true,
      data: data.sort((a, b) => a.y - b.y),
    },
  ]

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
      pie: {
        dataLabels: {
          enabled: true,
          formatter() {
            return `${this.point.x}<br>${formatIntoDollars(this.y)}`
          },
        },
      },
    },

    tooltip: {
      formatter() {
        if (!fromByUnitChart) {
          return (
            `<b>${this.point.x}</b>` +
            `<br>${formatIntoDollars(
              this.y,
            )}<br><b>Units</b><br>${this.point.locations
              .map(
                (l) =>
                  `<span>#${l.unit_id} ${l.name}   ${
                    formatIntoDollars(l.amount) || ''
                  }</span>`,
              )
              .join('<br>')}`
          )
        }
        return `<b>${this.point.x}</b>` + `<br>${formatIntoDollars(this.y)}`
      },
    },
    series,
  }

  return chartConfig
}
class GlSpend extends Component {
  render() {
    const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']
    const { reports, id, type, fromByUnit } = this.props
    const report = reports[id][type]
    return (
      <ChartWrapper
        dataIsPresent={!_.isEmpty(reports[id][type])}
        config={buildConfig(report, fromByUnit)}
        modules={[]}
        theme={theme}
        {...this.props}
      />
    )
  }
}

GlSpend.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.7,
}

GlSpend.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(GlSpend)
