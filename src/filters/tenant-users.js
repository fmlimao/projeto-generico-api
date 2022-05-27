const filters = require('../helpers/filters')

function filterUserId (filter, criterias, values) {
  if (filter['user:id'] !== undefined) {
    const ids = filters.sanitizeArrayFilter(filter['user:id'], {
      helpers: [item => String(item).trim()]
    })

    if (ids.length) {
      criterias.push('u.user_id IN (:userUuid)')
      values.userUuid = ids
    }
  }
}

function filterUserEmail (filter, criterias, values) {
  if (filter['user:email'] !== undefined) {
    criterias.push('u.email LIKE :userEmail')
    values.userEmail = `%${filter['user:email']}%`
  }
}

function filterUserActive (filter, criterias, values) {
  if (filter['user:active'] !== undefined) {
    const sanitizedValues = filters.sanitizeArrayFilter(filter['user:active'], {
      helpers: [item => Number(item)]
    })

    if (sanitizedValues.length) {
      criterias.push('u.active IN (:userActive)')
      values.userActive = sanitizedValues
    }
  }
}

function filterUserCreatedAt (filter, criterias, values) {
  // Filtro de Data de Abertura Inicial
  if (filter['user:createdAt:initial'] !== undefined) {
    criterias.push('DATE(u.created_at) >= :userCreatedAtInitial')
    values.userCreatedAtInitial = filter['user:createdAt:initial']
  }

  // Filtro de Data de Abertura Final
  if (filter['user:createdAt:final'] !== undefined) {
    criterias.push('DATE(u.created_at) <= :userCreatedAtFinal')
    values.userCreatedAtFinal = filter['user:createdAt:final']
  }
}

function filterPersonId (filter, criterias, values) {
  if (filter['person:id'] !== undefined) {
    const ids = filters.sanitizeArrayFilter(filter['person:id'], {
      helpers: [item => String(item).trim()]
    })

    if (ids.length) {
      criterias.push('p.person_id IN (:personUuid)')
      values.personUuid = ids
    }
  }
}

function filterPersonName (filter, criterias, values) {
  if (filter['person:name'] !== undefined) {
    criterias.push('p.name LIKE :personName')
    values.personName = `%${filter['person:name']}%`
  }
}

function filterSearch (search, criterias, values) {
  if (search.length) {
    criterias.push(`(
      u.user_id LIKE :search
      OR p.person_id LIKE :search
      OR p.name LIKE :search
      OR u.email LIKE :search
      OR u.active LIKE :search
      OR u.created_at LIKE :search
    )`)
    values.search = `%${search}%`
  }
}

module.exports = {
  filterUserId,
  filterPersonId,
  filterPersonName,
  filterUserEmail,
  filterUserActive,
  filterUserCreatedAt,
  filterSearch,
  orderByColumn: filters.orderByColumn,
  orderByDir: filters.orderByDir
}
