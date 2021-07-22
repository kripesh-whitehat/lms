import React, { Component } from "react";
import { connect } from "react-redux";
import { setByInvoiceDate } from "actions/WidgetSettingsActions";
import "./InvoiceDateToggle.css";

class InvoiceDateToggle extends Component {
  handleDateToggleChange = (event) => {
    this.props.setByInvoiceDate(
      this.props.widget.name,
      event.target.value === "invoice_date"
    );
  };

  render() {
    const { widgetId, widget, widget_settings } = this.props;
    const isInvoiceDateToggle = widget_settings[widget.name].byInvoiceDate;
    const inputGroupName = `invoice_date_toggle-${widget.name}-${widgetId}`;
    return (
      <div
        className={"invoice-date-toggle"}
        onChange={this.handleDateToggleChange}
      >
        <div className={"invoice-date-toggle-input"}>
          <input
            type={"radio"}
            name={inputGroupName}
            value={"submitted_date"}
            defaultChecked={!isInvoiceDateToggle}
          />
          <label className="wd-80 white-space-nowrap" htmlFor="invoice_date_toggle">
            Submitted Date
          </label>
        </div>
        <div className={"invoice-date-toggle-input"}>
          <input
            type={"radio"}
            name={inputGroupName}
            value={"invoice_date"}
            defaultChecked={isInvoiceDateToggle}
          />
          <label className="wd-80 white-space-nowrap" htmlFor="invoice_date_toggle">
            Invoice Date
          </label>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { widget_settings } = state;
  return {
    widget_settings,
  };
};

export default connect(mapStateToProps, { setByInvoiceDate })(
  InvoiceDateToggle
);
