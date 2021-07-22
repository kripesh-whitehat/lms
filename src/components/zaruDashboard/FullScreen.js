import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import 'styles/FullScreen.css'

class FullScreen extends React.Component {
  constructor(props) {
    super(props)
    this._handleKeyDown = this._handleKeyDown.bind(this)
  }

  _handleKeyDown(e) {
    if (e.code === 'Escape') {
      this.props.close()
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this._handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._handleKeyDown)
  }

  render() {
    const { widgetContainer, sidebarOpen } = this.props
    const className =
      sidebarOpen && widgetContainer
        ? 'backdrop backdrop-sidebar-open'
        : 'backdrop'
    if (!this.props.visible) {
      return null
    }

    return (
      <div className={className}>
        <div className="dialog">{this.props.children}</div>
      </div>
    )
  }
}

FullScreen.defaultProps = {
  primaryButtonClass: '',
  widgetContainer: false,
}

FullScreen.propTypes = {
  close: PropTypes.func.isRequired,
  visible: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  sidebarOpen: state.dashboard.sidebarOpen,
})

export default connect(mapStateToProps)(FullScreen)
