import Highcharts from 'highcharts'
import _ from 'lodash'
import moment from "moment"
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { pushHistory, setChartType } from 'actions'
import { fetchInventoryItemLoc, fetchInvoicesByItem, updateItemCheckbox } from 'actions/CogsActions'
import { dateToUTC, formatIntoDollars, roundTwo } from 'utils'
import './CogsAcrossUnitTrendGroup.css'

const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']

class CogsItemUsageTrend extends Component{
    componentDidMount(){
        this.updateChart()
    }

    componentDidUpdate(prevProps){
        if (!_.isEqual(prevProps.item_level_trend, this.props.item_level_trend) ||
            (!this.props.isLoading && prevProps.isLoading !== this.props.isLoading)){
            this.updateChart()
        }

        if (!_.isEqual(prevProps.currentItemTid,this.props.currentItemTid)){
            this.updateDisplay()
        }
    }

    updateDisplay(){
        const {tid, display} = this.props.currentItemTid
        if (tid){
            const selSeries = _.find(this.chart.series, (s)=>{
                return s.userOptions.t_id === tid
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

    calculateUsage(beginning, purchases, ending){
        beginning = parseFloat(beginning) || 0
        purchases = parseFloat(purchases) || 0
        ending = parseFloat(ending) || 0
        return beginning + purchases - ending
    }


    updateChart(){
        Highcharts.theme = { colors: theme }

        const {currentCogsItemGL, item_level_trend} = this.props
        let seriesMap = item_level_trend.map((d)=>{
            const {periodData, item_name, t_id, display, showInLegend} = d
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

                const usage_qty = this.calculateUsage(beg_inv_quantity, purchase_quantity, end_inv_quantity)
                const usage = this.calculateUsage(beg_inv, purchases, end_inv)

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
            return {
                name: item_name,
                data: data,
                t_id: t_id,
                visible: display,
                showInLegend: showInLegend
            }
        })

        seriesMap = _.sortBy(seriesMap, 'name')

        this.chart = Highcharts.chart(this.itemUsageTrend, {
            title: {
                text: `${currentCogsItemGL} Items Usage Trend`
            },
            yAxis: {
                title: {
                    text: 'Usage Qty'
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
                    const generateLabel = (qty, countingUnit, total) => {
                        let price = parseFloat(total) / parseFloat(qty)
                        if (_.isNaN(price)){
                            price = 0
                        }
                        price = formatIntoDollars(price)
                        total = formatIntoDollars(total)
                        if (!_.isEmpty(countingUnit)){
                            countingUnit = qty !== 1 ? `${countingUnit}s` : countingUnit
                        }

                        return `${roundTwo(qty)} ${countingUnit.toLocaleLowerCase()} @ ${price}=${total}`
                    }

                    const {
                        beg_inv_quantity, counting_unit, beg_inv,
                        purchase_quantity, purchases,
                        end_inv_quantity, end_inv,
                        usage, usage_qty,
                    } = this.point

                    const date = moment(this.point.ending_week).format('MM/DD/YYYY')

                    const biLabel = generateLabel(beg_inv_quantity, counting_unit, beg_inv)
                    const piLabel = generateLabel(purchase_quantity, counting_unit, purchases)
                    const eiLabel = generateLabel(end_inv_quantity, counting_unit, end_inv)
                    const usageLabel = generateLabel(usage_qty, counting_unit, usage)

                    return `<div><b>${this.series.name}</b><br/></div>` +
                        `<div>Week Ending: ${date}<br/></div>` +
                        `<div>BI: ${biLabel}<br/></div>` +
                        `<div>Purchases: ${piLabel}<br/></div>` +
                        `<div>EI: ${eiLabel}<br/></div>` +
                        `<div>Usage: ${usageLabel}<br/></div>`
                }
            },
            plotOptions: {
                series: {
                    pointIntervalUnit: 'week',
                    label: {
                        connectorAllowed: false
                    },
                    pointStart: 2010,
                    point: {
                        events: {
                            click: (e)=>{
                                const startDate = moment(new Date(e.point.starting_week)).format("MM/DD/YYYY")
                                const endDate = moment(new Date(e.point.ending_week)).format("MM/DD/YYYY")
                                this.props.fetchInventoryItemLoc(startDate, e.point.unit_inventory_item_id, this.props.byInvoiceDate)
                                this.props.fetchInvoicesByItem({
                                    startDate: startDate,
                                    endDate: endDate,
                                    itemId: e.point.unit_inventory_item_id,
                                    byInvoiceDate: this.props.byInvoiceDate
                                })
                                this.props.setChartType(this.props.widget_id, "inventory_counts_table")
                                this.props.pushHistory(this.props.widget_id, "inventory_counts_table", e.point.item_name)
                            }
                        }
                    },
                    events: {
                        legendItemClick: (e)=>{
                            e.preventDefault()
                        }
                    }
                }
            },
            series: seriesMap
        })
    }


    render(){
        return (
            <div>
                <div ref={(el)=>{this.itemUsageTrend = el}} style={{ display: 'flex' }} className='chart' />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {cogs} = state
    return {
        currentCogsItemGL: cogs.currentCogsItemGL,
        item_level_trend: cogs.item_level_trend,
        currentItemTid: cogs.currentItemTid,
        isLoading: cogs.isLoading,
        byInvoiceDate: state.widget_settings.cost.byInvoiceDate
    }
}

export default connect(mapStateToProps, {
    setChartType,
    pushHistory,
    fetchInventoryItemLoc,
    updateItemCheckbox,
    fetchInvoicesByItem
})(CogsItemUsageTrend)
