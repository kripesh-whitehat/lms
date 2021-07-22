import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  setSelectedRecipes,
  updatedSelectedRecipes,
} from 'actions/FourRActions'
import 'styles/FourRTable.css'
import { formatIntoDollars } from 'utils'
import Table from '../Table'

class FourRTable extends Component {
  constructor(props) {
    super(props)
    this.handleRecipeChange = this.handleRecipeChange.bind(this)
  }

  handleRecipeChange(row, e) {
    const { checked } = e.currentTarget
    const { CorporateRecipeId } = row
    this.props.updatedSelectedRecipes(CorporateRecipeId, checked)
  }

  render() {
    const { onCellClick, data } = this.props
    const canSelectAllBeChecked = data.every((d) => d.checked)

    const columns = [
      {
        Header: (
          <input
            type="checkbox"
            id="scales"
            name="scales"
            checked={this.props.selectAllChecked && canSelectAllBeChecked}
            onChange={(event) => this.props.onRecipeSelectAll(event)}
          />
        ),
        accessor: '',
        maxWidth: 50,
        minWidth: 50,
        sortable: false,
        Cell: (data) => (
          <div style={{ textAlign: 'center', zIndex: 1000 }}>
            <input
              type="checkbox"
              id="scales"
              name="scales"
              checked={data.original.checked}
              onChange={this.handleRecipeChange.bind(null, data.original)}
            />
          </div>
        ),
      },
      {
        Header: 'Recipe Name',
        accessor: 'Name',
        minWidth: 150,
        Cell: (row) => <div onClick={() => onCellClick(row)}>{row.value}</div>,
      },
      {
        Header: 'Quantity Sold',
        accessor: 'QuantitySold',
        maxWidth: 150,
        Cell: (row) => (
          <div onClick={() => onCellClick(row)} style={{ textAlign: 'right' }}>
            {row.value}
          </div>
        ),
      },
      {
        Header: 'Margin',
        id: 'margin',
        accessor: (d) => (d.MarginPercent ? d.MarginPercent.Value : 0),
        Cell: (row) => (
          <div onClick={() => onCellClick(row)} style={{ textAlign: 'right' }}>
            {row.original.MarginPercent
              ? row.original.MarginPercent.FormattedValue
              : 0}
          </div>
        ),
        maxWidth: 150,
      },
      {
        Header: 'Sale Price',
        id: 'salePrice',
        accessor: (recipe) =>
          Number((recipe.GrossPrice.Value / recipe.QuantitySold).toFixed(2)) ||
          0,
        Cell: (row) => (
          <div onClick={() => onCellClick(row)} style={{ textAlign: 'right' }}>
            {formatIntoDollars(
              Number(
                (
                  row.original.GrossPrice.Value / row.original.QuantitySold
                ).toFixed(2),
              ) || 0,
            )}
          </div>
        ),
        maxWidth: 150,
      },
    ]

    return <Table columns={columns} data={this.props.data} {...this.props} />
  }
}

FourRTable.defaultProps = {}

FourRTable.propTypes = {}

const mapStateToProps = (state) => {
  const { reports, four_r } = state
  return {
    reports,
    selectedRecipes: four_r.selectedRecipes,
  }
}

export default connect(mapStateToProps, {
  setSelectedRecipes,
  updatedSelectedRecipes,
})(FourRTable)
