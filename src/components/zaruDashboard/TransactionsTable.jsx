import React, { Component } from 'react'
import { connect } from 'react-redux'
import Table from './Table'

class TransactionsTable extends Component {
  constructor(props) {
    super(props)
  }


  render() {
    const { id, type, reports } = this.props
    const { items } = reports[id][type]
    const columns = [{
      Header: 'vendor id',
      accessor: 'vendor_id'
    },
    {
      Header: 'Rate',
      accessor: 'rate'
    },{
      Header: ' Name',
      accessor: 'name'
    },{
      Header: 'Invoice Number',
      accessor: 'invoice_number'
    },{
      Header: 'Date',
      accessor: 'invoice_date'
    },{
      Header: 'Quantity',
      accessor: 'qty'
    },{
      Header: 'Amount',
      accessor: 'amount'
    }]


  return (
      <Table
        columns={columns}
        data={items}
        onDataClick={this.props.onDataClick}
      />
    )
  }
}

TransactionsTable.defaultProps = {
}

TransactionsTable.propTypes = {
}

const mapStateToProps = state => {
  return { reports: state.reports }
}

export default connect(mapStateToProps)(TransactionsTable)
