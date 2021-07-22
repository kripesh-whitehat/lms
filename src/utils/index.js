// import moment from 'moment'
// import _ from "lodash";
import isEmpty from 'helpers/isEmpty'

export const randomFloatInRange = (min, max) =>
  Math.random() * (max - min) + min

export const roundFloat = (value, decimalPlace) => {
  const adjuster = 10 ** decimalPlace
  return Math.round(value * adjuster) / adjuster
}

export const roundTwo = (value) => parseFloat(roundFloat(value, 2)).toFixed(2)

export const formatIntoDollars = (amount) => {
  const amountInDollars = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return amountInDollars.format(amount)
}

export const getColorPosOrNeg = (value) => (value > 0 ? 'red' : 'green')

export const formatPercent = (value) => {
  const floatValue = parseFloat(value) || 0
  return `${floatValue.toFixed(1)}%`
}

export const flattenArray = (list) =>
  list.reduce((a, b) => a.concat(Array.isArray(b) ? flattenArray(b) : b), [])

export const selectedDivisions = (locations) =>
  locations.filter((location) => location.type === 'region' && location.checked)

export const selectedUnits = (locations) =>
  locations.filter(
    (location) => location.type === 'location' && location.checked,
  )

export const allDivisions = (locations) =>
  locations.filter((location) => location.type === 'region')

const formatDivisions = (divisions) =>
  divisions.map((division) => ({
    name: division.name || division.DivisionName,
    division_id: division.division_id || division.DivisionId,
    ...division,
  }))

export const sortDivisions = (divisions) => {
  const formattedDivisions = formatDivisions(divisions)
  const noDivision = formattedDivisions.find((div) => div.division_id === -1)
  const filteredDivisions = formattedDivisions.filter(
    (div) => div.division_id !== -1,
  )
  const sortedDivisions = filteredDivisions.concat().sort((a, b) => {
    const nameA = a.name.toUpperCase() // ignore upper and lowercase
    const nameB = b.name.toUpperCase() // ignore upper and lowercase

    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }

    // names must be equal
    return 0
  })

  if (!noDivision) return sortedDivisions
  return [noDivision, ...sortedDivisions]
}

export const varsFromParams = (params) => {
  const vars = {}
  params.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value
  })
  return vars
}

export const calculateUsage = (beginning, purchases, ending) => {
  beginning = parseFloat(beginning) || 0
  purchases = parseFloat(purchases) || 0
  ending = parseFloat(ending) || 0
  return beginning + purchases - ending
}

export const dateToUTC = (date) => {
  const mDate = new Date(date)
  return Date.UTC(mDate.getFullYear(), mDate.getMonth(), mDate.getDate())
}

function downloadCSV(csv, filename) {
  let csvFile
  let downloadLink

  // CSV file
  csvFile = new Blob([csv], { type: 'text/csv' })

  // Download link
  downloadLink = document.createElement('a')

  // File name
  downloadLink.download = filename

  // Create a link to the file
  downloadLink.href = window.URL.createObjectURL(csvFile)

  // Hide download link
  downloadLink.style.display = 'none'

  // Add the link to DOM
  document.body.appendChild(downloadLink)

  // Click download link
  downloadLink.click()
}

// https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/#:~:text=JavaScript%20Code&text=The%20downloadCSV()%20function%20takes,data%20in%20a%20CSV%20file.&text=The%20exportTableToCSV()%20function%20creates,using%20the%20downloadCSV()%20function.
export function exportTableToCSV(tableSelector, filename = 'data.csv') {
  const csv = []
  const tables = document.querySelectorAll(tableSelector)
  tables.forEach((table, index) => {
    if (index > 0) {
      csv.push([])
    }
    const { title } = table.dataset
    if (!isEmpty(String(title))) {
      csv.push([title])
    }

    const rows = table.querySelectorAll('tr')

    for (let i = 0; i < rows.length; i++) {
      const row = []
      const cols = rows[i].querySelectorAll('td, th')

      for (let j = 0; j < cols.length; j++) {
        row.push(cols[j].innerText.replace(/,/g, '').trim())
      }

      csv.push(row.join(','))
    }
  })

  // Download CSV file
  downloadCSV(csv.join('\n'), filename)
}

export function exportReactTable(tableSelector, filename = 'data.csv') {
  const csv = []
  const tables = document.querySelectorAll(tableSelector)
  tables.forEach((table, index) => {
    if (index > 0) {
      csv.push([])
    }
    const { title } = table.dataset
    if (!isEmpty(String(title))) {
      csv.push([title])
    }

    const rows = table.querySelectorAll('.rt-tr')

    for (let i = 0; i < rows.length; i++) {
      const row = []
      const cols = rows[i].querySelectorAll('.rt-td, .rt-th')

      for (let j = 0; j < cols.length; j++) {
        row.push(cols[j].innerText.replace(/,/g, '').trim())
      }

      csv.push(row.join(','))
    }
  })

  // Download CSV file
  downloadCSV(csv.join('\n'), filename)
}

export function formatName(name) {
  return name
    .replace(/[^a-zA-Z ]/, '')
    .split(' ')
    .join('_')
    .toLowerCase()
}

let isFetching = true
export const setFetching = (fetch) => {
  isFetching = fetch
}
export const getFetching = () => isFetching
