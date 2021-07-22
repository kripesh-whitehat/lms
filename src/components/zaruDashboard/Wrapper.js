import React, { Component } from 'react'

class Wrapper extends Component {
  pixelsFromString(style) {
    return style.match(/\d/g).join('')
  }

  dimensions() {
    const { height, width } = this.props.style
    return {
      widgetHeight: this.pixelsFromString(height),
      widgetWidth: this.pixelsFromString(width),
    }
  }

  render() {
    const { widgetHeight, widgetWidth } = this.dimensions()
    const childrenWithProps = React.Children.map(this.props.children, (child) =>
      React.cloneElement(child, { widgetHeight, widgetWidth }),
    )
    return <div {...this.props}>{childrenWithProps}</div>
  }
}

export default Wrapper
