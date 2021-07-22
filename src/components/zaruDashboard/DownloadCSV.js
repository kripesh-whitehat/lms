import React, { Component } from 'react'
import { exportReactTable, exportTableToCSV } from "utils"

class DownloadCSV extends Component {
    downloadToCSV = () => {
        if (this.props.isReactTable){
            exportReactTable(this.props.tableSelector, this.props.fileName)
        } else {
            exportTableToCSV(this.props.tableSelector, this.props.fileName)
        }
    }

    render(){
        return (<div style={{...this.props.style}}>
            <a onClick={this.downloadToCSV}>(CSV)</a>
        </div>)
    }
}

export default DownloadCSV
