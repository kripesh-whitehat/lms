import _ from 'lodash'
import moment from 'moment'
import React from 'react'
import ReactTable from 'react-table'
import { formatIntoDollars } from 'utils'

class ItemDataTable extends React.Component {
  formatDate(dateStr) {
    if (_.isEmpty(dateStr)) {
      return ''
    }
    return moment(new Date(dateStr)).format('MM/DD/YYYY')
  }

  render() {
    const { trend_by } = this.props
    const dataMap = this.props.items.map((item) => {
      const { rate, qty } = item
      let totalSpend = 0
      if (rate && qty) {
        totalSpend = rate * qty
      }
      return { ...item, totalSpend: totalSpend }
    })
    const columns = [
      {
        Header: 'Vendor Name',
        accessor: 'vendor',
        width: 200,
      },
      {
        Header: 'Item Name',
        accessor: 'product_name',
        width: 275,
      },
      {
        Header: 'Rate',
        accessor: 'rate',
        width: 125,
        Cell: (data) => {
          const { rate } = data.row
          return (
            <div style={{ textAlign: 'right' }}>{formatIntoDollars(rate)}</div>
          )
        },
      },
      {
        Header: 'Total Spend',
        accessor: 'totalSpend',
        width: 125,
        Cell: (data) => {
          const { totalSpend } = data.row
          return (
            <div style={{ textAlign: 'right' }}>
              {formatIntoDollars(totalSpend)}
            </div>
          )
        },
      },
      {
        Header: 'Invoice Date',
        accessor: 'date',
        //todo: Verify Red Logic
        Cell: (data) => {
          let { date } = data.row
          return <div>{this.formatDate(date)}</div>
        },
      },
      {
        Header: 'Submitted Date',
        accessor: 'submittedDate',
        Cell: (data) => {
          const { submittedDate } = data.row
          return <div>{this.formatDate(submittedDate)}</div>
        },
      },
      {
        Header: 'Image',
        accessor: 'imageLink',
        Cell: (data) => {
          const { imageLink } = data.row
          if (imageLink) {
            return (
              <div style={{ textAlign: 'left' }}>
                {_.isEmpty(imageLink) ? (
                  ''
                ) : (
                  <a target={'_blank'} href={imageLink}>
                    View Image
                  </a>
                )}
              </div>
            )
          } else {
            return <div></div>
          }
        },
      },
    ]
    return (
      <ReactTable
        data={dataMap}
        columns={columns}
        defaultPageSize={20}
        defaultSorted={[
          {
            id: trend_by === 'invoice_date' ? 'date' : 'submittedDate',
            asc: true,
          },
        ]}
      />
    )
  }
}

export default ItemDataTable
