import React from 'react'
import 'styles/MockIframe.css'

const MockIframe = () => (
  <div className="mock-iframe-container">
    <div className="mock-topbar" />
    <div className="mock-body">
      <div className="mock-sidebar" />
      <iframe
        title="test-iframe"
        className="mock-iframe"
        src="http://localhost:3001?user_id=370&unit_id=4071"
      />
    </div>
  </div>
)

export default MockIframe
