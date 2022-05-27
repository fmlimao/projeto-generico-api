const db = require('../database/conn')
const filters = require('../filters/tenant-users')
const generateOptions = require('../helpers/generate-options')
const JsonReturn = require('fm-json-response')
// // const keysGenerator = require('../helpers/key-generator')
// // const validator = require('fm-validator')

const orderColumns = {
  userId: 'u.user_id',
  personId: 'p.person_id',
  personName: 'p.name',
  userEmail: 'u.email',
  userActive: 'u.active',
  userCreatedAt: 't.created_at',
  userAlteredAt: 't.altered_at'
}

const viewColumns = {
  userId: 'userId',
  personId: 'personId',
  personName: 'personName',
  userEmail: 'userEmail',
  userActive: 'userActive',
  userCreatedAt: 'userCreatedAt',
  userAlteredAt: 'userAlteredAt'
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
          const newItem = {}

          for (const i in item) {
            if (typeof viewColumns[i] !== 'undefined') {
              newItem[viewColumns[i]] = item[i]
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

  // static async findOneById (id = null, uuid = null) {
  //   return new Promise((resolve, reject) => {
  //     // Essa promise recupera o registro

  //     (async () => {
  //       const field = id ? 't.tenant_id' : (uuid ? 'uuid' : null)
  //       const value = id || uuid

  //       if (!field) {
  //         return reject(new Error('Busca inválida.'))
  //       }

  //       const data = await db.getOne(`
  //         SELECT
  //           t.uuid,
  //           t.name,
  //           t.active,
  //           t.created_at,
  //           t.altered_at
  //         FROM tenants t
  //         WHERE t.deleted_at IS NULL
  //         AND ${field} = ?;
  //       `, [
  //         value
  //       ])

  //       resolve(data)
  //     })()
  //   })
  //     .then(data => {
  //       // Essa promise formata os dados ou renomeia as colunas

  //       if (!data) return data

  //       const newItem = {}

  //       for (const i in data) {
  //         if (typeof viewColumns[i] !== 'undefined') {
  //           newItem[viewColumns[i]] = data[i]
  //         }
  //       }

  //       return newItem
  //     })
  //     .then(data => {
  //       // Essa promise retorna os dados no padrão do sistema

  //       const ret = new JsonReturn()

  //       if (!data) {
  //         ret.setCode(404)
  //         ret.setError(true)
  //       }

  //       ret.addContent('data', data)

  //       return ret.generate()
  //     })
  // }

  // static async create (fields) {
  //   return new Promise((resolve, reject) => {
  //     const ret = new JsonReturn()

  //     ret.addFields(['name'])

  //     const { name } = fields

  //     if (!validator(ret, {
  //       name
  //     }, {
  //       name: 'required|string|min:3|max:255'
  //     })) {
  //       ret.setError(true)
  //       ret.setCode(400)
  //       ret.addMessage('Verifique todos os campos.')
  //       return reject(ret)
  //     }

  //     const next = {
  //       fields: {
  //         name
  //       },
  //       ret
  //     }

  //     resolve(next)
  //   })
  //     .then(async next => {
  //       const dataExists = await db.getOne(`
  //         SELECT tenant_id
  //         FROM tenants
  //         WHERE deleted_at IS NULL
  //         AND name = ?;
  //       `, [
  //         next.fields.name
  //       ])

  //       if (dataExists) {
  //         next.ret.setFieldError('name', true, 'Já existe um inquilino com este nome.')

  //         next.ret.setError(true)
  //         next.ret.setCode(400)
  //         next.ret.addMessage('Verifique todos os campos.')

  //         throw next.ret
  //       }

  //       return next
  //     })
  //     .then(async next => {
  //       next.fields.uuid = keysGenerator.generateRandomObjectID()

  //       const id = await db.insert(`
  //         INSERT INTO tenants (uuid, name, created_at)
  //         VALUES (?, ?, NOW());
  //       `, [
  //         next.fields.uuid,
  //         next.fields.name
  //       ])

  //       return this.findOneById(id)
  //     })
  // }

  // static async update (id = null, uuid = null, fields) {
  //   return this.findOneById(id, uuid)
  //     .then(async findRet => {
  //       const data = findRet.content.data

  //       const ret = new JsonReturn()

  //       const { name, active } = fields
  //       let fieldCount = 0
  //       const updateFields = {}
  //       const updateValidades = {}

  //       if (name !== undefined) {
  //         ret.addField('name')
  //         fieldCount++
  //         updateFields.name = name
  //         updateValidades.name = 'required|string|min:3|max:255'
  //       }

  //       if (active !== undefined) {
  //         ret.addField('active')
  //         fieldCount++
  //         updateFields.active = active
  //         updateValidades.active = 'required|integer|between:0,1'
  //       }

  //       if (!fieldCount) {
  //         ret.setError(true)
  //         ret.setCode(400)
  //         ret.addMessage('Nenhum campo foi informado.')
  //         throw ret
  //       }

  //       if (!validator(ret, updateFields, updateValidades)) {
  //         ret.setError(true)
  //         ret.setCode(400)
  //         ret.addMessage('Verifique todos os campos.')
  //         throw ret
  //       }

  //       const next = {
  //         fields: {
  //           name,
  //           active
  //         },
  //         data,
  //         ret
  //       }

  //       return next
  //     })
  //     .then(async next => {
  //       if (next.fields.name) {
  //         const dataExists = await db.getOne(`
  //           SELECT tenant_id
  //           FROM tenants
  //           WHERE deleted_at IS NULL
  //           AND name = ?
  //           AND uuid != ?;
  //         `, [
  //           next.fields.name,
  //           next.data.id
  //         ])

  //         if (dataExists) {
  //           next.ret.setFieldError('name', true, 'Já existe um inquilino com este nome.')

  //           next.ret.setError(true)
  //           next.ret.setCode(400)
  //           next.ret.addMessage('Verifique todos os campos.')

  //           throw next.ret
  //         }
  //       }

  //       return next
  //     })
  //     .then(next => {
  //       if (typeof next.fields.name !== 'undefined') next.data.name = next.fields.name
  //       if (typeof next.fields.active !== 'undefined') next.data.active = Number(next.fields.active)

  //       return next
  //     })
  //     .then(async next => {
  //       await db.update(`
  //         UPDATE tenants
  //         SET name = ?,
  //         active = ?
  //         WHERE uuid = ?;
  //       `, [
  //         next.data.name,
  //         next.data.active,
  //         next.data.id
  //       ])

  //       return this.findOneById(null, next.data.id)
  //     })
  // }

  // static delete (id = null, uuid = null) {
  //   return this.findOneById(id, uuid)
  //     .then(async findRet => {
  //       await db.update(`
  //         UPDATE tenants
  //         SET deleted_at = NOW()
  //         WHERE uuid = ?;
  //       `, [
  //         findRet.content.data.id
  //       ])
  //     })
  // }
}

module.exports = TenantUsersRepository
