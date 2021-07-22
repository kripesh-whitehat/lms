import _ from 'lodash'
import moment from 'moment'
import React, { Component } from 'react'
import { formatIntoDollars, roundTwo } from 'utils'


class ItemDataTable extends Component {
    constructor(props){
        super(props)
        this.state = {
            qty_dollar: "dollar"
        }
        this.handleRadioChange = this.handleRadioChange.bind(this)
    }

    handleRadioChange(e){
        this.setState({qty_dollar: e.target.value})
    }

    render(){
        const {name, t_id, data, counting_unit} = this.props
        const {qty_dollar} = this.state
        const isDollar = qty_dollar === "dollar"
        const dates = data.map(d => moment(d.ending_week).format("MM/DD"))

        const bi = data.map((d, idx) => <td className={"align-right"} key={`bi-${idx}`}>{isDollar ? formatIntoDollars(d.beg_inv) : roundTwo(d.beg_inv_quantity)}</td>)
        const ei = data.map((d, idx) => <td className={"align-right"} key={`ei-${idx}`}>{isDollar ? formatIntoDollars(d.end_inv) : roundTwo(d.end_inv_quantity)}</td>)
        const purchases = data.map((d, idx) => <td className={"align-right"} key={`purchases-${idx}`}>{isDollar ? formatIntoDollars(d.purchases) : roundTwo(d.purchase_quantity)}</td>)
        const usage = data.map((d, idx) => <td className={"align-right"} key={`usage-${idx}`}>{isDollar ? formatIntoDollars(d.usage) : roundTwo(d.usage_qty)}</td>)

        return (<div className={"item-data-table"}>
            <h4>{name}</h4>
            <div style={{float: "left"}}>
                {!_.isEmpty(counting_unit) &&
                <p>Unit: {counting_unit}</p>
                }
            </div>
            <div style={{float: "right"}} onChange={this.handleRadioChange}>
                <div className={"item-data-table-radio"}>
                    <input type="radio" name={`qty_dollar_${t_id}`} value={"dollar"} defaultChecked={isDollar}/>
                    <label>$</label>
                </div>
                <div className={"item-data-table-radio"}>
                    <input type="radio" name={`qty_dollar_${t_id}`} value={"qty"} defaultChecked={!isDollar}/>
                    <label>Qty</label>
                </div>
            </div>
            <div className={"clearfix"}></div>

            <table className={"table table-striped"} data-title={name}>
                <thead>
                    <tr>
                        <th></th>
                        { dates.map((date, idx) => <th className={"align-right"} key={`date-${idx}`}>{date}</th>) }
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>BI</th>
                        {bi}
                    </tr>
                    <tr>
                        <th>Purchases</th>
                        {purchases}
                    </tr>
                    <tr>
                        <th>EI</th>
                        {ei}
                    </tr>
                    <tr>
                        <th>Usage</th>
                        {usage}
                    </tr>
                </tbody>
            </table>
        </div>)
    }
}

export default ItemDataTable
