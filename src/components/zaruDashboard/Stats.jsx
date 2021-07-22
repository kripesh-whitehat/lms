import _ from 'lodash'
import React, { Component } from 'react'
import 'styles/Stats.css'
import {
  formatIntoDollars, formatPercent, getColorPosOrNeg
} from 'utils'


class Stats extends Component {
  constructor(props) {
    super(props)
    this.computeStats = this.computeStats.bind(this)
  }

  computeStats() {
    const { ratesAndDates } = this.props
    if (_.isEmpty(ratesAndDates)) {
      return { mean: 0, sum: 0, min: 0, max: 0, change: 0, totalQuantity: 0 }
    }

    const rates = ratesAndDates.map(i => parseFloat(i.rate))
    const amounts = ratesAndDates.map(i => parseFloat(i.rate) * parseFloat(i.qty))
    const sortedRates = rates.slice().sort((a,b) => a - b)
    const sum = rates.reduce((a, b) =>  a + b)
    const total = amounts.reduce((a, b) => a + b)
    const mean = sum / rates.length
    const min = sortedRates[0]
    const max = sortedRates[sortedRates.length - 1]
    const change = ((rates[0] - rates[rates.length - 1]) / rates[0]) * (-100)
    return { mean, sum, min, max, change, total }
  }

  render() {
    const stats = this.computeStats()
    return (
      <div>
        <div className='stats-container'>
          <div className='stat-group'>
            <div className='stat-label'>Low</div>
            <div className='stat'>{formatIntoDollars(stats.min)}</div>
          </div>
          <div className='stat-group'>
            <div className='stat-label'>Mean</div>
            <div className='stat'>{formatIntoDollars(stats.mean)}</div>
          </div>
          <div className='stat-group'>
            <div className='stat-label'>High</div>
            <div className='stat'>{formatIntoDollars(stats.max)}</div>
          </div>
          <div className='stat-group'>
            <div className='stat-label'>Total Amount</div>
            <div className='stat'>{formatIntoDollars(stats.total)}</div>
          </div>
          <div className='stat-group'>
            <div className='stat-label'>Change</div>
            <div className='stat' style={{ color: getColorPosOrNeg(stats.change) }}>{ stats.change > 0 ? '+' : ''}{formatPercent(stats.change)}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default Stats
