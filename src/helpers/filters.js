function sanitizeArrayFilter (filter, options = {}) {
  filter = String(filter || '')

  const helpers = options.helpers || []
  const list = options.list || []

  filter = filter
    .split(',')
    .map(item => {
      item = item.trim()

      for (const helper of helpers) item = helper(item)

      return item
    })
    .filter(item => item !== null && item !== '')

  if (list.length) filter = filter.filter(item => list.includes(item))

  return filter
}

function orderByColumn (column = null, columns = {}, defaultColumn) {
  if (typeof columns[column] !== 'undefined') {
    return columns[column]
  }

  return defaultColumn
}

function orderByDir (dir = null) {
  if (dir) {
    if (![
      'ASC',
      'DESC'
    ].includes(dir.toUpperCase())) {
      dir = 'ASC'
    }
  } else {
    dir = 'ASC'
  }

  return dir
}

module.exports = {
  sanitizeArrayFilter,
  orderByColumn,
  orderByDir
}
