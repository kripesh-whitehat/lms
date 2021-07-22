import _ from 'lodash'
import React, { Component } from 'react'
import DownloadCSV from '../DownloadCSV'
import './AggregateItemsSpendContainer.css'
import AggregateItemsSpendTable from './AggregateItemsSpendTable'

class AggregateItemsSpendContainer extends Component {
  render() {
    const {
      toggleChart,
      handleAggregateItemsSpendTableClick,
      chartType,
      widgets,
      id,
    } = this.props
    const widget = _.find(widgets, { id })
    const gl_name = widget ? widget.gl_name.toLowerCase() : ''

    return (
      <div className="agg-item-spend" style={{ height: '95%' }}>
        <div>
          <div className="agg-item-spend-buttons-container">
            <button
              className="btn btn-small btn-primary"
              onClick={() => toggleChart('ap_vendor_by_gl_location')}
              style={{ margin: '1em' }}
            >
              Show Vendor Spend
            </button>
          </div>
          <div className="agg-item-spend-csv-container">
            <DownloadCSV
              tableSelector=".layout .agg-item-spend .rt-table"
              fileName={`ap_spend_${gl_name}.csv`}
              isReactTable
            />
          </div>
          <div className="clearfix"></div>
        </div>
        <AggregateItemsSpendTable
          onDataClick={handleAggregateItemsSpendTableClick}
          showPagination={!!this.props.fullscreen}
          type={chartType}
          {...this.props}
        />
      </div>
    )
  }
}

export default AggregateItemsSpendContainer
