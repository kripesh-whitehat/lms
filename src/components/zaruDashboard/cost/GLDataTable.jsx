import React, { Component } from 'react'
import "./GLDataTable.css"

const toRow = (label, data) => {
    return data.map((val, idx) => <td key={`${label}_${idx}`} className={"align-right"}>{val}</td>)
}

class GLDataTable extends Component {
    render(){
        const {name, data, gl_code} = this.props
        const dates = data.map(d => d.ending_week).map((val, idx) => <th key={`date-${idx}`} className={"align-right"}>{val}</th>)
        const bi = toRow("bi", data.map(d => d.beg_inv))
        const purchases = toRow("purchases", data.map(d => d.purchases))
        const ei = toRow("ei", data.map(d => d.end_inv))
        const cost_percent = toRow("cost_percent", data.map(d => d.cost))
        const usage = toRow("usage", data.map(d => d.usage))

        return (<div className={"gl-tabular-item"}>
            <h4>{name} ({gl_code})</h4>
            <table className={"table table-striped"} data-title={name}>
                <thead>
                    <tr>
                        <th></th>
                        {dates}
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
                        <th>Cost %</th>
                        {cost_percent}
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

export default GLDataTable
