import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReactTable from "react-table"
import { pushHistory, setChartType } from 'actions'
import { formatIntoDollars } from 'utils'

class InventoryCountsTable extends Component {
    render(){
        const { item_inventory_level_by_location } = this.props
        const dataMap = item_inventory_level_by_location.map((d)=>{
            const {starting_week, inv_location, unit_inventory_item_id, counting_unit, end_inv_quantity, end_inv} = d
            return {
                starting_week: starting_week,
                unit_inventory_item_id: unit_inventory_item_id,
                inv_location: inv_location,
                counting_unit: counting_unit,
                end_inv_quantity: end_inv_quantity,
                end_inv: end_inv
            }
        })
        const columns = [
            {
                Header: 'Location Name',
                accessor: "inv_location"
            },
            {
                Header: 'Unit',
                accessor: "counting_unit",
                Cell: (data)=>{
                    return (
                        <div>
                            {data.row.counting_unit}
                        </div>
                    )
                }
            },
            {
                Header: 'Qty',
                accessor: "end_inv_quantity",
                Cell: (data)=>{
                    return (
                        <div style={{ textAlign: "right" }}>
                            {data.row.end_inv_quantity}
                        </div>
                    )
                }
            },
            {
                Header: 'Item Price',
                accessor: "end_inv",
                Cell: (data)=>{
                    const {end_inv, end_inv_quantity} = data.original
                    let itemPrice = parseFloat(end_inv / end_inv_quantity)
                    if (_.isNaN(itemPrice)){
                        itemPrice = 0
                    }
                    itemPrice = formatIntoDollars(itemPrice)
                    return (
                        <div style={{ textAlign: "right" }}>
                            {itemPrice}
                        </div>
                    )
                }
            },
            {
                Header: 'Total',
                accessor: "end_inv",
                Cell: (data)=>{
                    return (
                        <div style={{ textAlign: "right" }}>
                            {formatIntoDollars(data.row.end_inv)}
                        </div>
                    )
                }
            }
        ]
        return (
            <div className={"inventory-counts-table-container"}>
                <div className={"title"}>
                    <h4>Inventory Counts</h4>
                </div>
                <ReactTable
                    data={dataMap}
                    columns={columns}
                    defaultPageSize={5}
                />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        item_inventory_level_by_location: state.cogs.item_inventory_level_by_location
    }
}

export default connect(mapStateToProps, {setChartType, pushHistory})(InventoryCountsTable)