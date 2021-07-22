import PropTypes from 'prop-types'
import React from 'react'
import 'styles/Modal.css'

function Modal(props) {
  if (!props.show) {
    return null
  }

  return (
    <div className="backdrop">
      <div className="dialog">
        <div className="dialog-header">
          <span className="dialog-title">{props.title}</span>
        </div>

        {props.children}

        <div className="dialog-footer">
          <button type="button" className="btn" onClick={props.onClose}>
            {props.secondaryActionText}
          </button>
          <button
            type="button"
            className={`btn btn-primary ${props.primaryButtonClass}`}
            onClick={props.onSubmit}
          >
            {props.primaryActionText}
          </button>
        </div>
      </div>
    </div>
  )
}

Modal.defaultProps = {
  primaryButtonClass: '',
}

Modal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  primaryActionText: PropTypes.string.isRequired,
  primaryButtonClass: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default Modal
