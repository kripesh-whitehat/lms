import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { authorize } from 'actions'
import Home from 'pages/Home'
// import StaticDashboard from "./StaticDashboard";
// import MockIframe from "./MockIframe";
import LazyLoader from 'components/lazyLoader'
const ZaruDashboard = React.lazy(() =>
  import(/* webpackChunkName: "home" */ 'pages/ZaruDashboard'),
)
const StaticDashboard = React.lazy(() =>
  import(/* webpackChunkName: "staticdashboard" */ 'pages/StaticDashboard'),
)
const MockIframe = React.lazy(() =>
  import(/* webpackChunkName: "mockiframe" */ 'pages/MockIframe'),
)

class Routers extends Component {
  componentDidMount() {
    this.props.authorize()
  }

  render() {
    const basename = process.env.REACT_APP_BASE_URL ?? '/'
    return (
      <Router basename={basename}>
        <Switch>
          <Route
            exact
            path="/static-dashboard/:id"
            component={LazyLoader(StaticDashboard)}
          />
          <Route exact path="/" component={Home} />
          <Route
            exact
            path="/zarudashboard"
            component={LazyLoader(ZaruDashboard)}
          />
          <Route exact path="/mock-iframe" component={LazyLoader(MockIframe)} />
          {/* <Redirect from="/" to="/zarudashboard"/> */}
        </Switch>
      </Router>
    )
  }
}

export default connect(null, { authorize })(Routers)
