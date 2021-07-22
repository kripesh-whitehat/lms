import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addWidgetToDashboard, createWidget } from 'actions'
import apSpendWidgetThumbnail from 'assets/images/ap_spend.png'
import BudgetVsActualWidgetThumbnail from 'assets/images/budget_vs_actual.png'
import costThumbnail from 'assets/images/cost-widget.png'
import FourRWidgetThumbnail from 'assets/images/FourRWidget.png'
import vendorSpendThumbnail from 'assets/images/vendor_spend.png'
import 'styles/SelectorModal.css'
import FullScreen from './FullScreen'
import SelectorItem from './SelectorItem'

class SelectorModal extends Component {
  constructor(props) {
    super(props)
    this.handleSelectorItemClick = this.handleSelectorItemClick.bind(this)
    this.selectorItemDisabled = this.selectorItemDisabled.bind(this)
  }

  handleSelectorItemClick(type) {
    this.props.createWidget(type)
  }

  selectorItemDisabled(type) {
    const types = this.props.widgets.map((widget) => widget.name)
    return types.includes(type)
  }

  render() {
    return (
      <FullScreen visible={this.props.visible} close={this.props.close}>
        <div className="selector-container">
          <div
            id="close-selector-btn"
            onClick={this.props.close}
            className="fa fa-close  fa-lg icon-active"
          />
          <div className="selector-title">
            Select a widget to add to your dashboard
          </div>
          <div className="selector-items-container">
            <SelectorItem
              type="ap_spend"
              title="AP Spend"
              source={apSpendWidgetThumbnail}
              onClick={this.handleSelectorItemClick}
              disabled={this.selectorItemDisabled('ap_spend')}
            />
            <SelectorItem
              type="vendor_spend"
              title="Vendor Spend"
              source={vendorSpendThumbnail}
              onClick={this.handleSelectorItemClick}
              disabled={this.selectorItemDisabled('vendor_spend')}
            />
            <SelectorItem
              type="cost"
              title="Cost of Sales"
              source={costThumbnail}
              onClick={this.handleSelectorItemClick}
              disabled={this.selectorItemDisabled('cost')}
            />
            <SelectorItem
              type="four_r"
              title="4R"
              source={FourRWidgetThumbnail}
              onClick={this.handleSelectorItemClick}
              disabled={this.selectorItemDisabled('four_r')}
            />
            <SelectorItem
              type="budget_vs_actual"
              title="Budget vs. Actual"
              source={BudgetVsActualWidgetThumbnail}
              onClick={this.handleSelectorItemClick}
              disabled={this.selectorItemDisabled('budget_vs_actual')}
            />
          </div>
        </div>
      </FullScreen>
    )
  }
}

const mapStateToProps = (state) => ({ widgets: state.widgets.widgets })

export default connect(mapStateToProps, { addWidgetToDashboard, createWidget })(
  SelectorModal,
)
