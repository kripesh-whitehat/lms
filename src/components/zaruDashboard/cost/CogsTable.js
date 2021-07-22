import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { formatIntoDollars, formatPercent } from 'utils'
import Table from '../Table'

class CogsTable extends Component {
  constructor(props) {
    super(props)
    this.formatData = this.formatData.bind(this)
  }

  formatData() {
    const { data } = this.props
    if (_.isEmpty(data)) return []

    return data.map((invoice) => {
      const { amount } = invoice
      return {
        ...invoice,
        amount: parseFloat(amount),
      }
    })
  }

  render() {
    const columns = [
      {
        Header: 'GL Name',
        accessor: 'gl_name',
        minWidth: 175,
      },
      {
        Header: 'Beginning Inventory',
        accessor: 'beg_inv',
        Cell: (data) => (
          <div style={{ textAlign: 'right' }}>
            {formatIntoDollars(data.row.beg_inv)}
          </div>
        ),
      },
      {
        Header: 'Purchases',
        accessor: 'purchases',
        Cell: (data) => (
          <div style={{ textAlign: 'right' }}>
            {formatIntoDollars(data.row.purchases)}
          </div>
        ),
      },
      {
        Header: 'Ending Inventory',
        accessor: 'end_inv',
        Cell: (data) => (
          <div style={{ textAlign: 'right' }}>
            {formatIntoDollars(data.row.end_inv)}
          </div>
        ),
      },
      {
        Header: 'Usage',
        accessor: 'cost',
        Cell: (data) => (
          <div style={{ textAlign: 'right' }}>
            {formatIntoDollars(data.row.cost)}
          </div>
        ),
      },
      {
        Header: 'Cost %',
        accessor: 'percent',
        maxWidth: 80,
        Cell: (data) => (
          <div style={{ textAlign: 'right' }}>
            {formatPercent(data.row.percent)}
          </div>
        ),
      },
    ]

    return (
      <Table
        showPagination={false}
        columns={columns}
        data={this.formatData()}
        printView={this.props.printView}
      />
    )
  }
}

CogsTable.defaultProps = {}

CogsTable.propTypes = {}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(CogsTable)
