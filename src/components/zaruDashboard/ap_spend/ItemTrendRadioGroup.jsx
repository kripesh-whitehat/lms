import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setDefaultTrendBy } from "actions/APSpendActions"
import "./ItemTrendRadioGroup.css"

class ItemTrendRadioGroup extends Component {
    constructor(){
        super()
        this.handleSwitchTrendChange = this.handleSwitchTrendChange.bind(this)
    }

    handleSwitchTrendChange(trendBy){
        this.props.setDefaultTrendBy(trendBy)
    }

    render(){
        const { trend_by } = this.props
        return (<div className={"item-trend-radio-container"}>
            <div className={"item-radio-group"}>
                <input
                    type="radio"
                    checked={trend_by === "invoice_date"}
                    onChange={this.handleSwitchTrendChange.bind(null, "invoice_date")}
                />
                <label>Invoice Date</label>
            </div>
            <div className={"item-radio-group"}>
                <input
                    type="radio"
                    checked={trend_by === "submitted_date"}
                    onChange={this.handleSwitchTrendChange.bind(null, "submitted_date")}
                />
                <label>Submitted Date</label>
            </div>
        </div>)
    }
}

const mapStateToProps = (state) => {
    return {
        trend_by: state.ap_spend.trend_by
    }
}

export default connect(mapStateToProps, {setDefaultTrendBy})(ItemTrendRadioGroup)