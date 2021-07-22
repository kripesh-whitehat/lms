import _ from 'lodash';
import moment from "moment";
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formatIntoDollars, formatName, formatPercent } from "utils";
import DownloadCSV from '../DownloadCSV';
import GLDataTable from "./GLDataTable";

class CogsAcrossUnitTabularGroup extends Component {
    render(){
        const {cost_trend_unit_group_by_gl, glFilters, group_name} = this.props
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
        const glMap = seriesMap.filter(s => s.visible).map((series, index)=>{
            const {name, gl_code, data} = series
            const key = `${gl_code}_${index}`
            return (<GLDataTable gl_code={gl_code} name={name} key={key} data={data}/>)
        })
        return (<div>
            {glMap.length > 0 &&
                <div>
                    <DownloadCSV style={{marginTop: "1em", float: "right", marginRight: "2%"}}
                                 tableSelector={".gl-tabular-item table"}
                                 fileName={`${formatName(group_name)}_gl_trend.csv`}
                    />
                    <div className="clearfix"></div>
                </div>
            }
            {glMap}
        </div>)
    }
}

const mapStateToProps = (state) => {
    const {cost_trend_unit_group_by_gl, glFilters, currentGL} = state.cogs

    return {
        group_name: state.company.group_name,
        cost_trend_unit_group_by_gl: cost_trend_unit_group_by_gl,
        glFilters: glFilters,
        currentGL: currentGL
    }
}

export default connect(mapStateToProps, {})(CogsAcrossUnitTabularGroup)
