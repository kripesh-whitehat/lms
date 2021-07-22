import React from 'react'
import 'styles/SelectorItem.css'

const SelectorItem = ({ onClick, source, title, type, disabled }) => {
  const opacity = disabled ? 0.35 : 1
  const inUse = disabled ? ' (In Use)' : ''
  return (
    <div
      className="selector-item-container"
      onClick={disabled ? null : () => onClick(type)}
      style={{ opacity }}
    >
      <img className="selector-item" alt="selector-item" src={source} />
      <div className="selector-item-title">{title + inUse}</div>
    </div>
  )
}

export default SelectorItem
