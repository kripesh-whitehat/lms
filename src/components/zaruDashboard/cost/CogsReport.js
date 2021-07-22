import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'styles/CogsReport.css'
import ChartWrapper from '../ChartWrapper'
import CogsTable from './CogsTable'

function buildConfig(report, clickable) {
  if (!report) return {}
  const data = report.map((subcat) => ({
    x: subcat.gl_name,
    y: parseFloat(subcat.percent),
    className: clickable ? '' : 'no-pointer',
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
    tooltip: {
      enabled: true,
      formatter() {
        return `${this.point.x}<br>${this.y}%`
      },
    },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          formatter() {
            return `${this.point.x}<br>${this.y}%`
          },
        },
      },
    },
    series,
  }

  return chartConfig
}
class CogsReport extends Component {
  render() {
    const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']
    const { data, printView } = this.props
    const clickable = _.isEmpty(this.props.onDataClick)
    return (
      <div>
        <ChartWrapper
          dataIsPresent={!_.isEmpty(data)}
          config={buildConfig(data, clickable)}
          modules={[]}
          theme={theme}
          fullscreenHeightRatio={0.6}
          {...this.props}
        />
        <div className={printView ? '' : 'cogs-table-container'}>
          <CogsTable printView={printView} data={data} />
        </div>
      </div>
    )
  }
}

CogsReport.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.7,
}

CogsReport.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(CogsReport)
