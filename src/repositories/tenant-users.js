const db = require('../database/conn')
const filters = require('../filters/tenant-users')
const generateOptions = require('../helpers/generate-options')
const makeObj = require('../helpers/make-obj')
const JsonReturn = require('fm-json-response')

const orderColumns = {
  'user.id': 'u.user_id',
  'user.email': 'u.email',
  'user.active': 'u.active',
  'user.createdAt': 't.created_at',
  'user.alteredAt': 't.altered_at',
  'person.id': 'p.person_id',
  'person.name': 'p.name'
}

const viewColumns = {
  userId: 'user.id',
  userEmail: 'user.email',
  userActive: 'user.active',
  userCreatedAt: 'user.createdAt',
  userAlteredAt: 'user.clteredAt',
  personId: 'person.id',
  personName: 'person.name'
}

class TenantUsersRepository {
  static async findAll (tenantId = null, { filter = {} } = {}) {
    // Essa promise serve para recuperar os filtros da busca
    return new Promise(resolve => {
      const queryOptions = generateOptions(filter)

      const whereCriteria = []
      const whereValues = {}

      filters.filterUserId(filter, whereCriteria, whereValues)
      filters.filterUserEmail(filter, whereCriteria, whereValues)
      filters.filterUserActive(filter, whereCriteria, whereValues)
      filters.filterUserCreatedAt(filter, whereCriteria, whereValues)
      filters.filterUserAlteredAt(filter, whereCriteria, whereValues)
      filters.filterPersonId(filter, whereCriteria, whereValues)
      filters.filterPersonName(filter, whereCriteria, whereValues)
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
          SELECT COUNT(u.user_id) AS total
          FROM tenants t
          INNER JOIN tenants_users tu ON (t.tenant_id = tu.tenant_id AND tu.deleted_at IS NULL)
          INNER JOIN users u ON (tu.user_id = u.user_id AND u.deleted_at IS NULL)
          INNER JOIN people p ON (u.person_id = p.person_id AND p.deleted_at IS NULL)
          INNER JOIN person_emails pe ON (p.person_id = pe.person_id AND u.person_email_id = pe.person_email_id AND pe.deleted_at IS NULL)
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
          SELECT COUNT(u.user_id) AS total
          FROM tenants t
          INNER JOIN tenants_users tu ON (t.tenant_id = tu.tenant_id AND tu.deleted_at IS NULL)
          INNER JOIN users u ON (tu.user_id = u.user_id AND u.deleted_at IS NULL)
          INNER JOIN people p ON (u.person_id = p.person_id AND p.deleted_at IS NULL)
          INNER JOIN person_emails pe ON (p.person_id = pe.person_id AND u.person_email_id = pe.person_email_id AND pe.deleted_at IS NULL)
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
            u.user_id AS userId,
            p.person_id AS personId,
            p.name AS personName,
            pe.email AS userEmail,
            u.active AS userActive,
            u.created_at AS userCreatedAt,
            u.altered_at AS userAlteredAt
          FROM tenants t
          INNER JOIN tenants_users tu ON (t.tenant_id = tu.tenant_id AND tu.deleted_at IS NULL)
          INNER JOIN users u ON (tu.user_id = u.user_id AND u.deleted_at IS NULL)
          INNER JOIN people p ON (u.person_id = p.person_id AND p.deleted_at IS NULL)
          INNER JOIN person_emails pe ON (p.person_id = pe.person_id AND u.person_email_id = pe.person_email_id AND pe.deleted_at IS NULL)
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

module.exports = TenantUsersRepository
