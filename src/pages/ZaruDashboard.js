import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Route } from 'react-router-dom'
import { authorize, fetchLocations } from 'actions'
import 'styles/ZaruDashboard.css'
import Dashboard from 'zaruDashboard/Dashboard'
import Dashboards from 'zaruDashboard/Dashboards'
import PrintWidget from 'zaruDashboard/PrintWidget'
import SelectorModal from 'zaruDashboard/SelectorModal'
import SideBar from 'zaruDashboard/SideBar'
import LoadingIndicator from 'components/LoadingIndicator'

class ZaruDashboard extends Component {
  constructor(props) {
    super(props)
    this.state = { selectorModalOpen: false }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const { widgets, didFetch } = nextProps.widgets
    if (_.isEmpty(widgets) && didFetch && !this.state.selectorModalOpen) {
      this.setState({ selectorModalOpen: true })
    }
  }

  render() {
    const { selectorModalOpen } = this.state
    const params = new URLSearchParams(window.location.search)
    if (params.get('print_widget')) return <PrintWidget />
    return (
      <div className="main-wrap">
        <div className="main-container">
          <div className="spinner-overlay">
            <LoadingIndicator isLoading={this.props.isDataFetching} />
          </div>
          <SelectorModal
            visible={selectorModalOpen}
            close={() => this.setState({ selectorModalOpen: false })}
          />
          <SideBar
            openSelector={() => this.setState({ selectorModalOpen: true })}
          />
          <Route exact path="/zarudashboard" component={Dashboard} />
          <Route
            exact
            path="/zarudashboard/dashboards"
            component={Dashboards}
          />
          <Route
            exact
            path="/zarudashboard/dashboards/:id"
            component={Dashboard}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { isDataFetching } = state.dashboards

  return { widgets: state.widgets, isDataFetching }
}

export default connect(mapStateToProps, { fetchLocations, authorize })(
  ZaruDashboard,
)
