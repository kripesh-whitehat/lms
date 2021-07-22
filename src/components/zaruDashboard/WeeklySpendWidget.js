import React from 'react'
import 'styles/FruitConsumptionWidget.css'
import WeeklySpendChart from './WeeklySpendChart'
import WeeklySpendGaugeChart from './WeeklySpendGaugeChart'
import Widget from './Widget'

const WeeklySpendWidget = (props) => (
  <Widget
    title="Weekly Spend"
    type="weekly_spend_report"
    fetchData={props.weeklySpendReport}
    {...props}
  >
    <div className="fruit-main-chart">
      <WeeklySpendChart
        widthRatio={0.7}
        heightRatio={0.5}
        container={`fruit-main-chart-${props.id}`}
        {...props}
      />
    </div>

    <div className="fruit-gauges-container">
      <div className="fruit-gauge-1">
        <WeeklySpendGaugeChart
          widthRatio={0.2}
          heightRatio={0.22}
          container={`fruit-gauge-${props.id}`}
          glName="Food"
          budgetAmount={100000}
          {...props}
        />
      </div>

      <div className="fruit-gauge-2">
        <WeeklySpendGaugeChart
          widthRatio={0.2}
          heightRatio={0.22}
          container={`fruit-gauge-2-${props.id}`}
          glName="Beverage"
          budgetAmount={100000}
          {...props}
        />
      </div>
    </div>
  </Widget>
)

WeeklySpendWidget.propTypes = {}

const styles = {
  WeeklySpendChart: {},
}

export default WeeklySpendWidget
