const filters = require('../helpers/filters')

function filterUserId (filter, criterias, values) {
  if (filter['user.id'] !== undefined) {
    const ids = filters.sanitizeArrayFilter(filter['user.id'], {
      helpers: [item => String(item).trim()]
    })

    if (ids.length) {
      criterias.push('u.user_id IN (:userUuid)')
      values.userUuid = ids
    }
  }
}

function filterUserEmail (filter, criterias, values) {
  if (filter['user.email'] !== undefined) {
    criterias.push('pe.email LIKE :userEmail')
    values.userEmail = `%${filter['user.email']}%`
  }
}

function filterUserActive (filter, criterias, values) {
  if (filter['user.active'] !== undefined) {
    const sanitizedValues = filters.sanitizeArrayFilter(filter['user.active'], {
      helpers: [item => Number(item)]
    })

    if (sanitizedValues.length) {
      criterias.push('u.active IN (:userActive)')
      values.userActive = sanitizedValues
    }
  }
}

function filterUserCreatedAt (filter, criterias, values) {
  // Filtro de Data Inicial
  if (filter['user.createdAt.initial'] !== undefined) {
    criterias.push('DATE(u.created_at) >= :userCreatedAtInitial')
    values.userCreatedAtInitial = filter['user.createdAt.initial']
  }

  // Filtro de Data Final
  if (filter['user.createdAt.final'] !== undefined) {
    criterias.push('DATE(u.created_at) <= :userCreatedAtFinal')
    values.userCreatedAtFinal = filter['user.createdAt.final']
  }
}

function filterUserAlteredAt (filter, criterias, values) {
  // Filtro de Data Inicial
  if (filter['user.alteredAt.initial'] !== undefined) {
    criterias.push('DATE(u.altered_at) >= :userAlteredAtInitial')
    values.userAlteredAtInitial = filter['user.alteredAt.initial']
  }

  // Filtro de Data Final
  if (filter['user.alteredAt.final'] !== undefined) {
    criterias.push('DATE(u.altered_at) <= :userAlteredAtFinal')
    values.userAlteredAtFinal = filter['user.alteredAt.final']
  }
}

function filterPersonId (filter, criterias, values) {
  if (filter['person.id'] !== undefined) {
    const ids = filters.sanitizeArrayFilter(filter['person.id'], {
      helpers: [item => String(item).trim()]
    })

    if (ids.length) {
      criterias.push('p.person_id IN (:personUuid)')
      values.personUuid = ids
    }
  }
}

function filterPersonName (filter, criterias, values) {
  if (filter['person.name'] !== undefined) {
    criterias.push('p.name LIKE :personName')
    values.personName = `%${filter['person.name']}%`
  }
}

function filterSearch (search, criterias, values) {
  if (search.length) {
    criterias.push(`(
      u.user_id LIKE :search
      OR p.person_id LIKE :search
      OR p.name LIKE :search
      OR pe.email LIKE :search
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
  filterUserAlteredAt,
  filterSearch,
  orderByColumn: filters.orderByColumn,
  orderByDir: filters.orderByDir
}
