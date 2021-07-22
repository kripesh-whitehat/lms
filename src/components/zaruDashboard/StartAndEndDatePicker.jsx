import { fetchDates, setCompanyData, setGlobalReportAttribute } from 'actions'
import _ from 'lodash'
import moment from 'moment'
import 'moment/locale/it'
import React, { Component } from 'react'
import DayPickerInput from 'react-day-picker/DayPickerInput'
import 'react-day-picker/lib/style.css'
import { formatDate } from 'react-day-picker/moment'
import { connect } from 'react-redux'
import 'styles/StartAndEndDatePicker.css'
import { selectedUnits, setFetching } from 'utils'

const allowedFormats = [
  'MM/DD/YYYY',
  'MM/D/YYYY',
  'M/DD/YYYY',
  'M/D/YYYY',
  'MM/DD/YY',
  'MM/D/YY',
  'M/DD/YY',
  'M/D/YY',
]
const currentYear = moment().format('YYYY')

class StartAndEndDatePicker extends Component {
  constructor(props) {
    super(props)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleDayPickerHide = this.handleDayPickerHide.bind(this)
    this.fetchCalendarRanges = this.fetchCalendarRanges.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this)
    this.handleRangeStartDateChange = this.handleRangeStartDateChange.bind(this)
    this.handleRangeEndDateChange = this.handleRangeEndDateChange.bind(this)
    this.handleYearChange = this.handleYearChange.bind(this)
    this.mapDates = this.mapDates.bind(this)
    this.mapYears = this.mapYears.bind(this)
  }

  UNSAFE_componentWillUpdate(nextProps) {
    if (!_.isEqual(this.props.company.locations, nextProps.company.locations)) {
      this.fetchCalendarRanges(nextProps)
    }
  }

  fetchCalendarRanges(props = this.props, year = currentYear) {
    const { locations } = props.company
    const unitIds = selectedUnits(locations).map((loc) => loc.unit_id)
    this.props.fetchDates(unitIds, year)
  }

  handleBlur(event, attribute) {
    setFetching(false)
    const value = new Date(event.relatedTarget?.getAttribute('aria-label'))
    const fieldValue = moment(this.props[attribute]).format('MM/DD/YYYY')
    if (fieldValue !== value) {
      const date = moment(value, allowedFormats, true)
      if (date.isValid()) {
        this.props.setGlobalReportAttribute({
          [attribute]: date || this.props[attribute],
        })
        this[attribute].setState({
          value: date.format('MM/DD/YYYY'),
          typedValue: date.format('MM/DD/YYYY'),
        })
      } else {
        this[attribute].setState({
          value: fieldValue,
          typedValue: fieldValue,
        })
      }
    }
  }

  handleDayPickerHide(attribute) {
    if (this[attribute]) this[attribute].getInput().blur()
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.target.blur()
    }
  }

  parseDay(value, attribute) {
    const date = moment(value, allowedFormats, true)
    if (!date.isValid()) return this.props[attribute].toDate()
    return date.toDate()
  }

  handleIconClick(attribute) {
    if (this[attribute]) this[attribute].getInput().focus()
  }

  handleRangeChange(event) {
    const currentRange = event.target.value
    const { calendarRanges } = this.props.company
    this.props.setCompanyData({ currentRange })
    this.props.setGlobalReportAttribute({ startRange: 'none' })
    this.props.setGlobalReportAttribute({ endRange: 'none' })
    if (_.isEmpty(calendarRanges[currentRange])) return
  }

  handleRangeStartDateChange(event) {
    const {
      endRange,
      company: { calendarRanges, currentRange },
    } = this.props
    const startRange = event.target.value
    this.props.setGlobalReportAttribute({ startDate: moment(startRange) })
    this.props.setGlobalReportAttribute({ startRange })
    if (endRange === 'none' || moment(endRange).isBefore(startRange)) {
      const endRange = calendarRanges[currentRange].find(
        (range) => range.StartDate === startRange,
      ).EndDate
      this.props.setGlobalReportAttribute({ endRange })
      this.props.setGlobalReportAttribute({ endDate: moment(endRange) })
    }
  }

  handleRangeEndDateChange(event) {
    const {
      startRange,
      company: { calendarRanges, currentRange },
    } = this.props
    const endRange = event.target.value
    this.props.setGlobalReportAttribute({ endDate: moment(endRange) })
    this.props.setGlobalReportAttribute({ endRange })
    if (startRange === 'none' || moment(startRange).isAfter(endRange)) {
      const startRange = calendarRanges[currentRange].find(
        (range) => range.EndDate === endRange,
      ).StartDate
      this.props.setGlobalReportAttribute({ startRange })
      this.props.setGlobalReportAttribute({ startDate: moment(startRange) })
    }
  }

  handleYearChange(event) {
    this.fetchCalendarRanges(this.props, event.target.value)
    this.props.setCompanyData({ yearChanged: true })
    this.props.setGlobalReportAttribute({ selectedYear: event.target.value })
    this.props.setGlobalReportAttribute({ startRange: 'none' })
    this.props.setGlobalReportAttribute({ endRange: 'none' })
  }

  mapYears() {
    const numYears = Number(currentYear) - 2010 + 1
    const years = [...Array(numYears).keys()].map((diff) => currentYear - diff)
    return years.map((year) => (
      <option key={year} value={String(year)}>
        {year}
      </option>
    ))
  }

  mapDates(type) {
    const { currentRange, calendarRanges } = this.props.company
    const ranges = calendarRanges[currentRange] || []

    const displayHash = {}
    const options = _.compact(
      ranges.map((range) => {
        const date = moment(range[type]).format('MM/DD/YYYY')
        const week =
          currentRange === 'WeeklyRanges' ? ` - Week ${range.WeekNumber}` : ''
        const periodAndDate = `Period ${range.PeriodNumber}${week}: ${date}`
        const displayDate =
          currentRange === 'YearlyRanges' ? date : periodAndDate
        if (displayHash[displayDate] === undefined) {
          displayHash[displayDate] = displayDate
          return (
            <option key={`${range[type]}-${Math.random()}`} value={range[type]}>
              {displayDate}
            </option>
          )
        } else {
          return undefined
        }
      }),
    )

    return [
      <option key={`no-range-${type}`} value="none" disabled></option>,
      ...options,
    ]
  }

  render() {
    const {
      company: { currentRange },
      startRange,
      endRange,
      selectedYear,
    } = this.props
    return (
      <div className="start-end-date-picker-container">
        <div>Custom Start Date</div>
        <div className="date-picker-row">
          <DayPickerInput
            value={moment(this.props.startDate).format('MM/DD/YYYY')}
            formatDate={formatDate}
            parseDate={(value) => this.parseDay(value, 'startDate')}
            ref={(el) => (this.startDate = el)}
            onDayPickerHide={() => this.handleDayPickerHide('startDate')}
            placeholder="MM/DD/YYYY"
            inputProps={{
              onKeyPress: (event) => this.handleKeyPress(event),
              onBlur: (event) => this.handleBlur(event, 'startDate'),
              className: 'date-picker-input',
            }}
          />
          <i
            className="fa fa-calendar fa-lg icon-inactive date-icon"
            onClick={() => this.handleIconClick('startDate')}
          />
        </div>
        <div>Custom End Date</div>
        <div className="date-picker-row">
          <DayPickerInput
            value={moment(this.props.endDate).format('MM/DD/YYYY')}
            formatDate={formatDate}
            parseDate={(value) => this.parseDay(value, 'endDate')}
            ref={(el) => (this.endDate = el)}
            onDayPickerHide={() => this.handleDayPickerHide('endDate')}
            placeholder="MM/DD/YYYY"
            inputProps={{
              onKeyPress: (event) => this.handleKeyPress(event),
              onBlur: (event) => this.handleBlur(event, 'endDate'),
              className: 'date-picker-input',
            }}
          />
          <i
            className="fa fa-calendar fa-lg icon-inactive date-icon"
            onClick={() => this.handleIconClick('endDate')}
          />
        </div>
        <br />
        <div>Reporting Year</div>
        <select
          className="date-select"
          value={selectedYear}
          onChange={this.handleYearChange}
        >
          {this.mapYears()}
        </select>
        <div>Range</div>
        <select
          onChange={this.handleRangeChange}
          value={currentRange}
          className="date-select"
        >
          <option value="WeeklyRanges">Week</option>
          <option value="PeriodRanges">Period</option>
          <option value="YearlyRanges">Year</option>
        </select>
        <div>Start Date</div>
        <select
          className="date-select"
          onChange={this.handleRangeStartDateChange}
          value={startRange}
        >
          {this.mapDates('StartDate')}
        </select>
        <div>End Date</div>
        <select
          className="date-select"
          onChange={this.handleRangeEndDateChange}
          value={endRange}
        >
          {this.mapDates('EndDate')}
        </select>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { startDate, endDate, startRange, endRange, selectedYear } =
    state.reports

  return {
    startDate,
    endDate,
    startRange,
    endRange,
    selectedYear,
    company: state.company,
  }
}

export default connect(mapStateToProps, {
  setGlobalReportAttribute,
  fetchDates,
  setCompanyData,
})(StartAndEndDatePicker)
