import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReactTable from "react-table"
import { pushHistory, setChartType } from 'actions'
import { fetchInvoicesGL, fetchItemGL, selectAllGLFilters, setGlFilters, updateGLFilters } from 'actions/CogsActions'
import { formatIntoDollars, formatPercent } from 'utils'

let previousUnitId = undefined

class CogsAcrossUnitTable extends Component {
    constructor(props) {
        super(props)
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
        this.handleGLClick = this.handleGLClick.bind(this)
        this.handleInputClick = this.handleInputClick.bind(this)
        this.navigateToAPSpend = this.navigateToAPSpend.bind(this)
        this.handleSelectAll = this.handleSelectAll.bind(this)
        this.state = {
            inputLastClick: undefined
        }
    }

    handleCheckboxChange(glCode, e){
        this.props.updateGLFilters(parseInt(glCode, 10), e.currentTarget.checked)
    }

    handleGLClick(glName, glCode){
        this.props.setChartType(this.props.widget_id, "cogs_across_unit_trend")
        this.props.pushHistory(this.props.widget_id, "cogs_across_unit_trend", glName)
        this.props.fetchItemGL(glName, glCode, false, this.props.byInvoiceDate)
    }

    navigateToAPSpend(glCode){
        this.props.fetchInvoicesGL(glCode, this.props.byInvoiceDate)
        this.props.setChartType(this.props.widget_id, "ap_spend_table")
        this.props.pushHistory(this.props.widget_id, "ap_spend_table", glCode)
    }

    componentDidMount(){
        this.setGLs()
    }


    setGLs(){
        let {glFilters, unitId} = this.props
        if (glFilters.length > 0 && unitId === previousUnitId){
        } else {
            previousUnitId = unitId
            glFilters = _.map(this.props.data, (d)=>{
                return parseInt(d.gl_code, 10)
            })
            this.props.setGlFilters(glFilters)
        }
    }

    //todo: Handle Shift Click FN
    handleInputClick(glName, e){
        this.setState({inputLastClick: e.currentTarget})
        if (e.shiftKey){
            if (e.currentTarget.checked){

            } else {

            }
        }
    }

    handleSelectAll(e){
        this.props.selectAllGLFilters(e.currentTarget.checked)
    }

    render() {
        const {selectAll} = this.props
        const columns = [
        {
            Header: <input type="checkbox" checked={selectAll} onChange={this.handleSelectAll}  />,
            width: 45,
            sortable: false,
            Cell: (data)=>{
                const {gl_code} = data.original
                const {gl_name} = data.row
                const isChecked = this.props.glFilters.map((glCode)=> parseInt(glCode, 10)).includes(parseInt(gl_code, 10))
                return (
                    <div>
                        <input className={"gl-input-checkbox"}
                            checked={isChecked}
                            onChange={this.handleCheckboxChange.bind(null, gl_code)}
                            onClick={this.handleInputClick.bind(null, gl_name)}
                            type={"checkbox"}/>
                    </div>
                )
            }
        },
        {
            Header: 'GL Name',
            accessor: "gl_name"
        },
        {
            Header: 'Beginning Inventory',
            accessor: "beg_inv",
            Cell: data => {
                const {gl_name} = data.row
                const {gl_code} = data.original

                return (
                    <div style={{ textAlign: "right" }}>
                        <a data-gl_code={gl_code} onClick={this.handleGLClick.bind(null, gl_name, gl_code)}>
                            { formatIntoDollars(data.row.beg_inv) }
                        </a>
                    </div>
                )
            }
        },
        {
            Header: 'Purchases',
            accessor: "purchases",
            Cell: data => {
                const {gl_code} = data.original
                return (
                    <div style={{ textAlign: "right" }}>
                        <a onClick={this.navigateToAPSpend.bind(null, gl_code)}>
                            { formatIntoDollars(data.row.purchases) }
                        </a>
                    </div>
                )
            }
        },
        {
            Header: 'Ending Inventory',
            accessor: "end_inv",
            Cell: data => {
                const {gl_name} = data.row
                const {gl_code} = data.original
                return (
                    <div style={{ textAlign: "right" }}>
                        <a data-gl_code={gl_code} onClick={this.handleGLClick.bind(null, gl_name, gl_code)}>
                            { formatIntoDollars(data.row.end_inv) }
                        </a>
                    </div>
                )
            }
        },
        {
            Header: 'Usage',
            accessor: 'cost',
            Cell: data => (
                <div style={{ textAlign: "right" }}>
                    { formatIntoDollars(data.row.cost) }
                </div>
            )
        },
        {
            Header: 'Cost %',
            maxWidth: 80,
            accessor: 'percent',
            Cell: data => (
                <div style={{ textAlign: "right" }}>
                    { formatPercent(data.row.percent) }
                </div>
            )
        }];

        const dataMap = this.props.data.map((d)=>{
            const {gl_name, gl_code, beg_inv, purchases, end_inv, cost, percent} = d
            return {
                gl_name: gl_name,
                gl_code: gl_code,
                beg_inv: beg_inv,
                purchases: purchases,
                end_inv: end_inv,
                cost: cost,
                percent: percent
            }
        })

        return (
            <ReactTable
                showPagination={true}
                data={dataMap}
                defaultPageSize={10}
                columns={columns}
                defaultSorted={[
                    {
                        id: "gl_name",
                        asc: true
                    }
                ]}
            />
        )
    }
}

const mapStateToProps = state => {
    return {
        reports: state.reports,
        glFilters: state.cogs.glFilters,
        selectAll: state.cogs.glFilterSelectAll,
        unitId: state.dashboard.activeWidget.unit_id,
        byInvoiceDate: state.widget_settings.cost.byInvoiceDate
    }
}

export default connect(mapStateToProps, {
    setGlFilters,
    updateGLFilters,
    pushHistory,
    setChartType,
    fetchItemGL,
    fetchInvoicesGL,
    selectAllGLFilters
})(CogsAcrossUnitTable)
