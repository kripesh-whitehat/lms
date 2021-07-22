import _ from 'lodash'
import flow from 'lodash/flow'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { DropTarget } from 'react-dnd'
import ReactGridLayout from 'react-grid-layout'
import { connect } from 'react-redux'
import {
  fetchDashboard,
  fetchDashboards,
  setDashboardState,
  updateWidgets,
} from 'actions'
import 'styles/Dashboard.css'
import APSpendWidget from './ap_spend/APSpendWidget'
import BudgetVsActualWidget from './budget_vs_actual/BudgetVsActualWidget'
import CostWidget from './cost/CostWidget'
import FourRWidget from './four_r/FourRWidget'
import FullScreen from './FullScreen'
import VendorWidget from './vendor_spend/VendorWidget'
import Wrapper from './Wrapper'

const boxTarget = {
  drop() {
    return { name: 'Dustbin' }
  },
}

class DashboardGrid extends Component {
  constructor(props) {
    super(props)
    this.state = { widget: {}, fullscreenOpen: false }
    this.mapWidgets = this.mapWidgets.bind(this)
    this.handleLayoutChange = this.handleLayoutChange.bind(this)
    this.getWidget = this.getWidget.bind(this)
    this.widgetsToLayout = this.widgetsToLayout.bind(this)
    this.layoutToWidgets = this.layoutToWidgets.bind(this)
    this.onExpandClick = this.onExpandClick.bind(this)
    this.onCompressClick = this.onCompressClick.bind(this)
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const { token } = this.props.company
    if (token !== nextProps.company.token) {
      this.props.fetchDashboards(this.props.dashboardId)
    }
  }

  mapWidgets() {
    // create array of dom elements to display as widgets
    const { widgets } = this.props
    const filteredWidgets = widgets.filter((w) => !_.isEmpty(w.id))
    return filteredWidgets.map((widget) => (
      <Wrapper key={widget.id}>{this.getWidget(widget)}</Wrapper>
    ))
  }

  widgetsToLayout() {
    // convert layout in redux state to data for grid library
    const f = this.props.widgets.map((widget) => {
      const { x, y, w, h, id } = widget
      return { x, y, w, h, i: id }
    })
    return f
  }

  layoutToWidgets(layout) {
    // convert layout from grid library into data to send to api and save
    const { widgets } = this.props
    return layout.map((layoutItem) => {
      const { x, y, w, h } = layoutItem
      return {
        ...widgets.find((widget) => widget.id === layoutItem.i),
        x,
        y,
        w,
        h,
      }
    })
  }

  getWidget(widget, fullscreen = false) {
    // return widget based on name in redux state
    const fullscreenProps = fullscreen
      ? {
          admin: false,
          fullscreen: true,
          onCompressClick: this.onCompressClick,
        }
      : {}

    switch (widget.name) {
      case 'vendor_spend':
        return (
          <VendorWidget
            admin={this.props.admin}
            key={widget.id}
            onExpandClick={this.onExpandClick}
            id={widget.id}
            {...fullscreenProps}
          />
        )
      case 'ap_spend':
        return (
          <APSpendWidget
            admin={this.props.admin}
            key={widget.id}
            onExpandClick={this.onExpandClick}
            id={widget.id}
            {...fullscreenProps}
          />
        )
      case 'cost':
        return (
          <CostWidget
            admin={this.props.admin}
            key={widget.id}
            onExpandClick={this.onExpandClick}
            id={widget.id}
            {...fullscreenProps}
          />
        )
      case 'four_r':
        return (
          <FourRWidget
            admin={this.props.admin}
            key={widget.id}
            onExpandClick={this.onExpandClick}
            id={widget.id}
            {...fullscreenProps}
          />
        )
      case 'budget_vs_actual':
        return (
          <BudgetVsActualWidget
            admin={this.props.admin}
            key={widget.id}
            onExpandClick={this.onExpandClick}
            id={widget.id}
            {...fullscreenProps}
          />
        )
      default:
        return (
          <APSpendWidget
            admin={this.props.admin}
            key={widget.id}
            onExpandClick={this.onExpandClick}
            id={widget.id}
            {...fullscreenProps}
          />
        )
    }
  }

  handleLayoutChange(layout) {}

  onExpandClick(widgetId) {
    const widget = this.props.widgets.find((w) => w.id === widgetId)
    this.setState({ fullscreenOpen: true, widget })
    this.props.setDashboardState({
      fullscreenOpen: true,
      activeWidget: widget,
    })
  }

  onCompressClick() {
    this.setState({ fullscreenOpen: false })
    this.props.setDashboardState({
      fullscreenOpen: false,
      activeWidget: null,
      updatedInFullscreen: false,
    })
  }

  render() {
    // functions from the drag and drop library
    // allows for dropping widgets onto canvas
    // check out WidgetSelector and WidgetThumbnail components
    const { connectDropTarget } = this.props
    const layout = this.widgetsToLayout()

    const backgroundColor = 'inherit'

    const { widget } = this.state

    if (_.isEmpty(this.props.company.locations)) return <div />

    return connectDropTarget(
      <div className="wd-100">
        <div className="dashboard-drop-container" style={{ backgroundColor }}>
          <ReactGridLayout
            style={styles.container}
            className="layout"
            layout={layout}
            cols={38}
            rowHeight={30}
            width={1200}
            draggableCancel="input,textarea, button, a, rect, path"
            onLayoutChange={this.handleLayoutChange}
            isDraggable={false}
            isResizable={false}
          >
            {this.mapWidgets()}
          </ReactGridLayout>
          <FullScreen
            widgetContainer
            visible={this.state.fullscreenOpen}
            close={() => this.setState({ fullscreenOpen: false })}
          >
            {this.getWidget(widget, true)}
          </FullScreen>
        </div>
      </div>,
    )
  }
}

const styles = {
  container: {
    height: '100%',
    overflowY: 'scroll',
  },
}

DashboardGrid.defaultProps = {
  isStatic: false,
}

DashboardGrid.propTypes = {
  layout: PropTypes.array.isRequired,
  widgets: PropTypes.array.isRequired,
}

const mapStateToProps = (state) => ({
  layout: state.dashboard.layout,
  widgets: state.widgets.widgets,
  company: state.company,
})

// export default connect(mapStateToProps, { setDashboardLayout })(Dashboard)

export default flow(
  DropTarget('widget', boxTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  })),
  connect(mapStateToProps, {
    fetchDashboards,
    fetchDashboard,
    updateWidgets,
    setDashboardState,
  }),
)(DashboardGrid)
