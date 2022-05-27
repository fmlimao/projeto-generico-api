module.exports = function generateOptions (queryString) {
  const search = (queryString.search || '').trim()
  const orderByColumn = (queryString.orderByColumn || '').trim()
  let orderByDir = (queryString.orderByDir || '').trim().toUpperCase()

  if (!['ASC', 'DESC'].includes(orderByDir)) orderByDir = 'ASC'

  const start = parseInt(queryString.start || 0)
  const length = parseInt(queryString.length || 10)

  let limit = null
  if (length) {
    if (start) limit = `LIMIT ${start}, ${length}`
    else limit = `LIMIT ${length}`
  }

  return {
    search,
    orderByColumn,
    orderByDir,
    start,
    length,
    limit
  }
}
