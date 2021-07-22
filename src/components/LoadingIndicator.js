import React from 'react'
import Spinner from 'react-spinkit'
import 'styles/LoadingIndicator.css'

const LoadingIndicator = ({ isLoading }) => {
  const display = isLoading ? 'flex' : 'none'

  return (
    <div className="spinner-container" style={{ display }}>
      <Spinner name="ball-pulse-rise" color="orange" id="spinner" />
    </div>
  )
}

LoadingIndicator.defaultProps = {
  isLoading: false,
}

export default LoadingIndicator
