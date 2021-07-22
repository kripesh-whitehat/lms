import PropTypes from 'prop-types'
import React from 'react'
import 'styles/DashboardsConfirmDeleteModal.css'
import Modal from 'components/Modal'
// import 'styles/DashboardCreateForm.css'

class DashboardsConfirmDeleteModal extends React.Component {
  render() {
    return (
      <Modal
        onSubmit={this.props.onSubmit}
        onClose={this.props.onClose}
        show={this.props.show}
        primaryActionText={this.props.primaryActionText}
        secondaryActionText={this.props.secondaryActionText}
        title="Delete This Dashboard"
        primaryButtonClass="btn-danger"
      >
        <div className="dashboards-confirm-delete-message">Are you sure?</div>
      </Modal>
    )
  }
}

DashboardsConfirmDeleteModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
}

export default DashboardsConfirmDeleteModal
