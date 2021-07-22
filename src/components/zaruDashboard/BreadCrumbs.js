import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setChartType, sliceHistory } from 'actions'
import 'styles/BreadCrumbs.css'

class BreadCrumbs extends Component {
  constructor(props) {
    super(props)
    this.mapHistory = this.mapHistory.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  mapHistory() {
    // history is an array of objects of chart types and breadcrumbs in redux
    const { history } = this.props
    return history.slice().map((step, index) => {
      const crumb = step.breadcrumb
        ? String(step.breadcrumb).replace(/_/gi, ' ')
        : step.chartType
      const content = crumb.toUpperCase()
      // set bread crumbs on drilldown
      if (index === history.length - 1) {
        return (
          <div className="bread-crumb" id="active" key={Math.random()}>
            <a
              id="active"
              className="bread-crumb-text"
              onClick={(event) =>
                this.handleClick(event, step.chartType, index)
              }
            >
              {content}
            </a>
          </div>
        )
        // set bread crumbs on drilling back up
      }
      return (
        <div className="bread-crumb" key={Math.random()}>
          <a
            className="bread-crumb-text"
            onClick={(event) => this.handleClick(event, step.chartType, index)}
          >
            {content}
          </a>
          <div className="bread-crumb-arrow"> {'=>'} </div>
        </div>
      )
    })
  }

  handleClick(event, chartType, index) {
    event.preventDefault()
    const { widgetId, printView } = this.props
    if (printView) return
    this.props.setChartType(widgetId, chartType)
    this.props.sliceHistory(widgetId, index)
  }

  render() {
    return <div id="bread-crumbs-container">{this.mapHistory()}</div>
  }
}

BreadCrumbs.defaultProps = {
  history: [],
}

export default connect(null, { setChartType, sliceHistory })(BreadCrumbs)
