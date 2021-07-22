import annotations from 'highcharts/modules/annotations'
import _ from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'styles/SpendByWeek.css'
import { formatIntoDollars } from 'utils'
import ChartWrapper from '../ChartWrapper'

function buildConfig(data) {
  if (_.isEmpty(data)) {
    data = []
  }
  const vendors = data.map((d) => moment(d.starting_week).format('MM/DD/YYYY'))
  const amountData = data.map((d) => ({ y: d.amount, id: d.starting_week }))
  const labels = data
    .filter((d) => !d.complete)
    .map((d) => ({
      point: d.starting_week,
      text: 'Partial Week',
      style: { fontSize: '9px' },
    }))

  const chartConfig = {
    chart: {
      type: 'column',
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: vendors,
      title: {
        text: null,
      },
    },
    yAxis: {
      labels: {
        overflow: 'justify',
      },
      title: {
        text: 'Amount ($)',
      },
    },
    tooltip: {
      enabled: true,
      formatter() {
        return formatIntoDollars(this.y)
      },
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
        },
      },
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name: 'Vendors',
        data: amountData,
        // dataLabels: {
        //     enabled: true,
        //     formatter: function () {
        //       return formatIntoDollars(this.y)
        //    }
        // }
      },
    ],
    annotations: [{ labels }],
  }

  return chartConfig
}
class SpendByWeek extends Component {
  render() {
    const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']
    const { reports, id, type } = this.props
    const { weeks } = reports[id][type]
    return (
      <div className="spend-by-week">
        <div className="sum">
          Total: {formatIntoDollars(reports[id][type].sum || 0)}
        </div>
        <ChartWrapper
          dataIsPresent={
            !_.isEmpty(reports[id][type]) && weeks && weeks.length > 0
          }
          config={buildConfig(weeks)}
          modules={[annotations]}
          theme={theme}
          {...this.props}
        />
      </div>
    )
  }
}

SpendByWeek.defaultProps = {
  widthRatio: 0.7,
  heightRatio: 0.7,
}

SpendByWeek.propTypes = {
  container: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(SpendByWeek)
