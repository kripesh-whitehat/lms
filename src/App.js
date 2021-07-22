import React from 'react'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import { applyMiddleware, compose, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import RootReducer from './reducers'
import Router from './routes/Router'
import rootSaga from './sagas'
import './styles/App.css'
// import './styles/dashboard-default.css'
import './styles/bootstrap/bootstrap.css'
import './styles/react-grid-layout.css'
import './styles/react-resizable.css'
import './styles/utils.css'

const sagaMiddleware = createSagaMiddleware()
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export const store = createStore(
  RootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware)),
)
function App() {
  sagaMiddleware.run(rootSaga)

  return (
    <Provider store={store}>
      <Router />
    </Provider>
  )
}

export default DragDropContext(HTML5Backend)(App)
