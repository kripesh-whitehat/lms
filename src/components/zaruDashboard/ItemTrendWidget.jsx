import React from 'react'
import 'styles/FruitConsumptionWidget.css'
import ItemTrendChart from './ItemTrendChart'
import Widget from './Widget'


const ItemTrendWidget = (props) => (
  <Widget
    title="Item Trend"
    type="item_trend_report"
    urlParams="?id=54390"
    {...props}
  >
    <div className='fruit-main-chart'>
      <ItemTrendChart
        widthRatio={.9}
        heightRatio={.75}
        container={`fruit-main-chart-${props.id}`}
        type="item_trend_report"
        {...props}
      />
    </div>
  </Widget>
)

ItemTrendWidget.propTypes = {

}

const styles = {
  ItemTrendWidget: {

  }
}

export default ItemTrendWidget
