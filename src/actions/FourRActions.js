import { SET_SELECTED_RECIPES, UPDATE_SELECTED_RECIPES } from './types'

export const setSelectedRecipes = (selectedRecipes) => ({
  type: SET_SELECTED_RECIPES,
  selectedRecipes,
})
export const updatedSelectedRecipes = (recipeId, checked) => ({
  type: UPDATE_SELECTED_RECIPES,
  recipeId,
  checked,
})
