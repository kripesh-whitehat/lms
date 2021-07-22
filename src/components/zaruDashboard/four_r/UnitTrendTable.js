import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { formatIntoDollars } from 'utils'
import Table from '../Table'

class UnitTrendTable extends Component {
  render() {
    const columns = [
      {
        Header: 'Week Ending',
        accessor: 'EndDate',
        Cell: (d) =>
          moment(Date.parse(d.original.EndDate)).format('MM/DD/YYYY'),
      },
      {
        Header: 'Quantity Sold',
        accessor: 'QuantitySold',
        Cell: (row) => (
          <div style={{ textAlign: 'right' }}>
            {row.original.QuantitySold || 0}
          </div>
        ),
      },
      {
        Header: 'Sale Price',
        id: 'salePrice',
        accessor: (d) => (d.PurchasePrice ? d.PurchasePrice.Value : 0),
        Cell: (row) => (
          <div style={{ textAlign: 'right' }}>
            {formatIntoDollars(
              row.original.PurchasePrice ? row.original.PurchasePrice.Value : 0,
            )}
          </div>
        ),
      },
      {
        Header: 'Net Sales',
        id: 'netSales',
        accessor: (d) => (d.GrossPrice ? d.GrossPrice.Value : 0),
        Cell: (row) => (
          <div style={{ textAlign: 'right' }}>
            {formatIntoDollars(
              row.original.GrossPrice ? row.original.GrossPrice.Value : 0,
            )}
          </div>
        ),
      },
      {
        Header: 'Margin $/Item',
        id: 'marginDollar',
        accessor: (d) => (d.MarginDollars ? d.MarginDollars.Value : 0),
        Cell: (row) => (
          <div style={{ textAlign: 'right' }}>
            {row.original.MarginDollars
              ? row.original.MarginDollars.FormattedValue
              : 0}
          </div>
        ),
      },
      {
        Header: 'Margin %/Item',
        id: 'marginPercent',
        accessor: (d) => (d.MarginPercent ? d.MarginPercent.Value : 0),
        Cell: (row) => (
          <div style={{ textAlign: 'right' }}>
            {row.original.MarginPercent
              ? row.original.MarginPercent.FormattedValue
              : 0}
          </div>
        ),
      },
    ]

    return (
      <Table
        columns={columns}
        data={this.props.data}
        defaultPageSize={13}
        showPagination={false}
        {...this.props}
      />
    )
  }
}

UnitTrendTable.defaultProps = {}

UnitTrendTable.propTypes = {}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(UnitTrendTable)
