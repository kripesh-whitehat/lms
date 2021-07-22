import React from 'react'
import 'styles/FruitConsumptionWidget.css'
import APSpendDrilldownMultiLocationSpendChart from './APSpendDrilldownMultiLocationSpendChart'
import Widget from './Widget'

const APSpendDrilldownMultiLocationSpendWidget = (props) => (
  <Widget
    title="Multi Location Spend"
    type="location_spend"
    urlParams="?company_code=stellands"
    {...props}
  >
    <div className="fruit-main-chart">
      <APSpendDrilldownMultiLocationSpendChart
        widthRatio={0.7}
        heightRatio={0.7}
        container={`fruit-main-chart-${props.id}`}
        {...props}
      />
    </div>
  </Widget>
)

APSpendDrilldownMultiLocationSpendWidget.propTypes = {}

const styles = {
  APSpendDrilldownMultiLocationSpendWidget: {},
}

export default APSpendDrilldownMultiLocationSpendWidget
