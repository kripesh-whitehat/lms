import React, { Component } from "react";
import { connect } from "react-redux";
import { setChartType, sliceHistory } from "actions";
import "./InventoryCountsContainer.css";
import InventoryCountsTable from "./InventoryCountsTable";
import InvoicesTable from "./InvoicesTable";
import moment from "moment";

class InventoryCountsContainer extends Component {
  componentDidUpdate(prevProps) {
    const { startDate, endDate, byInvoiceDate } = this.props;
    if (
      prevProps.startDate !== startDate ||
      prevProps.endDate !== endDate ||
      prevProps.byInvoiceDate !== byInvoiceDate
    ) {
      this.navigateBack();
    }
  }

  navigateBack() {
    const { widget_id } = this.props;
    this.props.setChartType(widget_id, "cogs_across_unit_trend");
    this.props.sliceHistory(widget_id, 3);
  }

  render() {
    const { invoices_by_item } = this.props;
    return (
      <div className={"inventory-counts-container"}>
        <InventoryCountsTable />
        <div className={"inventory-counts-invoices-table"}>
          <InvoicesTable dataMap={invoices_by_item} defaultPageSize={5} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    invoices_by_item: state.cogs.invoices_by_item,
    startDate: moment(state.reports.startDate).format("MM/DD/YYYY"),
    endDate: moment(state.reports.endDate).format("MM/DD/YYYY"),
    byInvoiceDate: state.widget_settings.cost.byInvoiceDate,
  };
};

export default connect(mapStateToProps, { setChartType, sliceHistory })(
  InventoryCountsContainer
);
