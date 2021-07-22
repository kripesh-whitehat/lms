import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { switchToSingleGL } from 'actions/CogsActions'
import ChartWrapper from "../ChartWrapper"


const theme = ['#50B432', '#ED561B', '#64E572', '#FF9655', '#6AF9C4']

function buildConfig(report, clickable) {
    if (!report) return {}
    const data = report.map((subcat) => {
        return {
            x: subcat.gl_name,
            y: parseFloat(subcat.percent),
            className: clickable ? '' : 'no-pointer',
            gl_code: parseInt(subcat.gl_code, 10)
        }
    })

    const series = [{
        name: 'GL Spend',
        colorByPoint: true,
        data: data.sort((a, b) => a.y - b.y )

    }];

    const chartConfig = {
        chart: {
            type: 'pie'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        tooltip: {
            enabled: true,
            formatter: function () {
                return this.point.x + '<br>' + this.y + '%'
            }
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return this.point.x + '<br>' + this.y + '%'
                    }
                }
            }
        },
        series: series
    }

    return chartConfig
}


class CogsAcrossUnitPieChart extends Component{
    constructor(props) {
        super(props)
        this.handlePieChartClick = this.handlePieChartClick.bind(this)
    }

    handlePieChartClick(e){
        const gl = e.point.gl_code
        this.props.switchToSingleGL(gl)
    }

    render(){
        const {data} = this.props

        return (
            <ChartWrapper
                dataIsPresent={!_.isEmpty(data)}
                onDataClick={this.handlePieChartClick}
                config={buildConfig(data, true)}
                modules={[]}
                theme={theme}
                fullscreenHeightRatio={.6}
                {...this.props}
            />
        )
    }
}

const mapStateToProps = () => {
    return {}
}

export default connect(mapStateToProps, {switchToSingleGL})(CogsAcrossUnitPieChart)