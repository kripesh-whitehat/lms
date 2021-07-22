import PropTypes from 'prop-types'
import React from 'react'
import 'styles/DashboardCreateForm.css'

class DashboardCreateForm extends React.Component {
  render() {
    return (
      <form className="dashboard-create-form" onSubmit={this.props.onSubmit}>
        <div className="dashboard-create-label">
          What would you like to call it?
        </div>
        <input
          id="dashboard-create-input"
          value={this.props.inputValue}
          onChange={(event) => this.props.onInputChange(event.target.value)}
        />
        <input type="submit" style={{ display: 'none' }} />
      </form>
    )
  }
}

DashboardCreateForm.propTypes = {
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  inputValue: PropTypes.string.isRequired,
}

export default DashboardCreateForm
