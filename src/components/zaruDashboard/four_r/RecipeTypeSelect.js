import React from 'react'
import 'styles/GlSelector.css'

const RecipeTypeSelect = ({
  recipeTypes,
  handleSelect,
  selectedTypeId,
  visible,
}) => {
  if (!visible) return <div />
  return (
    <div className="gl-container">
      <label htmlFor="gl-selector">Recipe Type</label>
      <select id="gl-selector" onChange={handleSelect} value={selectedTypeId}>
        {recipeTypes.map((recipeType) => (
          <option
            value={recipeType.CorporateRecipeUsageTypeID}
            key={recipeType.CorporateRecipeUsageTypeID}
          >
            {recipeType.Name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default RecipeTypeSelect
