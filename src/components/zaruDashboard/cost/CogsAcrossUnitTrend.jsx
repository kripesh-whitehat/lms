import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchItemGL, setItemsUsageDisplay } from "actions/CogsActions";
import "./CogsAcrossUnitTrend.css";
import CogsItemUsageTable from "./CogsItemUsageTable";
import CogsItemUsageTabular from "./CogsItemUsageTabular";
import CogsItemUsageTrend from "./CogsItemUsageTrend";
import moment from "moment";

let isFetching = false;

class CogsAcrossUnitTrend extends Component {
  componentDidUpdate(prevProps, prevState) {
    if (!this.props.isLoading) {
      if (
        prevProps.startDate !== this.props.startDate ||
        prevProps.endDate !== this.props.endDate ||
        prevProps.sidebarOpen !== this.props.sidebarOpen ||
        prevProps.byInvoiceDate !== this.props.byInvoiceDate
      ) {
        this.updateData();
      }
    }
  }

  updateData() {
    const { glCode, glName, byInvoiceDate } = this.props;
    if (isFetching) {
      return;
    }
    isFetching = true;
    this.props.fetchItemGL(glName, glCode, true, byInvoiceDate);
    setTimeout(() => {
      isFetching = false;
    }, 1000);
  }

  setItemsUsageDisplay = (displayType, e) => {
    e.preventDefault();
    this.props.setItemsUsageDisplay(displayType);
  };

  renderDisplay() {
    const { widget_id, cogsItemUsageDisplay } = this.props;
    switch (cogsItemUsageDisplay) {
      case "chart": {
        return <CogsItemUsageTrend widget_id={widget_id} />;
      }
      case "tabular": {
        return <CogsItemUsageTabular widget_id={widget_id} />;
      }
      default: {
        return <CogsItemUsageTrend widget_id={widget_id} />;
      }
    }
  }

  render() {
    const { widget_id, cogsItemUsageDisplay } = this.props;
    return (
      <div>
        <div>
          <div className={"cogs-item-usage-tabs"}>
            <ul className={"nav nav-tabs"}>
              <li
                className={
                  cogsItemUsageDisplay === "chart"
                    ? "nav-item active"
                    : "nav-item"
                }
              >
                <a onClick={this.setItemsUsageDisplay.bind(null, "chart")}>
                  Chart
                </a>
              </li>
              <li
                className={
                  cogsItemUsageDisplay === "tabular"
                    ? "nav-item active"
                    : "nav-item"
                }
              >
                <a onClick={this.setItemsUsageDisplay.bind(null, "tabular")}>
                  Table
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className={"tab-content"}>
          <div className={"tab-pane fade show active"}>
            {this.renderDisplay()}
          </div>
        </div>
        <div>
          <CogsItemUsageTable widget_id={widget_id} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { reports, cogs } = state;

  return {
    startDate: moment(reports.startDate).format("MM/DD/YYYY"),
    endDate: moment(reports.endDate).format("MM/DD/YYYY"),
    isLoading: cogs.isLoading,
    glCode: cogs.currentCogsItemGLCode,
    glName: cogs.currentCogsItemGL,
    sidebarOpen: state.dashboard.sidebarOpen,
    cogsItemUsageDisplay: cogs.cogsItemUsageDisplay,
    byInvoiceDate: state.widget_settings.cost.byInvoiceDate,
  };
};

export default connect(mapStateToProps, {
  fetchItemGL,
  setItemsUsageDisplay,
})(CogsAcrossUnitTrend);
