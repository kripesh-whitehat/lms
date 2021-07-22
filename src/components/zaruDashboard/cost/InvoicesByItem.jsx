import React from "react";
import { connect } from "react-redux";
import { fetchInvoicesByItem } from "actions/CogsActions";
import InvoicesTable from "./InvoicesTable";
import moment from "moment";

let isFetching = false;

class InvoicesByItem extends React.Component {
  componentDidUpdate(prevProps, prevState) {
    if (!this.props.isLoading) {
      if (
        prevProps.startDate !== this.props.startDate ||
        prevProps.endDate !== this.props.endDate ||
        prevProps.byInvoiceDate !== this.props.byInvoiceDate
      ) {
        this.updateData();
      }
    }
  }

  updateData() {
    if (isFetching) {
      return;
    }
    isFetching = true;
    this.props.fetchInvoicesByItem({
      itemId: this.props.itemId,
      byInvoiceDate: this.props.byInvoiceDate,
    });
    setTimeout(() => {
      isFetching = false;
    }, 1000);
  }

  render() {
    const { invoices_by_item } = this.props;
    const dataMap = invoices_by_item.map((d) => {
      const {
        name,
        invoiceNumber,
        invoiceDate,
        starting_week,
        ending_week,
        checkNumber,
        checkDate,
        amount,
        imageLink,
      } = d;
      return {
        name: name,
        invoiceNumber: invoiceNumber,
        invoiceDate: invoiceDate,
        starting_week: starting_week,
        ending_week: ending_week,
        checkNumber: checkNumber,
        checkDate: checkDate,
        amount: amount,
        imageLink: imageLink,
      };
    });

    return (
      <div className={"ap-spend-table"}>
        <div className={"title"}>
          <h3>Invoices by Item</h3>
        </div>
        <InvoicesTable dataMap={dataMap} />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { reports, cogs } = state;
  return {
    startDate: moment(reports.startDate).format("MM/DD/YYYY"),
    endDate: moment(reports.endDate).format("MM/DD/YYYY"),
    invoices_by_item: state.cogs.invoices_by_item,
    isLoading: cogs.isLoading,
    itemId: cogs.itemId,
    byInvoiceDate: state.widget_settings.cost.byInvoiceDate,
  };
};

export default connect(mapStateToProps, { fetchInvoicesByItem })(
  InvoicesByItem
);
