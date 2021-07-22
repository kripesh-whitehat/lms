import React from 'react'
import 'styles/GlSelector.css'

const GlSelector = ({ gls, handleGlSelect, glCode }) => (
  <div className="gl-container">
    <label htmlFor="gl-selector">GL Subcategory</label>
    <select id="gl-selector" onChange={handleGlSelect} value={glCode}>
      <option value="ALL" key="ALL">
        ALL
      </option>
      {gls.map((gl) => (
        <option value={gl.gl_code} key={gl.gl_code}>
          {gl.gl_name}
        </option>
      ))}
    </select>
  </div>
)

export default GlSelector
