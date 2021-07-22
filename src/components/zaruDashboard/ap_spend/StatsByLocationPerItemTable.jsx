import React, { Component } from 'react'
import { connect } from 'react-redux'
import { flattenArray, roundFloat } from 'utils'
import Table from '../Table'
import TransactionsTable from '../TransactionsTable'

const data =
  [
    [
      [
        "01/04/2017",
        36.08
      ],
      [
        "01/11/2017",
        36.08
      ],
      [
        "01/18/2017",
        36.08
      ],
      [
        "01/20/2017",
        36.09
      ],
      [
        "01/25/2017",
        36.08
      ],
      [
        "01/25/2017",
        36.08
      ],
      [
        "01/27/2017",
        36.08
      ]
    ],
    [
      [
        "01/04/2017",
        36.97952061553656
      ],
      [
        "01/11/2017",
        33.73486887884567
      ],
      [
        "01/18/2017",
        38.87493956150439
      ],
      [
        "01/20/2017",
        33.29896825748187
      ],
      [
        "01/25/2017",
        38.97875706114175
      ],
      [
        "01/25/2017",
        33.63163384462856
      ],
      [
        "01/27/2017",
        39.28965603940981
      ]
    ]
  ]

class StatsByLocationPerItemTable extends Component {
  constructor(props) {
    super(props)
    this.computeStats = this.computeStats.bind(this)
  }

  computeStats() {

    if (data.length === 0) {
      return { mean: 0, sum: 0, min: 0, max: 0, change: 0, totalQuantity: 0 }
    }
    const  newData = data.map((userSet) => {
      const rates = userSet.map(datum => datum[1])
      const flattenedRates = flattenArray(rates)
      const sortedRates = flattenedRates.sort()
      const sum = roundFloat(flattenedRates.reduce((a, b) =>  a + b), 2)
      const mean = roundFloat(sum / flattenedRates.length, 2)
      const min = roundFloat(sortedRates[0], 2)
      const max = roundFloat(sortedRates[sortedRates.length - 1], 2)
      const change = roundFloat(((rates[0] - rates[rates.length - 1]) / rates[0]) * (-100), 2)
      return { mean, sum, min, max, change, quantity: 562, data: userSet }
    })
    newData[0].user = 'ell@vinesolutions.com'
    newData[1].user = 'sm1@vinesolutions.com'

    return newData
  }


  render() {

    const columns = [{
      Header: 'User',
      accessor: 'user'
    },{
      Header: 'Low',
      accessor: 'min'
    },
    {
      Header: 'Mean',
      accessor: 'mean'
    },
    {
      Header: 'High',
      accessor: 'max'
    },
    {
      Header: 'Quantity',
      accessor: 'quantity'
    },
    {
      Header: 'Change',
      accessor: 'change'
    }]


  return (
      <Table
        columns={columns}
        data={this.computeStats()}
        onDataClick={this.props.onDataClick}
        subComponent={row => <div style={{ padding: "20px" }}><TransactionsTable row={row} {...this.props} /></div>}
      />
    )
  }
}

StatsByLocationPerItemTable.defaultProps = {
}

StatsByLocationPerItemTable.propTypes = {
}

const mapStateToProps = state => {
  return { reports: state.reports }
}

export default connect(mapStateToProps)(StatsByLocationPerItemTable)
