import React, { Component } from 'react'
import APSpendWidget from './ap_spend/APSpendWidget'
import BudgetVsActualWidget from './budget_vs_actual/BudgetVsActualWidget'
import CostWidget from './cost/CostWidget'
import FourRWidget from './four_r/FourRWidget'
import VendorWidget from './vendor_spend/VendorWidget'

class WidgetSwitch extends Component {
  render() {
    const { widget, onCompressClick, admin, onExpandClick, printView } =
      this.props
    const commonProps = {
      fullscreen: true,
      onCompressClick,
      admin,
      key: widget.id,
      onExpandClick,
      id: widget.id,
      printView,
    }

    switch (widget.name) {
      case 'vendor_spend':
        return <VendorWidget {...commonProps} />
      case 'ap_spend':
        return <APSpendWidget {...commonProps} />
      case 'cost':
        return <CostWidget {...commonProps} />
      case 'four_r':
        return <FourRWidget {...commonProps} />
      case 'budget_vs_actual':
        return <BudgetVsActualWidget {...commonProps} />
      default:
        return <APSpendWidget {...commonProps} />
    }
  }
}

WidgetSwitch.defaultProps = {
  fullscreen: false,
  onExpandClick: () => null,
  onCompressClick: () => null,
  admin: false,
  printView: false,
}

export default WidgetSwitch
