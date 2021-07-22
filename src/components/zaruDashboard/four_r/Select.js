import React from 'react'
import 'styles/GlSelector.css'

const RecipeTypeSelect = ({ options, handleSelect, selected, title }) => (
  <div
    className="gl-container"
    style={{ alignSelf: 'flex-end', marginTop: '-2em' }}
  >
    <label htmlFor="gl-selector">{title}</label>
    <select id="gl-selector" onChange={handleSelect} value={selected}>
      {options.map((option) => (
        <option value={option} key={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
)

export default RecipeTypeSelect
