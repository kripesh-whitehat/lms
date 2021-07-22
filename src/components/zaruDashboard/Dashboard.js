import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'styles/Dashboard.css'
import DashboardGrid from './DashboardGrid'

class Dashboard extends Component {
  render() {
    const { error } = this.props.company
    const { isFullScreen } = this.props
    return (
      <div
        className={
          isFullScreen
            ? 'dashboard-container fullscreen'
            : 'dashboard-container'
        }
      >
        {this.props.company.error ? (
          <div className="general-error">
            <i className="fa fa-exclamation-circle" id="error-icon"></i>
            <div>{error}</div>
          </div>
        ) : (
          <DashboardGrid admin dashboardId={this.props.match.params.id} />
        )}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isFullScreen: state.dashboard.fullscreenOpen,
  company: state.company,
})

export default connect(mapStateToProps)(Dashboard)
