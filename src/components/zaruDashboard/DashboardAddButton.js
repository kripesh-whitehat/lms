import React from 'react'
import 'styles/DashboardAddButton.css'

const DashboardAddButton = (props) => {
  const { onDeletePress, setSelectedDashboard, ...filteredProps } = props
  return (
    <div
      id="placeholder-container"
      key={props.key}
      {...filteredProps}
      onClick={props.onClick}
    >
      <div className="add-container">{props.children}</div>
      <div className="placeholder-footer">
        <div className="placeholder-title">{props.title}</div>
      </div>
    </div>
  )
}

export default DashboardAddButton
