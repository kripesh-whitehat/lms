import Cleave from 'cleave.js/react'
import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setWidgetState } from 'actions'
import { setTotalBudgetAmount } from 'actions/BudgetVsActualActions'
import 'styles/BudgetHeader.css'
import { formatIntoDollars, formatPercent } from 'utils'

class BudgetHeader extends Component {
  constructor(props) {
    super(props)
    this.handleBudgetChange = this.handleBudgetChange.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  componentDidMount() {
    this.props.setTotalBudgetAmount(this.props.initialBudget)
  }

  handleBudgetChange(value) {
    const budget = Number(value)
    this.props.setWidgetState(this.props.widgetId, { budget })
    this.props.setTotalBudgetAmount(budget)
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.handleBudgetChange(event.target.rawValue)
    }
  }

  budgetedSpend(totalBudget) {
    const { selected_gls, data } = this.props
    if (!_.isEmpty(data)) {
      let { Details } = data
      if (!_.isEmpty(selected_gls) && selected_gls.length > 0) {
        const budgetFilter = (d) => {
          const selGls = selected_gls.map((gl) => parseInt(gl.value, 10))
          return selGls.includes(d.Id)
        }
        Details = Details.filter(budgetFilter)
      }
      const sumReducer = (acc, curr) => acc + curr
      const budgetedAmounts = Details.map(
        (d) => d.TotalSalesBudgetedPercent * totalBudget,
      )
      if (budgetedAmounts.length > 0) {
        return budgetedAmounts.reduce(sumReducer)
      }
      return 0
    }
  }

  spent() {
    const { selected_gls, data } = this.props
    if (!_.isEmpty(data)) {
      let { Details } = data
      if (!_.isEmpty(selected_gls) && selected_gls.length > 0) {
        const spentFilter = (d) => {
          const selGls = selected_gls.map((gl) => parseInt(gl.value, 10))
          return selGls.includes(d.Id)
        }
        Details = Details.filter(spentFilter)
      }
      const sumReducer = (acc, curr) => acc + curr
      const spentAmounts = Details.map((d) => d.Budget)
      if (spentAmounts.length > 0) {
        return Details.map((d) => d.SpentAmount).reduce(sumReducer)
      }
      return 0
    }
  }

  spendingVariance(budgetedSpend, spent) {
    return parseFloat(budgetedSpend) - parseFloat(spent)
  }

  render() {
    const {
      budget,
      initialBudget,
      visible,
      fullscreen,
      data: { Sales },
    } = this.props
    const thumbnailId = fullscreen ? '' : 'thumbnail-font'
    const variancePercent =
      budget === 0
        ? formatPercent(100)
        : formatPercent((100 * (Sales - budget)) / budget)

    const budgetedSpend = this.budgetedSpend(budget)
    const spent = this.spent()

    const spendingVariance = this.spendingVariance(budgetedSpend, spent)

    const varianceClass =
      spendingVariance < 0 ? 'budget-stat budget-stat-warning' : 'budget-stat'

    return (
      <div id={thumbnailId} style={{ display: visible ? '' : 'none' }}>
        <div className="budget-stats-container">
          <div className="budget-stat-group">
            <div className="budget-stat-label">Sales</div>
            <div className="budget-stat">{formatIntoDollars(Sales)}</div>
          </div>
          <div className="budget-stat-group">
            <div className="budget-stat-label">
              Budget: {formatIntoDollars(initialBudget)}
            </div>
            <Cleave
              options={{
                numeral: true,
                prefix: '$',
                signBeforePrefix: true,
                rawValueTrimPrefix: true,
                numeralDecimalScale: 2,
              }}
              className="budget-stat"
              onBlur={(event) => this.handleBudgetChange(event.target.rawValue)}
              onKeyPress={this.handleKeyPress}
              value={budget ? budget.toFixed(2) : ''}
            />
          </div>
          <div className="budget-stat-group">
            <div className="budget-stat-label">Variance $</div>
            <div className="budget-stat">
              {formatIntoDollars(Sales - budget)}
            </div>
          </div>
          <div className="budget-stat-group">
            <div className="budget-stat-label">Variance %</div>
            <div className="budget-stat">{variancePercent}</div>
          </div>
        </div>
        <div className="budget-stats-container level-2">
          <div className="budget-stat-group">
            <div className="budget-stat-label">Budgeted Spend</div>
            <div className="budget-stat">
              {formatIntoDollars(budgetedSpend)}
            </div>
          </div>
          <div className="budget-stat-group">
            <div className="budget-stat-label">Spent</div>
            <div className="budget-stat">{formatIntoDollars(spent)}</div>
          </div>
          <div className="budget-stat-group">
            <div className="budget-stat-label">Spending Variance $</div>
            <div className={varianceClass}>
              {formatIntoDollars(spendingVariance)}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(null, { setWidgetState, setTotalBudgetAmount })(
  BudgetHeader,
)
