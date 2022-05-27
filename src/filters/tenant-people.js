const filters = require('../helpers/filters')

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

function filterPeopleBirthDate (filter, criterias, values) {
  // Filtro de Data Inicial
  if (filter['person.birthDate.initial'] !== undefined) {
    criterias.push('DATE(p.birth_date) >= :personBirthDateInitial')
    values.personBirthDateInitial = filter['person.birthDate.initial']
  }

  // Filtro de Data Final
  if (filter['person.birthDate.final'] !== undefined) {
    criterias.push('DATE(p.birth_date) <= :personBirthDateFinal')
    values.personBirthDateFinal = filter['person.birthDate.final']
  }
}

function filterPersonCpfCnpj (filter, criterias, values) {
  if (filter['person.cpfCnpj'] !== undefined) {
    criterias.push('p.cpf_cnpj LIKE :personCpfCnpj')
    values.personCpfCnpj = `%${filter['person.cpfCnpj']}%`
  }
}

function filterPeopleRgIe (filter, criterias, values) {
  if (filter['person.rgIe'] !== undefined) {
    criterias.push('p.rg_ie LIKE :personRgIe')
    values.personRgIe = `%${filter['person.rgIe']}%`
  }
}

function filterPeopleActive (filter, criterias, values) {
  if (filter['person.active'] !== undefined) {
    const sanitizedValues = filters.sanitizeArrayFilter(filter['person.active'], {
      helpers: [item => Number(item)]
    })

    if (sanitizedValues.length) {
      criterias.push('p.active IN (:personActive)')
      values.personActive = sanitizedValues
    }
  }
}

function filterPeopleCreatedAt (filter, criterias, values) {
  // Filtro de Data Inicial
  if (filter['person.createdAt.initial'] !== undefined) {
    criterias.push('DATE(p.created_at) >= :personCreatedAtInitial')
    values.personCreatedAtInitial = filter['person.createdAt.initial']
  }

  // Filtro de Data Final
  if (filter['person.createdAt.final'] !== undefined) {
    criterias.push('DATE(p.created_at) <= :personCreatedAtFinal')
    values.personCreatedAtFinal = filter['person.createdAt.final']
  }
}

function filterPeopleAlteredAt (filter, criterias, values) {
  // Filtro de Data Inicial
  if (filter['person.alteredAt.initial'] !== undefined) {
    criterias.push('DATE(p.altered_at) >= :personAlteredAtInitial')
    values.personAlteredAtInitial = filter['person.alteredAt.initial']
  }

  // Filtro de Data Final
  if (filter['person.alteredAt.final'] !== undefined) {
    criterias.push('DATE(p.altered_at) <= :personAlteredAtFinal')
    values.personAlteredAtFinal = filter['person.alteredAt.final']
  }
}

function filterSearch (search, criterias, values) {
  if (search.length) {
    criterias.push(`(
      p.person_id LIKE :search
      OR p.name LIKE :search
      OR p.cpf_cnpj LIKE :search
      OR p.rg_ie LIKE :search
      OR p.birth_date LIKE :search
      OR p.active LIKE :search
      OR p.created_at LIKE :search
      OR p.altered_at LIKE :search
    )`)
    values.search = `%${search}%`
  }
}

module.exports = {
  filterPersonId,
  filterPersonName,
  filterPeopleBirthDate,
  filterPersonCpfCnpj,
  filterPeopleRgIe,
  filterPeopleActive,
  filterPeopleCreatedAt,
  filterPeopleAlteredAt,
  filterSearch,
  orderByColumn: filters.orderByColumn,
  orderByDir: filters.orderByDir
}
