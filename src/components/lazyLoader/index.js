import React, { PureComponent, Suspense } from 'react'

function LazyLoader(WrappedComponent) {
  return class Wrapped extends PureComponent {
    render() {
      return (
        <Suspense
          fallback={
            <div className="flex justify-center vh-100">Loading...</div>
          }
        >
          <WrappedComponent {...this.props} />
        </Suspense>
      )
    }
  }
}

export default LazyLoader
