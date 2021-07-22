import _ from 'lodash'
import moment from 'moment'
import React from "react"
import { connect } from 'react-redux'
import ReactTable from "react-table"
import { formatIntoDollars } from 'utils'
import './InvoicesTable.css'

class InvoicesTable extends React.Component {
    formatDate(dateStr){
        if (_.isEmpty(dateStr)){
            return ""
        }
        return moment(new Date(dateStr)).format("MM/DD/YYYY")
    }

    render(){
        const {dataMap, defaultPageSize, byInvoiceDate} = this.props

        const defaultSort = byInvoiceDate ? "invoiceDate" : "ending_week"

        const columns = [
            {
                Header: 'Vendor Name',
                accessor: "name"
            },
            {
                Header: 'Invoice Number',
                accessor: "invoiceNumber"
            },
            {
                Header: 'Invoice Date',
                accessor: "invoiceDate",
                Cell: data => {
                    const {starting_week, ending_week} = data.original
                    const {invoiceDate} = data.row
                    const startDate = new Date(starting_week).getTime()
                    const endDate = new Date(ending_week).getTime()
                    const invDate = new Date(invoiceDate).getTime()

                    if (invDate >= startDate && invDate <= endDate ){
                        return (
                            <div>
                                {this.formatDate(invoiceDate)}
                            </div>
                        )
                    } else {
                        return (
                            <div style={{color: "red", fontWeight: "bolder"}}>
                                {this.formatDate(invoiceDate)}
                            </div>
                        )
                    }
                }
            },
            {
                Header: 'Submitted Date',
                accessor: "ending_week",
                Cell: data => {
                    const {ending_week} = data.row

                    return (
                        <div>
                            {this.formatDate(ending_week)}
                        </div>
                    )
                }
            },
            {
                Header: 'Check Date',
                accessor: "checkDate",
                Cell: data => {
                    const {checkDate} = data.row
                    return (
                        <div style={{ textAlign: "left" }}>
                            {this.formatDate(checkDate)}
                        </div>
                    )
                }
            },
            {
                Header: 'Check Number',
                accessor: "checkNumber"
            },
            {
                Header: 'Amount',
                accessor: "amount",
                Cell: data => {
                    const {amount} = data.row
                    return (
                        <div style={{ textAlign: "right" }}>
                            {formatIntoDollars(amount)}
                        </div>
                    )
                }
            },
            {
                Header: 'Image',
                accessor: "imageLink",
                Cell: data => {
                    const {imageLink} = data.row
                    if (imageLink){
                        return (
                            <div style={{ textAlign: "left" }}>
                                {_.isEmpty(imageLink) ? "" : <a target={"_blank"} href={imageLink}>View Image</a>}
                            </div>
                        )
                    } else {
                        return <div></div>
                    }
                }
            }
        ]

        return (
            <ReactTable
                data={dataMap}
                columns={columns}
                defaultSorted={[
                    {
                        id: defaultSort,
                        asc: true
                    }
                ]}
                defaultPageSize={defaultPageSize}
            />
        )
    }
}

const mapStateToProps = (state) => {
    return {
        byInvoiceDate: state.widget_settings.cost.byInvoiceDate
    }
}

InvoicesTable.defaultProps = {
    dataMap: [],
    defaultPageSize: 10
}

export default connect(mapStateToProps)(InvoicesTable)
