import React from 'react'
import 'styles/FruitConsumptionWidget.css'
import GlSpendChart from './GlSpendChart'
import Widget from './Widget'

const GlSpendWidget = (props) => (
  <Widget title="GL Spend" type="gl_report" {...props}>
    <div className="fruit-main-chart">
      <GlSpendChart
        widthRatio={0.7}
        heightRatio={0.5}
        type="gl_report"
        container={`fruit-main-chart-${props.id}`}
        {...props}
      />
    </div>
  </Widget>
)

GlSpendWidget.propTypes = {}

const styles = {
  GlSpendWidget: {},
}

export default GlSpendWidget
