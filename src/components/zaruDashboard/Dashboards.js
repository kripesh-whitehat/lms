import {
  createDashboard,
  deleteDashboard,
  fetchDashboards,
  setDashboardsItems,
  setTitleInput,
} from 'actions'
import Modal from 'components/Modal'
import React, { Component } from 'react'
import ReactGridLayout from 'react-grid-layout'
import { connect } from 'react-redux'
import DashboardAddButton from './DashboardAddButton'
import DashboardCreateForm from './DashboardCreateForm'
import DashboardPlaceholder from './DashboardPlaceholder'
import DashboardsConfirmDeleteModal from './DashboardsConfirmDeleteModal'

const drawLayout = (items) =>
  items.map((item, index) => ({
    i: item.id,
    x: (index % 3) * 3,
    y: parseInt(index / 3, 10) * 2,
    w: 3,
    h: 2,
    static: true, // index === 0
  }))

class Dashboards extends Component {
  constructor(props) {
    super(props)

    this.state = {
      layout: [],
      modalIsOpen: false,
      confirmDeleteModalIsOpen: false,
    }
    this.addDashboard = this.addDashboard.bind(this)
    this.onLayoutChange = this.onLayoutChange.bind(this)
    this.sortItems = this.sortItems.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.showModal = this.showModal.bind(this)
    this.onCreateSubmit = this.onCreateSubmit.bind(this)
    this.hideConfirmDeleteModal = this.hideConfirmDeleteModal.bind(this)
    this.showConfirmDeleteModal = this.showConfirmDeleteModal.bind(this)
    this.onDeleteSubmit = this.onDeleteSubmit.bind(this)
  }

  UNSAFE_componentWillMount() {
    this.props.fetchDashboards()
  }

  componentDidMount() {
    this.setState({ layout: drawLayout(this.props.items) })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ layout: drawLayout(nextProps.items) })
  }

  onLayoutChange(layout) {
    this.sortItems(layout)
  }

  showModal() {
    this.setState({ modalIsOpen: true })
  }

  showConfirmDeleteModal() {
    this.setState({ confirmDeleteModalIsOpen: true })
  }

  hideModal() {
    this.setState({ modalIsOpen: false })
  }

  hideConfirmDeleteModal() {
    this.setState({ confirmDeleteModalIsOpen: false })
  }

  onDeleteSubmit() {
    const { id } = this.props.items[this.props.selectedDashboard]
    this.hideConfirmDeleteModal()
    this.props.deleteDashboard(id)
  }

  onCreateSubmit() {
    this.hideModal()
    this.addDashboard()
  }

  sortItems(layout) {
    this.setState({ layout })
  }

  addDashboard() {
    this.props.createDashboard(this.props.titleInput)
  }

  createElement(el, index) {
    const { title, id } = this.props.items[index + 1]
    return (
      <DashboardPlaceholder
        title={title}
        key={id}
        index={index + 1}
        onDeletePress={this.showConfirmDeleteModal}
      />
    )
  }

  render() {
    return (
      <div>
        <ReactGridLayout
          layout={this.state.layout}
          onLayoutChange={this.onLayoutChange}
          style={styles.container}
          className="layout"
          rowHeight={100}
          width={1200}
          isResizable={false}
          draggableCancel="input,textarea"
        >
          <DashboardAddButton
            title="Create A Dashboard"
            key="add"
            onClick={this.showModal}
          >
            <div className="fa fa-plus fa-lg" id="add" />
          </DashboardAddButton>
          {this.props.items
            .slice(1)
            .map((el, index) => this.createElement(el, index))}
        </ReactGridLayout>

        <Modal
          show={this.state.modalIsOpen}
          onClose={this.hideModal}
          onSubmit={this.onCreateSubmit}
          title="Create a dashboard"
          primaryActionText="Create"
          secondaryActionText="Nevermind"
        >
          <DashboardCreateForm
            onInputChange={this.props.setTitleInput}
            inputValue={this.props.titleInput}
            onSubmit={this.onCreateSubmit}
          />
        </Modal>

        <DashboardsConfirmDeleteModal
          show={this.state.confirmDeleteModalIsOpen}
          onClose={this.hideConfirmDeleteModal}
          onSubmit={this.onDeleteSubmit}
          primaryActionText="Do It"
          secondaryActionText="Don't You Dare"
        />
      </div>
    )
  }
}
Dashboards.defaultProps = {
  className: 'layout',
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight: 100,
}
const styles = {
  container: {
    height: '90vh',
    overflowY: 'scroll',
  },
}

const mapStateToProps = (state) => {
  const { items, titleInput, selectedDashboard } = state.dashboards

  return { items, titleInput, selectedDashboard }
}

export default connect(mapStateToProps, {
  setDashboardsItems,
  setTitleInput,
  deleteDashboard,
  fetchDashboards,
  createDashboard,
})(Dashboards)
