import CryptoJS from 'crypto-js'
import _ from 'lodash'
import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { restoreState } from 'actions'
import WidgetSwitch from './WidgetSwitch'

const widgetTitles = {
  vendor_spend: 'Vendor Spend',
  ap_spend: 'Ap Spend',
  cost: 'Cost of Sales',
  four_r: 'Four R',
}

class PrintWidget extends Component {
  componentDidMount() {
    setTimeout(() => {
      window.print()
      localStorage.removeItem('zaru-widgets')
    }, 2000)
  }

  render() {
    const params = new URLSearchParams(window.location.search)
    const encryptedState = localStorage.getItem('zaru-widgets')
    if (_.isEmpty(encryptedState)) return <div />
    const decryptedBytes = CryptoJS.AES.decrypt(
      encryptedState,
      process.env.REACT_APP_SECRET_KEY,
    )
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8)
    const reduxState = JSON.parse(decryptedText)
    const widgetId = params.get('widget_id')
    const widget = this.props.widgets.find((widget) => widget.id === widgetId)
    if (!_.isEmpty(widget)) {
      const { startDate, endDate } = this.props.reports
      document.title = `${widgetTitles[widget.name]} ${moment(startDate).format(
        'MM-DD-YYYY',
      )} - ${moment(endDate).format('MM-DD-YYYY')}`
    }

    if (_.isEmpty(this.props.widgets)) {
      const { startDate, endDate } = reduxState.reports
      reduxState.reports.startDate = moment(Date.parse(startDate))
      reduxState.reports.endDate = moment(Date.parse(endDate))
      reduxState.widgets.widgets.forEach((widget) => {
        if (!_.isEmpty(widget.startDate) && !_.isEmpty(widget.endDate)) {
          widget.startDate = moment(Date.parse(widget.startDate))
          widget.endDate = moment(Date.parse(widget.endDate))
        }
      })
      this.props.restoreState(reduxState)
    }

    if (_.isEmpty(widget)) return <div />
    return <WidgetSwitch widget={widget} fullscreen printView />
  }
}

const mapStateToProps = (state) => ({
  company: state.company,
  widgets: state.widgets.widgets,
  reports: state.reports,
})

export default connect(mapStateToProps, { restoreState })(PrintWidget)
