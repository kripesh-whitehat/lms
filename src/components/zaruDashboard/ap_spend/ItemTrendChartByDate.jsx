import Highcharts from 'highcharts'
import _ from 'lodash'
import moment from "moment"
import React, { Component } from 'react'

const theme = [
    '#058DC7',
    '#800080',
    '#24CBE5',
    '#DDDF00',
    '#50B432',
    '#ED561B',
    '#64E572',
    '#FF9655',
    '#6AF9C4'
]

class ItemTrendChartByDate extends Component {
    componentDidMount(){
        this.updateChart()
    }
    componentDidUpdate(){
        this.updateChart()
    }

    updateChart(){
        const {items, item_name, trend_by} = this.props
        Highcharts.theme = { colors: theme }

        this.chart = Highcharts.chart(this.itemTrendChartByDate, {
            title: {
                text: `${item_name} Price Trend`
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: trend_by === "invoice_date" ? "Invoice Date" : "Submitted Date"
                }
            },
            yAxis: {
                title: {
                    text: 'Rate ($)'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                line: {
                    marker: {
                        enabled: true
                    }
                },
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    pointStart: 2010,
                    point: {
                        events: {
                            click: (e)=>{
                                const {imageLink} = e.point
                                if (_.isEmpty(imageLink)) {
                                    return
                                }
                                window.open(imageLink,'_blank');
                            }
                        }
                    },
                },
            },

            series: [
                {
                    name: 'Items',
                    data: items
                }
            ],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            },
            tooltip: {
                formatter: function() {
                    const item = this.points[0].point
                    let {submittedDate} = item
                    submittedDate = moment(new Date(submittedDate)).format("MM/DD/YYYY")
                    const averageText = item.isAverage ? `<br/><div style='color:orange'>(Average of ${item.numItems} items)<div>` : ''
                    var toolTip = "";
                    toolTip += "Vendor: " + item.vendor + '<br/>'
                    if (trend_by === "invoice_date"){
                        toolTip += "Invoice Date: " + moment(Date.parse(item.date)).format('MM/DD/YYYY') + '<br/>'
                    } else {
                        toolTip += `Submitted Date: ${submittedDate} <br/>`
                    }
                    toolTip += "Rate: $" + item.rate.toFixed(2) + '<br/>'
                    toolTip += "Amount: $" + (parseFloat(item.rate) * parseFloat(item.qty)).toFixed(2) + '<br/>'
                    toolTip += averageText
                    return toolTip;
                },
                shared: true,
                useHTML: true,
                xDateFormat: '%m/%d/%Y'
            }
        })
    }

    render(){
        return (<div ref={(el) => this.itemTrendChartByDate = el} style={{ display: 'flex' }} className='chart' />)
    }
}

export default ItemTrendChartByDate