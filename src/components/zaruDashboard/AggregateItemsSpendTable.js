import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'styles/AggregateItemsSpendTable.css'
import { formatIntoDollars, formatPercent } from 'utils'
import Table from '../Table'

class AggregateItemsSpendTable extends Component {
  constructor(props) {
    super(props)
    this.parseTableData = this.parseTableData.bind(this)
  }

  parseTableData() {
    const reportData =
      this.props.reports[this.props.id].aggregate_item_spend || []
    return reportData.map((d) => ({
      inventory_item_id: d.product_id,
      vendor_name: d.vendor,
      item_name: d.product_name,
      item_rate: parseFloat(d.rate),
      item_spend: parseFloat(d.total_spend),
      percent_change: parseFloat(d.price_change),
    }))
  }

  render() {
    const columns = [
      {
        Header: 'Vendor Name',
        accessor: 'vendor_name',
      },
      {
        Header: 'Item Name',
        accessor: 'item_name',
      },
      {
        Header: 'Item Rate',
        accessor: 'item_rate',
        Cell: (data) => (
          <div style={{ textAlign: 'right' }}>
            {formatIntoDollars(data.row.item_rate)}
          </div>
        ),
      },
      {
        Header: 'Total Spend',
        accessor: 'item_spend',
        Cell: (data) => (
          <div style={{ textAlign: 'right' }}>
            {formatIntoDollars(data.row.item_spend)}
          </div>
        ),
      },
      {
        Header: 'Percent Change',
        accessor: 'percent_change',
        Cell: (data) => (
          <div style={{ textAlign: 'right' }}>
            {formatPercent(data.row.percent_change)}
          </div>
        ),
      },
    ]

    return (
      <Table
        columns={columns}
        data={this.parseTableData()}
        reports={this.props.reports[this.props.id].aggregate_item_spend}
        onDataClick={this.props.onDataClick}
        emptyDataMessage="No Itemized Invoices"
        defaultPageSize={
          this.props.showPagination ? 20 : this.parseTableData().length
        }
        showPagination={this.props.showPagination}
        heightRatio={this.props.showPagination ? null : 0.7}
      />
    )
  }
}

AggregateItemsSpendTable.propTypes = {}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(AggregateItemsSpendTable)
