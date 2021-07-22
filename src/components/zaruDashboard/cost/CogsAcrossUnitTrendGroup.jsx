import Highcharts from 'highcharts'
import _ from 'lodash'
import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { pushHistory, setChartType } from 'actions'
import { fetchItemGL, updateGLFilters } from 'actions/CogsActions'
import { formatIntoDollars } from 'utils'
import CogsAcrossUnitTabularGroup from "./CogsAcrossUnitTabularGroup"
import './CogsAcrossUnitTrendGroup.css'


const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']

const formatPercent = (value) => {
    const floatValue = parseFloat(value) || 0
    return `${floatValue.toFixed(2)}%`
}

class CogsAcrossUnitTrendGroup extends Component{
    constructor(props){
        super(props)
        this.state = {
            displayType: "chart"
        }
    }

    componentDidUpdate(prevProps, prevState){
        if (!_.isEqual(prevProps.currentGL,this.props.currentGL)){
            this.updateDisplay()
        }
        if (this.state.displayType === "chart"){
            if (prevProps.selectAll !== this.props.selectAll ||
                prevProps.cost_trend_unit_group_by_gl.length !== this.props.cost_trend_unit_group_by_gl.length ||
                prevProps.sidebarOpen !== this.props.sidebarOpen || (prevState.displayType !== this.state.displayType)
            ){
                this.updateChart()
            }
        }
    }

    updateDisplay(){
        const {gl_code, display} = this.props.currentGL
        if (gl_code){
            const selSeries = _.find(this.chart.series, (s)=>{
                return s.userOptions.gl_code === gl_code
            })
            if (selSeries){
                if (display){
                    selSeries.update({showInLegend: true, visible: true}, true)
                } else {
                    selSeries.update({showInLegend: false, visible: false}, true)
                }
            }
        }
    }

    updateChart(){
        const {isLoading} = this.props
        if (isLoading){
            return
        }
        Highcharts.theme = { colors: theme }
        const {cost_trend_unit_group_by_gl, glFilters} = this.props
        const data = _.groupBy(cost_trend_unit_group_by_gl, 'gl_name')

        let seriesMap = _.map(data, (values, key)=>{
            let group_gl_code = ""
            let data = values.map((value)=>{
                const {starting_week, percent, beg_inv, purchases, end_inv, cost, gl_code} = value
                group_gl_code = gl_code
                let ending_week = moment(starting_week).add(6, 'days').startOf('day')
                const x = Date.UTC(ending_week.year(),ending_week.month(), ending_week.date())
                return {
                    x: x,
                    y: percent,
                    ending_week: ending_week.format('MM/DD/YYYY'),
                    beg_inv: formatIntoDollars(beg_inv),
                    purchases: formatIntoDollars(purchases),
                    end_inv: formatIntoDollars(end_inv),
                    usage: formatIntoDollars(cost),
                    cost: formatPercent(percent),
                    gl_code: gl_code
                }
            })
            data = _.sortBy(data, 'x')
            const isVisible = glFilters.includes(group_gl_code)
            return {
                name: key,
                data: data,
                visible: isVisible,
                gl_code: group_gl_code,
                showInLegend: isVisible,
                pointInterval: 24 * 3600 * 1000 * 7
            }
        })
        seriesMap = _.sortBy(seriesMap, 'name')
        this.chart = Highcharts.chart(this.cogsAcrossUnitTrendGroup, {
            title: {
                text: 'COGS Trend'
            },
            yAxis: {
                title: {
                    text: 'Percent %'
                }
            },
            xAxis: {
                type: 'datetime',
                startOfWeek: 0,
                tickInterval: 24 * 3600 * 1000 * 7,
                tickmarkPlacement: 'on'
            },
            legend: {
                layout: 'horizontal',
                align: 'center',
                enabled: false,
                itemStyle: {
                    cursor: 'default'
                },
                itemHoverStyle: {
                    cursor: 'default'
                }
            },
            tooltip : {
                formatter: function () {
                    return `<div><b>${this.series.name}</b><br/></div>` +
                        `<div>Week Ending: ${this.point.ending_week}<br/></div>` +
                        `<div>BI: ${this.point.beg_inv}<br/></div>` +
                        `<div>Purchases: ${this.point.purchases}<br/></div>` +
                        `<div>EI: ${this.point.end_inv}<br/></div>` +
                        `<div>Cost %: ${this.point.cost}<br/></div>` +
                        `<div>Usage: ${this.point.usage}<br/></div>`
                }
            },
            plotOptions: {
                series: {
                    pointIntervalUnit: 'week',
                    label: {
                        connectorAllowed: false
                    },
                    events: {
                        click: (e)=>{
                            const glName = e.point.series.name
                            const glCode = e.point.gl_code
                            this.props.setChartType(this.props.widget_id, "cogs_across_unit_trend")
                            this.props.pushHistory(this.props.widget_id, "cogs_across_unit_trend", glName)
                            this.props.fetchItemGL(glName, glCode, false, this.props.byInvoiceDate)
                        },
                        legendItemClick: (e)=>{
                            e.preventDefault()
                        }
                    }
                }
            },
            series: seriesMap
        })
    }

    componentDidMount(){
        this.updateChart()
    }

    renderDisplay(){
        const {displayType} = this.state
        switch (displayType){
            case "chart": {
                return (<div ref={(el) => this.cogsAcrossUnitTrendGroup = el} style={{ display: 'flex' }} className='chart' />)
            }
            case "tabular": {
                return (<CogsAcrossUnitTabularGroup/>)
            }
            default: {
                return (<div ref={(el) => this.cogsAcrossUnitTrendGroup = el} style={{ display: 'flex' }} className='chart' />)
            }
        }
    }

    setDisplay = (displayType) => {
        this.setState({displayType: displayType})
    }

    render(){
        const {displayType} = this.state

        return (
            <div>
                <div>
                    <div className={"cogs-across-unit-trend-group"}>
                        <ul className={"nav nav-tabs"}>
                            <li className={displayType === "chart" ? "nav-item active" : "nav-item"}>
                                <a onClick={this.setDisplay.bind(null, "chart")}>Chart</a>
                            </li>
                            <li className={displayType === "tabular" ? "nav-item active" : "nav-item"}>
                                <a onClick={this.setDisplay.bind(null, "tabular")}>Table</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className={"tab-content"}>
                    <div className={"tab-pane fade show active"}>
                        {this.renderDisplay()}
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {cost_trend_unit_group_by_gl, glFilters, currentGL, glFilterSelectAll, isLoading} = state.cogs
    return {
        cost_trend_unit_group_by_gl: cost_trend_unit_group_by_gl,
        glFilters: glFilters,
        currentGL: currentGL,
        selectAll: glFilterSelectAll,
        isLoading: isLoading,
        sidebarOpen: state.dashboard.sidebarOpen,
        byInvoiceDate: state.widget_settings.cost.byInvoiceDate
    }
}

export default connect(mapStateToProps, {updateGLFilters, pushHistory, setChartType, fetchItemGL})(CogsAcrossUnitTrendGroup)
