import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  editDashboardTitle,
  setEditingDashboardTitle,
  setSelectedDashboard,
} from 'actions'
import 'styles/DashboardPlaceholder.css'

const moveCursorToEnd = (e) => {
  const temp_value = e.target.value
  e.target.value = ''
  e.target.value = temp_value
}

const PlaceholderTitle = (props) => {
  const { index, editingTitle, selectedDashboard, items } = props
  if (editingTitle && selectedDashboard === index) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <input
          className="placeholder-title-input"
          onBlur={() => props.setEditingDashboardTitle(false)}
          onChange={(event) =>
            props.editDashboardTitle(event.target.value, props.index)
          }
          value={items[props.index].title}
          onFocus={moveCursorToEnd}
          autoFocus
        />
        <input type="submit" style={{ display: 'none' }} />
      </form>
    )
  }

  return (
    <div className="placeholder-title">
      {props.title !== '' ? props.title : 'Untitled'}
    </div>
  )
}

const DashboardPlaceholder = (props) => {
  const {
    onDeletePress,
    setSelectedDashboard,
    setEditingDashboardTitle,
    editDashboardTitle,
    editingTitle,
    selectedDashboard,
    title,
    ...filteredProps
  } = props

  return (
    <div
      id="placeholder-container"
      key={props.key}
      {...filteredProps}
      onClick={() => setSelectedDashboard(props.index)}
    >
      <Link className="add-container" to="/">
        {props.children}
      </Link>
      <div className="placeholder-footer">
        <PlaceholderTitle {...props} />
        <div className="placeholder-edit-options">
          <div
            className="fa fa-pencil"
            id="placeholder-edit"
            aria-hidden="true"
            onClick={() => props.setEditingDashboardTitle(true)}
          />
          <div
            className="fa fa-trash-o"
            id="placeholder-delete"
            aria-hidden="true"
            onClick={onDeletePress}
          />
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  const { items, editingTitle, selectedDashboard } = state.dashboards
  return { items, editingTitle, selectedDashboard }
}
export default connect(mapStateToProps, {
  setSelectedDashboard,
  setEditingDashboardTitle,
  editDashboardTitle,
})(DashboardPlaceholder)
