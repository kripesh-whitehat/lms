import React from "react";
import { connect } from "react-redux";
import { fetchInvoicesGL } from "actions/CogsActions";
import "./APSpendTable.css";
import InvoicesTable from "./InvoicesTable";
import moment from "moment";

class APSpendTable extends React.Component {
  componentDidUpdate(prevProps) {
    const { startDate, endDate, isLoading, invoicesGL, byInvoiceDate } =
      this.props;
    if (
      !isLoading &&
      (prevProps.startDate !== startDate ||
        prevProps.endDate !== endDate ||
        prevProps.byInvoiceDate !== byInvoiceDate)
    ) {
      this.props.fetchInvoicesGL(invoicesGL, byInvoiceDate);
    }
  }

  render() {
    const { cost_of_goods_gl_invoices } = this.props;
    return (
      <div className={"ap-spend-table"}>
        <div className={"title"}>
          <h3>Invoices by GL</h3>
        </div>
        <InvoicesTable
          dataMap={cost_of_goods_gl_invoices}
          defaultPageSize={20}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    cost_of_goods_gl_invoices: state.cogs.cost_of_goods_gl_invoices,
    startDate: moment(state.reports.startDate).format("MM/DD/YYYY"),
    endDate: moment(state.reports.endDate).format("MM/DD/YYYY"),
    invoicesGL: state.cogs.invoicesGL,
    isLoading: state.cogs.isLoading,
    byInvoiceDate: state.widget_settings.cost.byInvoiceDate,
  };
};

export default connect(mapStateToProps, { fetchInvoicesGL })(APSpendTable);
