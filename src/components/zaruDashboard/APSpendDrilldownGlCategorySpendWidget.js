import React from 'react'
import 'styles/FruitConsumptionWidget.css'
import APSpendDrilldownGlCategorySpendChart from './APSpendDrilldownGlCategorySpendChart'
import Widget from './Widget'

const APSpendDrilldownGlCategorySpendWidget = (props) => (
  <Widget
    title="GL Category Spend"
    type="weekly_spend_report"
    urlParams="?user_id=140"
    {...props}
  >
    <div className="fruit-main-chart">
      <APSpendDrilldownGlCategorySpendChart
        widthRatio={0.7}
        heightRatio={0.7}
        container={`fruit-main-chart-${props.id}`}
        {...props}
      />
    </div>
  </Widget>
)

APSpendDrilldownGlCategorySpendWidget.propTypes = {}

const styles = {
  APSpendDrilldownGlCategorySpendWidget: {},
}

export default APSpendDrilldownGlCategorySpendWidget
