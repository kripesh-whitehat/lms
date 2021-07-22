import React, { Component } from 'react'
import 'styles/TableFilter.css'

class TableFilter extends Component {
  constructor(props) {
    super(props)
    this.state = { filterIsVisible: false }
    this.handleInputClick = this.handleInputClick.bind(this)
    this.isChecked = this.isChecked.bind(this)
  }
  handleSelectChange(value) {
    this.props.handleChange(value, this.props.name)
  }

  handleInputClick() {
    this.setState({ filterIsVisible: !this.state.filterIsVisible })
  }

  isChecked(value) {
    return this.props.selectedOptions.includes(value)
  }

  mapOptions(options) {
    return options.map((option) => {
      const checked = true
      return (
        <div onClick={() => this.handleSelectChange(option)} className='table-filter-option-container' key={option}>
          <input readOnly type='checkbox' checked={this.isChecked(option)} className='table-filter-option-checkbox' />
          <div className='table-filter-option-label'>{option}</div>
        </div>
      )
    })
  }

  render() {
    const { handleChange, value, options, selectedOptions } = this.props
    const { filterIsVisible } = this.state
    return (
      <div className='table-filter-container'>
        <input readOnly value={selectedOptions.join()} onClick={this.handleInputClick} />
        <div style={{ display: filterIsVisible ? 'flex' : 'None' }} className='table-filter-options'>
          { this.mapOptions(options) }
        </div>
      </div>
    )
  }
}

TableFilter.defaultProps = {
  handleChange: (event) => { console.log(event) },
  name: ''
  // value: "all"
}

export default TableFilter
