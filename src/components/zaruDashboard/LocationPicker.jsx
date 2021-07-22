import React, { Component } from 'react'
import { connect } from 'react-redux'
import { fetchLocations, setLocations } from 'actions'
import 'styles/LocationPicker.css'

class LocationPicker extends Component {
  constructor(props) {
    super(props)
    this.handleRegionCheckboxChange = this.handleRegionCheckboxChange.bind(this)
    this.setReduxLocations = this.setReduxLocations.bind(this)
  }

  componentDidUpdate() {
    this.setReduxLocations()
  }

  UNSAFE_componentWillUpdate(nextProps) {
    if (nextProps.locations_by_region !== this.props.locations_by_region) {
      this.setState(this.buildState(nextProps))
    }
  }

  setReduxLocations() {
    const currentState = this.state || {}
    const locations = Object.entries(currentState).map((loc) => {
      return { ...loc[1], name: loc[0] }
    })//.filter(loc => loc.type == 'location' && loc.checked)
    this.props.setLocations(locations)
  }

  checkRegions(loc) {
    const nextState = { ...this.state, ...loc }
    const regions = Object.entries(nextState).filter(loc => loc[1].type === 'region').map(l => l[0])
    regions.forEach((region) => {
      const locations = Object.values(nextState)
        .filter(loc => loc.region === region && loc.checked)
      if (locations.length === 0) {
        this.setState({ [region]: { ...this.state[region], checked: false }})
      } else {
        this.setState({ [region]: { ...this.state[region], checked: true }})
      }

    })
  }

  buildState(nextProps) {
    const { locations_by_region } = nextProps
    const initialState = {}
    locations_by_region.forEach((region) => {
      initialState[region.name] = { checked: true, type: 'region', division_id: region.division_id }
      region.locations.forEach((location) => {
        initialState[location.name] = { checked: true, type: 'location', region: region.name, unit_id: location.unit_id }
      })
    })

    return initialState
  }

  handleRegionCheckboxChange(event, region, locations) {
    const { checked } = this.state[region]
    this.setState({[region]: { ...this.state[region], checked: !checked }})
    locations.forEach((location) => {
      this.setState({[location.name]: { ...this.state[location.name], checked: !checked }})
    })
  }

  handleLocationCheckboxChange(event, location) {
    const { checked } = this.state[location]
    const nextState = {[location]: { ...this.state[location], checked: !checked }}
    this.setState(nextState)
    this.checkRegions(nextState)
  }

  mapLocations(locations) {
    return locations.map((location) => (
      <div className='location-checkbox-container' key={location.name}>
        <input
          className='location-checkbox'
          type="checkbox"
          id={location.name}
          value={location.name}
          checked={this.state[location.name]?.checked}
          onChange={(event) => this.handleLocationCheckboxChange(event, location.name)}
        />
        <label className='location-checkbox-label' htmlFor={location.name}>{location.name}</label>
      </div>
    ))
  }

  mapLocationsByRegion() {
    const { locations_by_region } = this.props
    if (locations_by_region === []) { return <div></div> }
    return locations_by_region.map((region) => {
      return (
        <div className='region-checkbox-container' key={region.name}>
          <input
            type="checkbox"
            id={region.name}
            value={region.name}
            checked={this.state[region.name]?.checked}
            onChange={event => this.handleRegionCheckboxChange(event, region.name, region.locations)}
          />
          <label className='region-checkbox-label' htmlFor={region.name}>{region.name}</label>
          { this.mapLocations(region.locations) }
        </div>
      )
    })
  }

  render() {
    if (this.state === null) return <div></div>
    return (
      <div className='location-picker-container'>
        <div className='location-picker-title'>
          Locations:
        </div>
        { this.mapLocationsByRegion() }
      </div>
    )
  }
}

const mapStateToProps = state => {
  return { locations_by_region: state.company.locations_by_region }
}
export default connect(mapStateToProps, { fetchLocations, setLocations })(LocationPicker)
