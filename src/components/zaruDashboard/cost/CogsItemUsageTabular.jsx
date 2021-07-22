import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { calculateUsage, dateToUTC, formatName } from "utils";
import DownloadCSV from '../DownloadCSV';
import "./CogsItemUsageTabular.css";
import ItemDataTable from "./ItemDataTable";

class CogsItemUsageTabular extends Component {
    render(){
        const {item_level_trend, group_name} = this.props
        let seriesMap = item_level_trend.map((d)=>{
            const {periodData, item_name, t_id, display, showInLegend } = d
            let {counting_unit} = d
            const data = periodData.map((pd)=>{
                const {
                    starting_week,
                    ending_week,
                    beg_inv,
                    beg_inv_quantity,
                    purchases,
                    purchase_quantity,
                    end_inv,
                    end_inv_quantity,
                    unit_inventory_item_id,
                    item_name
                } = pd

                let {counting_unit} = pd

                const usage_qty = calculateUsage(beg_inv_quantity, purchase_quantity, end_inv_quantity)
                const usage = calculateUsage(beg_inv, purchases, end_inv)

                if (counting_unit === "undefined"){
                    counting_unit = ""
                }

                const x = dateToUTC(ending_week)

                return {
                    x: x,
                    y: usage_qty,
                    unit_inventory_item_id: unit_inventory_item_id,
                    starting_week: starting_week,
                    ending_week: ending_week,
                    item_name: item_name,
                    usage: usage,
                    usage_qty: usage_qty,
                    beg_inv:beg_inv,
                    beg_inv_quantity: beg_inv_quantity,
                    purchases: purchases,
                    purchase_quantity: purchase_quantity,
                    end_inv:end_inv,
                    end_inv_quantity: end_inv_quantity,
                    counting_unit: counting_unit,
                    t_id: t_id
                }
            })

            if (counting_unit === "undefined"){
                counting_unit = ""
            }

            return {
                name: item_name,
                data: data,
                t_id: t_id,
                visible: display,
                showInLegend: showInLegend,
                counting_unit: counting_unit
            }
        })
        seriesMap = _.sortBy(seriesMap, 'name')
        const items = seriesMap.filter(d => d.visible).map((series)=>{
            const {name, t_id, data, counting_unit} = series
            return (<div key={t_id} className={"items-usage-tabular-item"}>
                <ItemDataTable name={name} t_id={t_id} data={data} counting_unit={counting_unit}/>
            </div>)
        })

        return (<div className={"item-usage-tabular-container"}>
            {items.length > 0 && <div>
                <DownloadCSV style={{marginTop: "1em", float: "right", marginRight: "2%"}}
                             tableSelector={".backdrop .item-data-table table"}
                             fileName={`${formatName(group_name)}_item_usage.csv`}
                />
                <div className="clearfix"></div>
            </div>}
            {items}
        </div>)
    }
}

const mapStateToProps = (state) => {
    const {cogs} = state
    return {
        group_name: state.company.group_name,
        item_level_trend: cogs.item_level_trend,
    }
}

export default connect(mapStateToProps, {})(CogsItemUsageTabular)
