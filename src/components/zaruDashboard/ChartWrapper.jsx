import React from 'react'
import 'styles/ChartWrapper.css'
import Chart from './Chart'
import BubbleChartWrapper from "./four_r/BubbleChartWrapper"

// component to display message to user instead of rendering
// chart if no data is present
const ChartWrapper = (props) => {
  const { dataIsPresent, emptyDataMessage, type, reports, id, is_bubble } = props
  const error = reports[id].errors ? reports[id].errors[type] : null
  const message = error || emptyDataMessage
  if (dataIsPresent) {
    if (is_bubble){
      return <BubbleChartWrapper {...props}/>
    } else {
      return <Chart {...props} />
    }
  } else {
    return (
      <div className='chart-wrapper'>
        <div className='chart-wrapper-message'>{ message }</div>
      </div>
    )
  }
}

ChartWrapper.defaultProps = {
  dataIsPresent: true,
  emptyDataMessage: 'No Data Available'
}

export default ChartWrapper
