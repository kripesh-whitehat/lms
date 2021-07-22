import { SET_SELECTED_RECIPES, UPDATE_SELECTED_RECIPES } from 'actions/types'

const INITIAL_STATE = {
  selectedRecipes: [],
}

export default (state = INITIAL_STATE, action = null) => {
  switch (action.type) {
    case SET_SELECTED_RECIPES: {
      return { ...state, selectedRecipes: action.selectedRecipes }
    }
    case UPDATE_SELECTED_RECIPES: {
      const newSelectedRecipes = [...state.selectedRecipes]
      for (const i in newSelectedRecipes) {
        if (newSelectedRecipes[i].CorporateRecipeId === action.recipeId) {
          newSelectedRecipes[i].checked = action.checked
          break
        }
      }
      return { ...state, selectedRecipes: newSelectedRecipes }
    }
    default: {
      return { ...state }
    }
  }
}
