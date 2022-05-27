const db = require('../database/conn')
const filters = require('../filters/tenant-people')
const generateOptions = require('../helpers/generate-options')
const makeObj = require('../helpers/make-obj')
const JsonReturn = require('fm-json-response')

const orderColumns = {
  'person.id': 'p.person_id',
  'person.name': 'p.name',
  'person.birthDate': 'p.brith_date',
  'person.cpfCnpj': 'p.cpf_cnpj',
  'person.rgIe': 'p.rg_ie',
  'person.active': 'p.active',
  'person.createdAt': 'p.created_at',
  'person.alteredAt': 'p.altered_at'
}

const viewColumns = {
  personId: 'person.id',
  personName: 'person.name',
  personBirthDate: 'person.birthDate',
  personCpfCnpj: 'person.cpfCnpj',
  personRgIe: 'person.rgIe',
  personActive: 'person.active',
  personCreatedAt: 'person.createdAt',
  personAlteredAt: 'person.alteredAt'
}

class TenantPeopleRepository {
  static async findAll (tenantId = null, { filter = {} } = {}) {
    // Essa promise serve para recuperar os filtros da busca
    return new Promise(resolve => {
      const queryOptions = generateOptions(filter)

      const whereCriteria = []
      const whereValues = {}

      filters.filterPersonId(filter, whereCriteria, whereValues)
      filters.filterPersonName(filter, whereCriteria, whereValues)
      filters.filterPeopleBirthDate(filter, whereCriteria, whereValues)
      filters.filterPersonCpfCnpj(filter, whereCriteria, whereValues)
      filters.filterPeopleRgIe(filter, whereCriteria, whereValues)
      filters.filterPeopleActive(filter, whereCriteria, whereValues)
      filters.filterPeopleCreatedAt(filter, whereCriteria, whereValues)
      filters.filterPeopleAlteredAt(filter, whereCriteria, whereValues)
      filters.filterSearch(queryOptions.search, whereCriteria, whereValues)

      queryOptions.orderByColumn = filters.orderByColumn(queryOptions.orderByColumn, orderColumns, 'p.name')

      const next = {
        queryOptions,
        whereCriteria,
        whereValues,
        tenantId
      }

      resolve(next)
    })
      // Essa promise recupera o total de registros (sem filtro)
      .then(async next => {
        const values = {
          tenantId: next.tenantId
        }

        const query = `
          SELECT COUNT(p.person_id) AS total
          FROM tenants t
          INNER JOIN people p ON (t.tenant_id = p.tenant_id AND p.deleted_at IS NULL)
          WHERE t.deleted_at IS NULL
          AND t.tenant_id = :tenantId;
        `

        next.totalCount = (await db.getOne(query, values)).total

        return next
      })
      // Essa promise recupera o total de registros (com filtro)
      .then(async next => {
        const values = Object.assign({
          tenantId: next.tenantId
        }, next.whereValues)

        const query = `
        SELECT COUNT(p.person_id) AS total
          FROM tenants t
          INNER JOIN people p ON (t.tenant_id = p.tenant_id AND p.deleted_at IS NULL)
          WHERE t.deleted_at IS NULL
          AND t.tenant_id = :tenantId
          ${next.whereCriteria.length ? ` AND (${next.whereCriteria.join(' AND ')})` : ''}
        `

        next.filteredCount = (await db.getOne(query, values)).total

        return next
      })
      // Essa promise recupera os registros (com filtro)
      .then(async next => {
        const values = Object.assign({
          tenantId: next.tenantId
        }, next.whereValues)

        const query = `
          SELECT
            p.person_id AS personId,
            p.name AS personName,
            p.birth_date AS personBirthDate,
            p.cpf_cnpj AS personCpfCnpj,
            p.rg_ie AS personRgIe,
            p.active AS personActive,
            p.created_at AS personCreatedAt,
            p.altered_at AS personAlteredAt
          FROM tenants t
          INNER JOIN people p ON (t.tenant_id = p.tenant_id AND p.deleted_at IS NULL)
          WHERE t.deleted_at IS NULL
          AND t.tenant_id = :tenantId
          ${next.whereCriteria.length ? ` AND (${next.whereCriteria.join(' AND ')})` : ''}
          ORDER BY ${next.queryOptions.orderByColumn} ${next.queryOptions.orderByDir}
          ${next.queryOptions.limit ? next.queryOptions.limit : ''};
        `

        next.data = await db.getAll(query, values)

        return next
      })
      // Essa promise formata os dados ou renomeia as colunas
      .then(next => {
        next.data = next.data.map(item => {
          let newItem = {}

          for (const i in item) {
            if (typeof viewColumns[i] !== 'undefined') {
              // newItem[viewColumns[i]] = item[i]
              newItem = makeObj(newItem, viewColumns[i], item[i])
            }
          }

          return newItem
        })

        return next
      })
      // Essa promise retorna os dados no padrão do sistema
      .then(next => {
        const { start, length } = next.queryOptions
        const pages = Math.ceil(next.filteredCount / length)
        const currentPage = start / length + 1

        const columns = {}
        for (const i in orderColumns) {
          columns[orderColumns[i]] = i
        }

        const ret = new JsonReturn()

        const meta = {
          totalCount: next.totalCount,
          filteredCount: next.filteredCount,
          start,
          length,
          pages,
          currentPage,
          orderBy: {
            column: columns[next.queryOptions.orderByColumn],
            dir: next.queryOptions.orderByDir
          }
        }

        ret.addContent('meta', meta)
        ret.addContent('data', next.data)

        return ret.generate()
      })
  }
}

module.exports = TenantPeopleRepository
