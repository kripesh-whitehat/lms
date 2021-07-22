import _ from 'lodash'
import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { formatIntoDollars } from 'utils'
import Table from '../Table'

const formatDate = (date) => {
  if (_.isEmpty(date)) return ''
  return moment(date).format('MM/DD/YYYY')
}

class StatsByLocationPerItemTable extends Component {
  constructor(props) {
    super(props)
    this.formatData = this.formatData.bind(this)
  }

  formatData() {
    const { id, reports } = this.props
    const data = reports[id].invoices_by_vendor_gl
    if (_.isEmpty(data)) return []

    return data.map((invoice) => {
      const { amount } = invoice
      return {
        ...invoice,
        amount: parseFloat(amount),
      }
    })
  }

  imageLink(url) {
    if (!url) return <div />
    return (
      <a href={url} target="_blank">
        View Image
      </a>
    )
  }

  render() {
    const columns = [
      {
        Header: 'Invoice Number',
        accessor: 'invoiceNumber',
      },
      {
        Header: 'Invoice Date',
        accessor: 'invoiceDate',
        Cell: (data) => formatDate(data.row.invoiceDate),
      },
      {
        Header: 'Submitted Date',
        accessor: 'submittedDate',
        Cell: (data) => formatDate(data.row.submittedDate),
      },
      {
        Header: 'Check Date',
        accessor: 'checkDate',
        Cell: (data) => formatDate(data.row.checkDate),
      },
      {
        Header: 'Check Number',
        accessor: 'checkNumber',
      },
      {
        Header: 'Terms',
        accessor: 'terms',
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: (data) => (
          <div style={{ textAlign: 'right' }}>
            {formatIntoDollars(data.row.amount)}
          </div>
        ),
      },
      {
        Header: 'Image',
        accessor: 'imageLink',
        Cell: (data) => this.imageLink(data.row.imageLink),
      },
    ]

    const { id, widgets } = this.props
    const widgetName = _.find(widgets, { id }).name
    const { byInvoiceDate } = this.props.widget_settings[widgetName]
    const defaultSort = byInvoiceDate ? 'invoiceDate' : 'submittedDate'

    return (
      <Table
        columns={columns}
        data={this.formatData()}
        onDataClick={this.props.onDataClick}
        defaultSorted={[{ id: defaultSort, desc: false }]}
        defaultPageSize={
          this.props.showPagination ? 20 : this.formatData().length
        }
        showPagination={this.props.showPagination}
        printView={this.props.printView}
      />
    )
  }
}

StatsByLocationPerItemTable.defaultProps = {}

StatsByLocationPerItemTable.propTypes = {}

const mapStateToProps = (state) => ({
  reports: state.reports,
  widget_settings: state.widget_settings,
})

export default connect(mapStateToProps)(StatsByLocationPerItemTable)
