import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'styles/ItemUsageTable.css'
import { formatIntoDollars } from 'utils'
import GlSelector from '../GlSelector'
import Table from '../Table'
import SparkLine from './SparkLine'
const formatDate = (date) => moment(date).format('MM/DD/YYYY')

class CogsTable extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const columns = [
      {
        Header: this.props.nameHeader,
        accessor: 'item',
      },
      {
        Header: 'Variance',
        maxWidth: 120,
        accessor: 'variance',
      },
      {
        Header: 'Purchase',
        maxWidth: 100,
        accessor: 'purchase',
        Cell: (data) => formatIntoDollars(data.row.purchase),
      },
      {
        Header: 'Usage Rank',
        maxWidth: 100,
        accessor: 'usage_rank',
      },
      {
        Header: 'Purchase Rank',
        maxWidth: 100,
        accessor: 'purchase_rank',
      },
      {
        Header: 'Trend',
        accessor: 'end_inv',
        width: 150,
        Cell: (data) => (
          <div className="spark-cell">
            <SparkLine
              chartData={data.original.ipus}
              onDataClick={() => this.props.onTrendClick(data.original)}
              container={this.props.container}
              type="item_usage_by_company"
              {...this.props}
            />
          </div>
        ),
      },
    ]

    const { id, reports, handleGlSelect, glCode, glSelectVisible } = this.props
    const glSelector = glSelectVisible ? (
      <GlSelector
        gls={reports[id].item_usage_gls || []}
        handleGlSelect={handleGlSelect}
        glCode={glCode}
      />
    ) : (
      <div />
    )
    return (
      <div className="item-usage-table">
        {glSelector}
        <Table
          showPagination={false}
          columns={columns}
          data={this.props.data}
          onDataClick={(row) => this.props.onRowClick(row.original)}
        />
      </div>
    )
  }
}

CogsTable.defaultProps = {
  onRowClick: () => null,
  glSelectVisible: false,
}

CogsTable.propTypes = {}

const mapStateToProps = (state) => ({ reports: state.reports })

export default connect(mapStateToProps)(CogsTable)
