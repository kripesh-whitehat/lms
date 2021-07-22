import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setSelectedRecipes } from 'actions/FourRActions'
import BubbleChart from './BubbleChart'
import FourRTable from './FourRTable'
import RecipeTypeSelect from './RecipeTypeSelect'

class FourRMenuRecipeByTypeCompany extends Component {
  componentDidUpdate(prevProps) {
    if (
      this.props.initialSelectedRecipes &&
      !_.isEqual(
        prevProps.initialSelectedRecipes,
        this.props.initialSelectedRecipes,
      )
    ) {
      this.props.setSelectedRecipes(this.props.initialSelectedRecipes)
    }
  }

  componentDidMount() {
    this.props.setSelectedRecipes(this.props.initialSelectedRecipes)
  }

  render() {
    const {
      id,
      reports,
      widget,
      handleRecipeTypeSelect,
      selectedRecipes,
      container,
      chartType,
      byCompanyClick,
      onRecipeSelectAll,
    } = this.props

    return (
      <div className="four-r">
        <RecipeTypeSelect
          recipeTypes={reports[id].menu_recipe_types || []}
          handleSelect={handleRecipeTypeSelect}
          selectedTypeId={widget.selectedTypeId}
          visible={!_.isEmpty(reports[id]['4r_menu_recipe_by_type_company'])}
        />
        <BubbleChart
          data={selectedRecipes}
          container={container}
          type={chartType}
          onDataClick={(event) =>
            byCompanyClick(event.point.recipeId, event.point.name)
          }
          widthRatio={0.85}
          heightRatio={0.4}
          {...this.props}
        />
        <FourRTable
          widget_id={widget.id}
          data={selectedRecipes}
          emptyDataMessage=""
          container={container}
          onRecipeSelectAll={onRecipeSelectAll}
          selectAllChecked={widget.fourRTableSelectAllChecked}
          type={chartType}
          widthRatio={0.85}
          heightRatio={0.3}
          onCellClick={(row) =>
            byCompanyClick(row.original.CorporateRecipeId, row.original.Name)
          }
          {...this.props}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { four_r } = state
  return {
    selectedRecipes: four_r.selectedRecipes,
  }
}

export default connect(mapStateToProps, { setSelectedRecipes })(
  FourRMenuRecipeByTypeCompany,
)
