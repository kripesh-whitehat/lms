import _ from 'lodash'
import moment from "moment"
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReactTable from "react-table"
import { pushHistory, setChartType } from 'actions'
import { fetchInventoryItemLoc, fetchInvoicesByItem, itemSelectAll, setItems, updateItemCheckbox } from 'actions/CogsActions'
import { formatIntoDollars, roundTwo } from 'utils'

class CogsItemUsageTable extends Component {
    constructor(props){
        super(props)
        this.handleCheckBoxClick = this.handleCheckBoxClick.bind(this)
        this.handleSelectAll = this.handleSelectAll.bind(this)
        this.navigateToInvoicesByItem = this.navigateToInvoicesByItem.bind(this)
        this.navigateToInventoryCountsTable = this.navigateToInventoryCountsTable.bind(this)
    }

    calculateUsage(beginning, purchases, ending){
        beginning = parseFloat(beginning) || 0
        purchases = parseFloat(purchases) || 0
        ending = parseFloat(ending) || 0
        return beginning + purchases - ending
    }

    calculateAverageDollar(purchases, purchasesQty, countingUnit){
        purchases = parseFloat(purchases) || 0
        purchasesQty = parseFloat(purchasesQty) || 0
        let averageDollar = purchases / purchasesQty
        if (_.isNaN(averageDollar)){
            averageDollar = 0
        }
        return formatIntoDollars(averageDollar)
    }

    calculateAverage(purchases, purchasesQty){
        purchases = parseFloat(purchases) || 0
        purchasesQty = parseFloat(purchasesQty) || 0
        let averageDollar = purchases / purchasesQty
        if (_.isNaN(averageDollar)){
            averageDollar = 0
        }
        return averageDollar
    }

    calculateAverageFromBE(begInv, begInvQty, endInv, endInvQty){
        const averageBeginning = this.calculateAverage(begInv, begInvQty)
        const averageEnding = this.calculateAverage(endInv, endInvQty)
        let averageDollar
        if (averageBeginning > 0 && averageEnding > 0){
            averageDollar =  (averageBeginning + averageEnding) / 2
        } else if (averageEnding > 0 && averageBeginning === 0){
            averageDollar = averageEnding
        } else if (averageBeginning > 0 && averageEnding === 0){
            averageDollar = averageBeginning
        } else {
            averageDollar = 0
        }
        return formatIntoDollars(averageDollar)
    }

    componentDidUpdate(prevProps) {
        this.setItems()
    }

    setItems(){
        const itemIds = _.map(this.props.item_level_trend, "t_id")
        this.props.setItems(itemIds)
    }

    handleCheckBoxClick(tId,e){
        this.props.updateItemCheckbox(tId, e.currentTarget.checked)
    }

    handleSelectAll(e){
        this.props.itemSelectAll(e.currentTarget.checked)
    }

    navigateToInvoicesByItem(itemName, itemId){
        this.props.fetchInvoicesByItem({
            itemId: itemId,
            byInvoiceDate: this.props.byInvoiceDate
        })
        this.props.setChartType(this.props.widget_id, "invoices_by_item")
        this.props.pushHistory(this.props.widget_id, "invoices_by_item", itemName)
    }

    navigateToInventoryCountsTable(startingPoint,data){
        const {periodData} = data.original
        if (periodData.length === 0){
            return
        }
        const sortedData = _.sortBy(periodData, (d)=> new Date(d.starting_week).valueOf())
        const point = startingPoint === "beginning" ? _.first(sortedData) :  _.last(sortedData)
        const startDate = moment(new Date(point.starting_week)).format("MM/DD/YYYY")
        const endDate = moment(new Date(point.ending_week)).format("MM/DD/YYYY")

        this.props.fetchInventoryItemLoc(startDate, point.unit_inventory_item_id, this.props.byInvoiceDate)
        this.props.fetchInvoicesByItem({
            startDate: startDate,
            endDate: endDate,
            itemId: point.unit_inventory_item_id,
            byInvoiceDate: this.props.byInvoiceDate
        })
        this.props.setChartType(this.props.widget_id, "inventory_counts_table")
        this.props.pushHistory(this.props.widget_id, "inventory_counts_table", point.item_name)
    }

    render(){
        const {item_level_trend, items_select_all} = this.props
        const dataMap = item_level_trend.map((d)=>{
            const {item_name, beg_inv_quantity, beg_inv, purchase_quantity, purchases, end_inv_quantity,
                end_inv, unit_inventory_item_id, t_id, display, periodData } = d

            let {counting_unit} = d

            const usage_qty = this.calculateUsage(beg_inv_quantity, purchase_quantity, end_inv_quantity)
            const usage = this.calculateUsage(beg_inv, purchases, end_inv)

            if (counting_unit === "undefined"){
                counting_unit = ""
            }

            let average_dollar
            if (purchases === 0 ){
                average_dollar = this.calculateAverageFromBE(beg_inv, beg_inv_quantity, end_inv, end_inv_quantity)
            } else {
                average_dollar = this.calculateAverageDollar(purchases, purchase_quantity)
            }

            return {
                item_name: item_name,
                counting_unit: counting_unit,
                beg_inv_quantity: beg_inv_quantity,
                beg_inv: beg_inv,
                purchase_quantity: purchase_quantity,
                purchases: purchases,
                end_inv_quantity: end_inv_quantity,
                end_inv: end_inv,
                unit_inventory_item_id: unit_inventory_item_id,
                usage_qty: usage_qty,
                usage: usage,
                t_id: t_id,
                display: display,
                average_dollar: average_dollar,
                periodData: periodData
            }
        })
        const columns = [
        {
            Header: <input type="checkbox" checked={items_select_all} onChange={this.handleSelectAll}  />,
            width: 45,
            accessor: "t_id",
            sortable: false,
            Cell: (data)=>{
                return (
                    <div>
                        <input checked={data.original.display} onChange={this.handleCheckBoxClick.bind(null, data.row.t_id)} type={"checkbox"}/>
                    </div>
                )
            }
        },
        {
            Header: 'Item Name',
            accessor: "item_name",
            width: 250
        },
        {
            Header: 'Avg $',
            accessor: "average_dollar",
            Cell: data => (
                <div style={{ textAlign: "right" }}>
                    { data.row.average_dollar }
                </div>
            )
        },
        {
            Header: 'Counting Unit',
            accessor: "counting_unit"
        },
        {
            Header: 'Beginning Inv',
            accessor: "beg_inv_quantity",
            Cell: data => (
                <div style={{ textAlign: "right" }}>
                    <a onClick={this.navigateToInventoryCountsTable.bind(null, "beginning", data)}>
                        { roundTwo(data.row.beg_inv_quantity) }
                    </a>
                </div>
            )

        },
        {
            Header: 'Purchases',
            accessor: "purchase_quantity",
            Cell: data => {
                const {item_name, unit_inventory_item_id} = data.original
                return (
                    <div style={{ textAlign: "right" }}>
                        <a onClick={this.navigateToInvoicesByItem.bind(null, item_name, unit_inventory_item_id)}>
                            { roundTwo(data.row.purchase_quantity) }
                        </a>
                    </div>
                )
            }

        },
        {
            Header: 'Ending Inv',
            accessor: "end_inv_quantity",
            Cell: data => (
                <div style={{ textAlign: "right" }}>
                    <a onClick={this.navigateToInventoryCountsTable.bind(null, "ending",data)}>
                        { roundTwo(data.row.end_inv_quantity) }
                    </a>
                </div>
            )

        },
        {
            Header: 'Usage Quantity',
            accessor: "usage_qty",
            Cell: data => (
                <div style={{ textAlign: "right" }}>
                    { roundTwo(data.row.usage_qty) }
                </div>
            )
        },
        {
            Header: 'Usage $',
            accessor: "usage",
            Cell: data => (
                <div style={{ textAlign: "right" }}>
                    { formatIntoDollars(data.row.usage) }
                </div>
            )
        }
        ]

        return (
            <ReactTable
                showPagination={true}
                defaultPageSize={10}
                data={dataMap}
                columns={columns}
                defaultSorted={[
                    {
                        id: "usage",
                        desc: true
                    }
                ]}
            />
        )
    }
}

const mapStateToProps = (state) => {
    const {cogs} = state

    return {
        currentCogsItemGL: cogs.currentCogsItemGL,
        item_level_trend: cogs.item_level_trend,
        items_select_all: cogs.items_select_all,
        byInvoiceDate: state.widget_settings.cost.byInvoiceDate
    }
}

export default connect(mapStateToProps, {
    setItems,
    updateItemCheckbox,
    itemSelectAll,
    setChartType,
    pushHistory,
    fetchInvoicesByItem,
    fetchInventoryItemLoc
})(CogsItemUsageTable)
