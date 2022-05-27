const filters = require('../helpers/filters')
// const moment = require('moment')

function filterTenantId (filter, criterias, values) {
  if (filter.tenantId !== undefined) {
    const ids = filters.sanitizeArrayFilter(filter.tenantId, {
      helpers: [item => String(item).trim()]
    })

    if (ids.length) {
      criterias.push('t.tenant_id IN (:tenantId)')
      values.tenantId = ids
    }
  }
}

function filterTenantName (filter, criterias, values) {
  if (filter.tenantName !== undefined) {
    criterias.push('t.name LIKE :tenantName')
    values.tenantName = `%${filter.tenantName}%`
  }
}

function filterTenantActive (filter, criterias, values) {
  if (filter.tenantActive !== undefined) {
    const sanitizedValues = filters.sanitizeArrayFilter(filter.tenantActive, {
      helpers: [item => Number(item)]
    })

    if (sanitizedValues.length) {
      criterias.push('t.active IN (:tenantActive)')
      values.tenantActive = sanitizedValues
    }
  }
}

function filterTenantCreatedAt (filter, criterias, values) {
  // if (filter.initialCreatedAt === undefined || filter.finalCreatedAt === undefined) {
  //   filter.initialCreatedAt = moment().subtract(30, 'days').format('YYYY-MM-DD')
  //   filter.finalCreatedAt = moment().format('YYYY-MM-DD')
  // }

  // Filtro de Data de Abertura Inicial
  if (filter.tenantCreatedAtInitial !== undefined) {
    criterias.push('DATE(t.created_at) >= :tenantCreatedAtInitial')
    values.tenantCreatedAtInitial = filter.tenantCreatedAtInitial
  }

  // Filtro de Data de Abertura Final
  if (filter.tenantCreatedAtFinal !== undefined) {
    criterias.push('DATE(t.created_at) <= :tenantCreatedAtFinal')
    values.tenantCreatedAtFinal = filter.tenantCreatedAtFinal
  }
}

function filterSearch (search, criterias, values) {
  if (search.length) {
    criterias.push(`(
      t.tenant_id LIKE :search
      OR t.name LIKE :search
      OR t.active LIKE :search
      OR t.created_at LIKE :search
      OR t.altered_at LIKE :search
    )`)
    values.search = `%${search}%`
  }
}

module.exports = {
  filterTenantId,
  filterTenantName,
  filterTenantActive,
  filterTenantCreatedAt,
  filterSearch,
  orderByColumn: filters.orderByColumn,
  orderByDir: filters.orderByDir
}
