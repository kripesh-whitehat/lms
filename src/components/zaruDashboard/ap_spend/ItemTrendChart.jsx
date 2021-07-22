import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import DownloadCSV from "../DownloadCSV"
import Stats from '../Stats'
import ItemDataTable from './ItemDataTable'
import './ItemTrendChart.css'
import ItemTrendChartByDate from './ItemTrendChartByDate'

class ItemTrendChart extends Component {

  generateItems(trendBy){
      const { reports, id } = this.props
      const { item_trend_report } = reports[id]
      if (_.isEmpty(item_trend_report)) return []
      const byDate = {}
      let sortedItems = _.sortBy(item_trend_report.items, (item)=>{
          return Date.parse(new Date(item[trendBy]))
      })
      sortedItems.forEach((d) => {
          const {date, submittedDate} = d
          const queryKey = trendBy === "invoice_date" ? date : submittedDate
          if (byDate[queryKey]) {
              const average = byDate[queryKey]
              const numItems = average.numItems + 1
              const total_qty = parseFloat(average.total_qty) + parseFloat(d.qty)
              const total_rate = parseFloat(average.total_rate) + parseFloat(d.rate)
              byDate[queryKey] = {
                  ...average,
                  total_qty,
                  total_rate,
                  qty: (total_qty / numItems),
                  rate: (total_rate / numItems),
                  isAverage: true,
                  numItems
              }
          } else {
              byDate[queryKey] = {
                  ...d,
                  total_qty: parseFloat(d.qty),
                  total_rate: parseFloat(d.rate),
                  numItems: 1,
                  date: date,
                  submittedDate: submittedDate
              }
          }
      })
      let items = Object.values(byDate).map( item => {
          const {submittedDate, date} = item
          const queryKey = trendBy === "invoice_date" ? date : submittedDate
          return ({
              x: Date.parse(queryKey),
              y: parseFloat(item.rate),
              date: date,
              submittedDate: submittedDate,
              className: _.isEmpty(item.imageLink) ? 'no-pointer' : '',
              ...item
          })
      })
      items = _.sortBy(items, 'x')
      return items
  }

  render() {
    const { id, type, reports, trend_by, item_name } = this.props
    const downloadName = item_name.replace(/[^\w\s]/gi, '').split(" ").join("_").toLowerCase()
    const data = reports[id][type]
    const items = data ? data.items : []
      return (
      <div>
          <div className={"ap-spend-download-csv-container"}>
              <DownloadCSV tableSelector={".layout .ap-spend-item-data-table .rt-table"}
                           fileName={`${downloadName}.csv`}
                           isReactTable={true}
              />
          </div>
          <div className="clearfix"></div>
          <ItemTrendChartByDate
              trend_by={trend_by}
              items={this.generateItems(trend_by)}
              item_name={item_name}
          />
          <p className={"disclaimer"}>
              Disclaimer: When looking for item price detail run report by invoice date.
          </p>
          <Stats ratesAndDates={items} />
          <div className={"ap-spend-item-data-table"}>
              <ItemDataTable items={items} trend_by={trend_by}/>
          </div>
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
  const { reports, ap_spend } = state
  return {
      reports,
      trend_by: ap_spend.trend_by
  }
}


export default connect(mapStateToProps, { })(ItemTrendChart)
