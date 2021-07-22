import React from 'react'
import 'styles/FruitConsumptionWidget.css'
import APSpendDrilldownGlSubcategorySpendChart from './APSpendDrilldownGlSubcategorySpendChart'
import Widget from './Widget'

const APSpendDrilldownGlSubcategorySpendWidget = (props) => (
  <Widget
    title="GL Subcategory Spend"
    type="gl_report"
    urlParams="?user_id=140&start_date=01/22/2017&end_date_date=01/22/2017"
    {...props}
  >
    <div className="fruit-main-chart">
      <APSpendDrilldownGlSubcategorySpendChart
        widthRatio={0.7}
        heightRatio={0.7}
        container={`fruit-main-chart-${props.id}`}
        {...props}
      />
    </div>
  </Widget>
)

APSpendDrilldownGlSubcategorySpendWidget.propTypes = {}

const styles = {
  APSpendDrilldownGlSubcategorySpendWidget: {},
}

export default APSpendDrilldownGlSubcategorySpendWidget
