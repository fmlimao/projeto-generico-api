const filters = require('../helpers/filters')
// const moment = require('moment')

function filterTenantId (filter, criterias, values) {
  if (filter['tenant.id'] !== undefined) {
    const ids = filters.sanitizeArrayFilter(filter['tenant.id'], {
      helpers: [item => String(item).trim()]
    })

    if (ids.length) {
      criterias.push('t.tenant_id IN (:tenantUuid)')
      values.tenantUuid = ids
    }
  }
}

function filterTenantName (filter, criterias, values) {
  if (filter['tenant.name'] !== undefined) {
    criterias.push('t.name LIKE :tenantName')
    values.tenantName = `%${filter['tenant.name']}%`
  }
}

function filterTenantActive (filter, criterias, values) {
  if (filter['tenant.active'] !== undefined) {
    const sanitizedValues = filters.sanitizeArrayFilter(filter['tenant.active'], {
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

  // Filtro de Data Inicial
  if (filter['tenant.createdAt.initial'] !== undefined) {
    criterias.push('DATE(t.created_at) >= :tenantCreatedAtInitial')
    values.tenantCreatedAtInitial = filter['tenant.createdAt.initial']
  }

  // Filtro de Data Final
  if (filter['tenant.createdAt.final'] !== undefined) {
    criterias.push('DATE(t.created_at) <= :tenantCreatedAtFinal')
    values.tenantCreatedAtFinal = filter['tenant.createdAt.final']
  }
}

function filterTenantAlteredAt (filter, criterias, values) {
  // Filtro de Data Inicial
  if (filter['tenant.alteredAt.initial'] !== undefined) {
    criterias.push('DATE(t.altered_at) >= :tenantAlteredAtInitial')
    values.tenantAlteredAtInitial = filter['tenant.alteredAt.initial']
  }

  // Filtro de Data Final
  if (filter['tenant.alteredAt.final'] !== undefined) {
    criterias.push('DATE(t.altered_at) <= :tenantAlteredAtFinal')
    values.tenantAlteredAtFinal = filter['tenant.alteredAt.final']
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
  filterTenantAlteredAt,
  filterSearch,
  orderByColumn: filters.orderByColumn,
  orderByDir: filters.orderByDir
}
