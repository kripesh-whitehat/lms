import CryptoJS from 'crypto-js'
import _ from 'lodash'
import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { destroyWidget, fetchReport, setDrilldownIndex } from 'actions'
import Watermark from 'assets/images/rsi-logo.jpeg'
import 'styles/Widget.css'
import { selectedDivisions, selectedUnits } from 'utils'
import LoadingIndicator from 'components/LoadingIndicator'
import BreadCrumbs from './BreadCrumbs'
import InvoiceDateToggle from './InvoiceDateToggle'

class Widget extends Component {
  constructor(props) {
    super(props)
    this.state = { settingsVisible: false }
    this.toggleSettingsVisible = this.toggleSettingsVisible.bind(this)
    this.dataIsAvailable = this.dataIsAvailable.bind(this)
    this.renderChildrenWhenLoaded = this.renderChildrenWhenLoaded.bind(this)
    this.printDocument = this.printDocument.bind(this)
  }

  UNSAFE_componentWillMount() {
    if (this.props.shouldFetch) {
      this.props.fetchReport(
        this.props.id,
        this.props.type,
        this.props.urlParams,
      )
    }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    if (this.props.shouldFetch) {
      const newUrlParams = nextProps.urlParams !== this.props.urlParams
      if (
        newUrlParams ||
        (!this.dataIsAvailable(nextProps) && this.isNotFetching(this.props))
      ) {
        this.props.fetchReport(
          nextProps.id,
          nextProps.type,
          this.props.urlParams,
        )
      }
    }
  }

  printDocument(event) {
    const reduxState = JSON.stringify(this.props.state)
    const encryptedState = CryptoJS.AES.encrypt(
      reduxState,
      process.env.REACT_APP_SECRET_KEY,
    ).toString()
    localStorage.setItem('zaru-widgets', encryptedState)
    window.open(`/?print_widget=true&widget_id=${this.props.id}`)
  }

  renderChildrenWhenLoaded() {
    if (this.dataIsAvailable(this.props) && !this.props.cogsIsLoading) {
      return this.props.children
    }
  }

  isNotFetching(props) {
    const { reports, id, type } = props
    return reports[id] && [type] && !reports[id].fetchingData
  }

  dataIsAvailable(props) {
    return this.isNotFetching(props)
  }

  toggleSettingsVisible() {
    this.setState({ settingsVisible: !this.state.settingsVisible })
  }

  render() {
    const {
      reports,
      title,
      id,
      admin,
      onExpandClick,
      onCompressClick,
      fullscreen,
      showDatesCanvas,
      dates,
      widgets,
      printView,
      company,
    } = this.props

    // show dates passed in by props or datepicker dates
    const displayDates = showDatesCanvas
      ? dates
      : {
          startDate: moment(reports.startDate).format('MM/DD/YYYY'),
          endDate: moment(reports.endDate).format('MM/DD/YYYY'),
        }
    const datesStyle = {
      display:
        (showDatesCanvas || fullscreen) && !_.isEmpty(displayDates.startDate)
          ? 'flex'
          : 'none',
    }
    const containerClass = printView
      ? 'widget-container print-view'
      : 'widget-container'
    const widget = widgets.find((w) => w.id === id)
    const headerClass = printView
      ? 'widget-header print-header'
      : 'widget-header'
    if (printView)
      document.querySelectorAll(':button').forEach((button) => {
        button.style.display = 'none'
      })

    const { cogsIsLoading } = this.props
    return (
      <div
        className={containerClass}
        id={`${id}${fullscreen ? '-fullscreen' : ''}`}
      >
        <div className={headerClass}>
          <div className="widget-title">{title}</div>
          <div
            className="widget-group-name"
            style={{ display: printView ? 'flex' : 'none' }}
          >
            {company.group_name}
          </div>
          <div className="widget-dates" style={datesStyle}>
            {displayDates.startDate} - {displayDates.endDate}
          </div>
          <div
            className="widget-dates"
            style={{ display: printView ? 'flex' : 'none' }}
          >
            <div className="header-label">Report Generated: </div>
            {moment().format('MM/DD/YYYY h:mm A')}
          </div>
          <div
            className="widget-dates"
            style={{ display: printView ? 'flex' : 'none' }}
          >
            <div className="header-label">Divisions Reporting: </div>
            {`  ${selectedDivisions(company.locations).map(
              (division) => ` ${division.name}`,
            )}`}
          </div>
          <div
            className="widget-dates"
            style={{ display: printView ? 'flex' : 'none' }}
          >
            <div className="header-label">Units Reporting: </div>
            {`  ${selectedUnits(company.locations).map(
              (loc) => ` ${loc.name.split(' ')[0]}`,
            )}`}
          </div>
          <div className="widget-btns">
            <i
              className="fa fa-trash widget-settings-icon"
              aria-hidden="true"
              style={{ display: admin ? 'flex' : 'none' }}
              onClick={() => {
                this.props.destroyWidget(id)
              }}
              ref={(iconRef) => (this.iconRef = iconRef)}
            />
            <i
              className="fa fa-print widget-settings-icon"
              aria-hidden="true"
              onClick={this.printDocument}
              style={{ display: fullscreen && !printView ? 'flex' : 'none' }}
              ref={(iconRef) => (this.iconRef = iconRef)}
            />
            <i
              className="fa fa-expand widget-settings-icon"
              aria-hidden="true"
              style={{ display: fullscreen ? 'none' : 'flex' }}
              onClick={() => onExpandClick(id)}
              ref={(iconRef) => (this.iconRef = iconRef)}
            />
            <i
              className="fa fa-close widget-settings-icon"
              aria-hidden="true"
              style={{ display: fullscreen && !printView ? 'flex' : 'none' }}
              onClick={onCompressClick}
              ref={(iconRef) => (this.iconRef = iconRef)}
            />
          </div>
        </div>
        <BreadCrumbs
          history={widget.history}
          widgetId={id}
          printView={printView}
        />
        {fullscreen && <InvoiceDateToggle widget={widget} widgetId={id} />}
        <div className="widget-body">
          <LoadingIndicator
            isLoading={!this.dataIsAvailable(this.props) || cogsIsLoading}
          />
          {!cogsIsLoading && this.renderChildrenWhenLoaded()}
        </div>
        <img
          className="watermark"
          style={{ display: printView ? 'fixed' : 'none' }}
          src={Watermark}
          alt="watermark"
        />
      </div>
    )
  }
}

Widget.defaultProps = {
  fetchReport: () => null,
  type: null,
  urlParams: '?start_date=01/01/2017&end_date=02/01/2017&user_id=140',
  shouldFetch: true,
  admin: false,
  fullscreen: false,
  showDates: false,
}

const mapStateToProps = (state) => ({
  reports: state.reports,
  widgets: state.widgets.widgets,
  state,
  company: state.company,
  cogsIsLoading: state.cogs.isLoading,
})

export default connect(mapStateToProps, {
  fetchReport,
  setDrilldownIndex,
  destroyWidget,
})(Widget)
