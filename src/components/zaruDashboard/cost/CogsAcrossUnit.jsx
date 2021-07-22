import _ from "lodash";
import React from "react";
import { connect } from "react-redux";
import {
  fetchTrendUnitGroupByGl,
  switchChartType,
} from "actions/CogsActions";
import { getFetching, setFetching } from "utils";
import "./CogsAcrossUnit.css";
import CogsAcrossUnitPieChart from "./CogsAcrossUnitPieChart";
import CogsAcrossUnitTable from "./CogsAcrossUnitTable";
import CogsAcrossUnitTrendGroup from "./CogsAcrossUnitTrendGroup";
import moment from "moment";

class CogsAcrossUnit extends React.Component {
  constructor(props) {
    super(props);
    this.switchChart = this.switchChart.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { unitId, category, startDate, endDate } = this.props;
    if (
      prevProps.unitId !== unitId ||
      prevProps.category !== category ||
      prevProps.startDate !== startDate ||
      prevProps.endDate !== endDate
    ) {
      this.fetchData();
    }
  }

  componentDidMount() {
    this.handleFetchOnMount();
  }

  handleFetchOnMount() {
    if (getFetching() === true) {
      return;
    }
    setFetching(true);
    this.fetchData();
  }

  fetchData() {
    const { unitId, category, startDate, endDate, byInvoiceDate } = this.props;
    if (
      _.isUndefined(unitId) ||
      _.isEmpty(category) ||
      _.isEmpty(startDate) ||
      _.isEmpty(endDate)
    ) {
      return;
    }

    const params = {
      unitId: unitId,
      category: category,
      startDate: startDate,
      endDate: endDate,
      byInvoiceDate: byInvoiceDate,
    };
    this.props.fetchTrendUnitGroupByGl(params);
  }

  switchChart() {
    const { chartType } = this.props;
    this.props.switchChartType(chartType === "pie" ? "trend" : "pie");
  }

  renderUnitChart() {
    const { data, chartType } = this.props;

    switch (chartType) {
      case "pie": {
        return <CogsAcrossUnitPieChart data={data} {...this.props} />;
      }
      case "trend": {
        return <CogsAcrossUnitTrendGroup data={data} {...this.props} />;
      }
      default: {
        return <div></div>;
      }
    }
  }

  render() {
    const { data, printView, widget_id, chartType } = this.props;

    return (
      <div className={"cogs-across-unit-container"}>
        {this.renderUnitChart()}
        <button
          onClick={this.switchChart}
          className="btn btn-small btn-primary btn-toggle switch-chart"
        >
          Show {chartType === "pie" ? "Trend" : "Pie"}
        </button>
        <div className={printView ? "" : "cogs-table-container"}>
          <CogsAcrossUnitTable
            printView={printView}
            data={data}
            widget_id={widget_id}
            {...this.props}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { reports, dashboard, cogs } = state;
  return {
    startDate: moment(reports.startDate).format("MM/DD/YYYY"),
    endDate: moment(reports.endDate).format("MM/DD/YYYY"),
    unitId: dashboard.activeWidget.unit_id,
    chartType: cogs.cogsAcrossUnitChartType,
    byInvoiceDate: state.widget_settings["cost"].byInvoiceDate,
  };
};

export default connect(mapStateToProps, {
  fetchTrendUnitGroupByGl,
  switchChartType,
})(CogsAcrossUnit);
