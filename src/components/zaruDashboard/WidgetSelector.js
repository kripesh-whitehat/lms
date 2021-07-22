import React from 'react'
import apSpendWidgetThumbnail from 'assets/images/ap_spend.png'
import FourRWidgetThumbnail from 'assets/images/FourRWidget.png'
import pourCostThumbnail from 'assets/images/pour_cost_widget.png'
import vendorSpendThumbnail from 'assets/images/vendor_spend.png'
import 'styles/WidgetSelector.css'
import WidgetThumbnail from './WidgetThumbnail'

const WidgetSelector = (props) => (
  <div className="widget-selector-container">
    <WidgetThumbnail
      widgetType="ap_spend"
      title="AP Spend"
      source={apSpendWidgetThumbnail}
    />
    <WidgetThumbnail
      widgetType="vendor_spend"
      title="Vendor Spend"
      source={vendorSpendThumbnail}
    />
    <WidgetThumbnail
      widgetType="cost"
      title="Cost of Sales"
      source={pourCostThumbnail}
    />
    <WidgetThumbnail
      widgetType="four_r"
      title="4R"
      source={FourRWidgetThumbnail}
    />
  </div>
)

export default WidgetSelector
