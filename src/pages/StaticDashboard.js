import React, { Component } from 'react'
import { connect } from 'react-redux'
import { fetchLocations } from 'actions'
import 'styles/StaticDashboard.css'
import DashboardGrid from 'zaruDashboard/DashboardGrid'
import SideBar from 'zaruDashboard/SideBar'
import StartAndEndDatePicker from 'zaruDashboard/StartAndEndDatePicker'

class StaticDashboard extends Component {
  render() {
    const { id } = this.props.match.params
    return (
      <div className="static-dashboard">
        <SideBar />
        <div className="static-main flex">
          <StartAndEndDatePicker />
          <DashboardGrid dashboardId={id} />
        </div>
      </div>
    )
  }
}

export default connect(null, { fetchLocations })(StaticDashboard)
