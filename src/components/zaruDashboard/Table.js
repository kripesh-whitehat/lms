import _ from 'lodash'
import React, { Component } from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import 'styles/ChartWrapper.css'
import 'styles/Table.css'

class Table extends Component {
  constructor(props) {
    super(props)
    this.handleDataClick = this.handleDataClick.bind(this)
  }

  componentDidUpdate() {
    // const { container, config, modules, type, theme } = this.props
  }

  handleDataClick(rowInfo) {
    this.props.onDataClick(rowInfo)
  }

  render() {
    const {
      data,
      printView,
      columns,
      subComponent,
      error,
      emptyDataMessage,
      filterable,
      showPagination,
      defaultPageSize,
      heightRatio,
    } = this.props

    if (_.isEmpty(data)) {
      return (
        <div className="chart-wrapper">
          <div className="chart-wrapper-message">
            {error || emptyDataMessage}
          </div>
        </div>
      )
    }

    const style = heightRatio ? { height: `${heightRatio * 100}%` } : {}
    return (
      <ReactTable
        data={data}
        columns={columns}
        SubComponent={subComponent}
        filterable={printView ? false : filterable}
        showPagination={printView ? false : showPagination}
        defaultSorted={this.props.defaultSorted}
        defaultPageSize={printView ? data.length : defaultPageSize}
        style={style}
        getTrProps={(state, rowInfo, column, instance) => ({
          onClick: (e) => this.handleDataClick(rowInfo),
        })}
      />
    )
  }
}

Table.defaultProps = {
  onDataClick: () => null,
  filterable: false,
  showPagination: true,
  emptyDataMessage: 'No Data Available',
  defaultPageSize: 20,
}

Table.propTypes = {}

export default Table
