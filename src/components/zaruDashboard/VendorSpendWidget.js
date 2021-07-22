import React from 'react'
import 'styles/FruitConsumptionWidget.css'
import VendorSpendChart from './VendorSpendChart'
import Widget from './Widget'

const VendorSpendWidget = (props) => (
  <Widget title="Vendor Spend" type="vendor_spend_report" {...props}>
    <div className="fruit-main-chart">
      <VendorSpendChart
        widthRatio={0.7}
        heightRatio={0.7}
        type="vendor_spend_report"
        container={`fruit-main-chart-${props.id}`}
        {...props}
      />
    </div>
  </Widget>
)

VendorSpendWidget.propTypes = {}

const styles = {
  VendorSpendWidget: {},
}

export default VendorSpendWidget
