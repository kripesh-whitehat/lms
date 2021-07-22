import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setDashboardState } from 'actions'
import 'styles/SideBar.css'
import LocationPicker from './LocationPicker'
import StartAndEndDatePicker from './StartAndEndDatePicker'

class Sidebar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      sidebarOpen: false,
      hovering: false
    }

    this.onSetSidebarToggle = this.onSetSidebarToggle.bind(this)
    this.offHover = this.offHover.bind(this)
    this.onHover = this.onHover.bind(this)
  }

  onSetSidebarToggle() {
    const { sidebarOpen } = this.state
    this.setState({ sidebarOpen: !sidebarOpen, hovering: false })
    this.props.setDashboardState({ sidebarOpen: !sidebarOpen })
  }

  offHover() {
    const { sidebarOpen } = this.state
    this.setState({ hovering: false })
    if (!sidebarOpen) {
      this.props.setDashboardState({ sidebarOpen: false })
    }
  }

  onHover() {
    this.setState({ hovering: true })
    this.props.setDashboardState({ sidebarOpen: true })
  }



  render() {
    const { sidebarOpen, hovering } = this.state
    const collapseClass = sidebarOpen || hovering ? 'sidebar-open' : 'sidebar-collapsed'
    const iconColor = sidebarOpen ? 'black' : 'darkgrey'
    return (
      <div className={`sidebar-container ${collapseClass}`} id='sidebar' onMouseLeave={this.offHover} >
        <div
          className="fa fa-bars  fa-lg sidebar-toggle"
          style={{ color: iconColor }}
          onClick={this.onSetSidebarToggle}
          onMouseEnter={this.onHover}
          // onMouseLeave={this.offHover}
        />
        <div className='sidebar-content'>
          <button
            className={`btn btn-lg btn-primary btn-toggle`}
            id="add-widget-btn"
            onClick={this.props.openSelector}
            disabled={this.props.fullscreenOpen}
          >
            Add Widget
          </button>
          <StartAndEndDatePicker />
          <LocationPicker />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({ fullscreenOpen: state.dashboard.fullscreenOpen })

export default connect(mapStateToProps, { setDashboardState })(Sidebar)
