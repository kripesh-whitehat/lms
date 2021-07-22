import React from 'react'
import 'react-table/react-table.css'
import 'styles/Table.css'
import AggregateItemsSpendTable from './AggregateItemsSpendTable'
import Widget from './Widget'

const APSpendDrilldownAggregateItemsSpendWidget = (props) => (
  <Widget
    title="Top Items"
    type="aggregate_spend_report_by_gl"
    urlParams="?user_id=140&t=sunny"
    {...props}
  >
    <AggregateItemsSpendTable {...props} />
  </Widget>
)

APSpendDrilldownAggregateItemsSpendWidget.propTypes = {}

export default APSpendDrilldownAggregateItemsSpendWidget
