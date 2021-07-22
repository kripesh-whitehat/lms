import flow from 'lodash/flow'
import React from 'react'
import { DragSource } from 'react-dnd'
import { connect } from 'react-redux'
import { addWidgetToDashboard, createWidget } from 'actions'
import 'styles/WidgetThumbnail.css'

// Drag sources and drop targets only interact
// if they have the same string type.
// You want to keep types in a separate file with
// the rest of your app's constants.
const Types = {
  WIDGET: 'widget',
}

/**
 * Specifies the drag source contract.
 * Only `beginDrag` function is required.
 */
const cardSource = {
  beginDrag(props) {
    // Return the data describing the dragged item
    const item = { id: props.id }
    return item
  },

  endDrag(props, monitor, component) {
    if (!monitor.didDrop()) {
      return
    }

    props.createWidget(props.widgetType)
  },
}

/**
 * Specifies which props to inject into your component.
 */
function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDragSource: connect.dragSource(),
    // You can ask the monitor about the current drag state:
    isDragging: monitor.isDragging(),
  }
}

class WidgetThumbnail extends React.Component {
  render() {
    const { connectDragSource } = this.props

    return connectDragSource(
      <div className="widget-thumbnail-container">
        <img className="widget-thumbnail" src={this.props.source} />
        <div className="widget-thumbnail-title">{this.props.title}</div>
      </div>,
    )
  }
}

// Export the wrapped version
export default flow(
  DragSource(Types.WIDGET, cardSource, collect),
  connect(null, { addWidgetToDashboard, createWidget }),
)(WidgetThumbnail)
