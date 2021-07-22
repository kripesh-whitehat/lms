import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'react-table/react-table.css'
import 'styles/Table.css'
import Table from './Table'
import TableFilter from './TableFilter'
import Widget from './Widget'

const data = [
  {inventoryItem: "Chicken Brst", price: "5.25/lb", vendorName: "Bassian Farms, Golden Gate Meat", totalSpend: "$9,888.88", gl: "Poultry", priceChange: "6.66%"},
  {inventoryItem: "Duck Brst", price: "9.55/lb", vendorName: "Bassian Farms", totalSpend: "$5,455.00", gl: "Meat", priceChange: "5.44%"},
  {inventoryItem: "Lemons", price: "40.05/cs", vendorName: "Cooks Produce", totalSpend: "$3,455.00", gl: "Produce", priceChange: "3.55%"},
  {inventoryItem: "Tomato", price: "31.55/cs", vendorName: "Cooks Produce", totalSpend: "$2,555.00", gl: "Produce", priceChange: "4.44%"},
  {inventoryItem: "Chicken Brst", price: "2.55/lb", vendorName: "Bassian Farms", totalSpend: "$9,888.88", gl: "Poultry", priceChange: "6.66%"},
  {inventoryItem: "Duck Brst", price: "5.25/lb", vendorName: "Bassian Farms", totalSpend: "$5,455.00", gl: "Meat", priceChange: "6.66%"},
  {inventoryItem: "Lemons", price: "25.55/cs", vendorName: "Cooks Produce", totalSpend: "$3,455.00", gl: "Produce", priceChange: "6.66%"},
  {inventoryItem: "Tomato", price: "5.25/lb", vendorName: "Cooks Produce", totalSpend: "$2,555.00", gl: "Produce", priceChange: "6.66%"}
]

const GLs = ["Meat", "Produce", "Poultry"]

class TableWidget extends Component {
  constructor(props) {
    super(props)
    this.state = {
      sortBy: '',
      sortOrder: true,
      selectedSubcategories: [],
      vendorIds: []
    }
    this.handleFilter = this.handleFilter.bind(this)
  }

  getColumns() {
    return [{
      Header: "Inventory Item",
      accessor: "inventoryItem",
      sortMethod: () => this.handleSort("inventory_item")
    },
    {
      Header: "Price",
      accessor: "price",
      sortMethod: () => this.handleSort("price")
    },
    {
      Header: "Vendor Name",
      accessor: "vendorName",
      sortMethod: () => this.handleSort("vendor")
    },
    {
      Header: "Total Spend",
      accessor: "totalSpend",
      sortMethod: () => this.handleSort("total_spend")
    },
    {
      Header: "GL",
      accessor: "gl",
      sortMethod: () => this.handleSort("gl"),
      // filterMethod: (filter, row) => this.handleFilter(filter, 'selectedSubcategories'),
      Filter: ({ filter, onChange }) => {
        return (
          <TableFilter
            values={this.state.selectedSubcategories}
            handleChange={this.handleFilter}
            options={GLs}
            selectedOptions={this.state.selectedSubcategories}
            name='selectedSubcategories'
          />
        )
      }
    },
    {
      Header: "Price Change",
      accessor: "priceChange",
      sortMethod: () => this.handleSort("price_change")
    }]
  }

  buildUrlParams() {
    const sortOrder = this.state.sortOrder ? 'DESC' : 'ASC'
    const baseParams = "?user_ids[]=140&user_ids[]=102&company_code=“stellands”&start_date=01/01/2017&end_date=01/31/2017"
    const sortParams = `?sort_by=${this.state.sortBy}?sort_order=${sortOrder}`
    return `${baseParams}${sortParams}`
  }

  handleSort(column) {
    if (this.state.sortBy === column) {
      this.setState({ sortOrder: !this.state.sortOrder })
    } else {
      this.setState({ sortBy: column, sortOrder: true })
    }
  }

  handleFilter(value, name) {
    const currentState = this.state[name]
    if (value === "all") {
      this.setState({ [name]: [] })
    } else if (currentState.includes(value)) {
      const filteredState = currentState.filter((a) => a != value)
      this.setState({ [name]: filteredState })
    } else {
      this.setState({ [name]: [...currentState, value] })
    }
  }



  render() {
    const { reports, id } = this.props
    const items = reports[id] && reports[id].table_api ? reports[id].table_api.data : []
    const urlParams = this.buildUrlParams()

    return (
      <Widget
        title="Items"
        type="table_api"
        urlParams={urlParams}
        {...this.props}
      >
        <Table
          data={data}
          columns={this.getColumns()}
          filterable
        />
      </Widget>
    )
  }
}

TableWidget.propTypes = {

}

const mapStateToProps = (state) => {
  return { reports: state.reports }
}
export default connect(mapStateToProps)(TableWidget)
