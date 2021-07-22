import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { destroyWidget } from 'actions'
import 'styles/WidgetSettings.css'

class WidgetSettings extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick(e) {
    if (this.node.contains(e.target) || this.props.iconRef.contains(e.target)) {
      return
    }

    if (this.props.visible === true) {
      this.props.onHide()
    }
  }

  handleSubmit(e) {
    e.preventDefault()
    this.props.onHide()
  }

  render() {
    const display = this.props.visible ? 'flex' : 'none'
    return (
      <form
        className="widget-settings-container"
        onSubmit={this.handleSubmit}
        style={{ display }}
        ref={(node) => (this.node = node)}
      >
        <div className="widget-settings-title">Settings</div>
        <div className="widget-settings-input-group">
          <div className="widget-settings-label">Beginning of Week</div>
          <select>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
          </select>
        </div>

        <div className="widget-settings-input-group">
          <div className="widget-settings-label">Food Budget</div>
          <input className="widget-settings-input" type="text" />
        </div>

        <div className="widget-settings-input-group">
          <div className="widget-settings-label">Beverage Budget</div>
          <input className="widget-settings-input" type="text" />
        </div>
        <div className="settings-buttons-container">
          <div
            className="fa fa-file settings-buttons"
            id="settings-pdf-icon"
            onClick={this.props.printDocument}
            data-tip="download a pdf of this widget"
          />

          <div
            className="fa fa-trash-o settings-buttons"
            id="delete-widget-icon"
            aria-hidden="true"
            onClick={() => {
              this.props.destroyWidget(this.props.id)
            }}
          />
        </div>
        <ReactTooltip type="info" />
        <input type="submit" style={{ display: 'none' }} />
      </form>
    )
  }
}

export default connect(null, { destroyWidget })(WidgetSettings)
