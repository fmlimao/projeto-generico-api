const bcrypt = require('bcrypt')
const db = require('../database/conn')
const filters = require('../filters/tenant-users')
const generateOptions = require('../helpers/generate-options')
const jwt = require('jsonwebtoken')
const makeObj = require('../helpers/make-obj')
const JsonReturn = require('fm-json-response')
const validator = require('fm-validator')

const orderColumns = {
  'user.id': 'u.user_id',
  'user.name': 'u.name',
  'user.cpf': 'u.cpf',
  'user.email': 'u.email',
  'user.active': 'u.active',
  'user.createdAt': 't.created_at',
  'user.alteredAt': 't.altered_at'
}

const viewColumns = {
  userId: 'user.id',
  userName: 'user.name',
  userCpf: 'user.cpf',
  userEmail: 'user.email',
  userPassword: 'user.password',
  userActive: 'user.active',
  userCreatedAt: 'user.createdAt',
  userAlteredAt: 'user.alteredAt'
}

class TenantUsersRepository {
  static async findAll (tenantId, { filter = {} } = {}) {
    // Essa promise serve para recuperar os filtros da busca
    return new Promise(resolve => {
      const queryOptions = generateOptions(filter)

      const whereCriteria = []
      const whereValues = {}

      filters.filterUserId(filter, whereCriteria, whereValues)
      filters.filterUserName(filter, whereCriteria, whereValues)
      filters.filterUserEmail(filter, whereCriteria, whereValues)
      filters.filterUserCpf(filter, whereCriteria, whereValues)
      filters.filterUserActive(filter, whereCriteria, whereValues)
      filters.filterUserCreatedAt(filter, whereCriteria, whereValues)
      filters.filterUserAlteredAt(filter, whereCriteria, whereValues)
      filters.filterSearch(queryOptions.search, whereCriteria, whereValues)

      queryOptions.orderByColumn = filters.orderByColumn(queryOptions.orderByColumn, orderColumns, 'u.name')

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
          INNER JOIN users u ON (t.tenant_id = u.tenant_id AND u.deleted_at IS NULL)
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
          INNER JOIN users u ON (t.tenant_id = u.tenant_id AND u.deleted_at IS NULL)
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
            u.name AS userName,
            u.cpf AS userCpf,
            u.email AS userEmail,
            u.active AS userActive,
            u.created_at AS userCreatedAt,
            u.altered_at AS userAlteredAt
          FROM tenants t
          INNER JOIN users u ON (t.tenant_id = u.tenant_id AND u.deleted_at IS NULL)
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

  static async findOneById (tenantId, userId, options = {
    withPassword: true
  }) {
    // Essa promise recupera o registro
    return new Promise((resolve, reject) => {
      (async () => {
        const data = await db.getOne(`
          SELECT
            u.user_id AS userId,
            u.name AS userName,
            u.cpf AS userCpf,
            u.email AS userEmail,
            ${options.withPassword ? 'u.password AS userPassword, ' : ''}
            u.active AS userActive,
            u.created_at AS userCreatedAt,
            u.altered_at AS userAlteredAt
          FROM tenants t
          INNER JOIN users u ON (t.tenant_id = u.tenant_id AND u.deleted_at IS NULL)
          WHERE t.deleted_at IS NULL
          AND t.tenant_id = ?
          AND u.user_id = ?;
        `, [
          tenantId,
          userId
        ])

        resolve(data)
      })()
    })
      // Essa promise formata os dados ou renomeia as colunas
      .then(data => {
        if (!data) return data

        let newItem = {}

        for (const i in data) {
          if (typeof viewColumns[i] !== 'undefined') {
            // newItem[viewColumns[i]] = data[i]
            newItem = makeObj(newItem, viewColumns[i], data[i])
          }
        }

        return newItem
      })
      // Essa promise retorna os dados no padrão do sistema
      .then(data => {
        const ret = new JsonReturn()

        if (!data) {
          ret.setCode(404)
          ret.setError(true)
        }

        ret.addContent('data', data)

        return ret.generate()
      })
  }

  static async create (tenantId, fields) {
    return new Promise((resolve, reject) => {
      const ret = new JsonReturn()

      ret.addFields(['name', 'cpf', 'email', 'password'])

      const { name, cpf, email, password } = fields

      if (!validator(ret, {
        name,
        cpf,
        email,
        password
      }, {
        name: 'required|string|min:3|max:255',
        cpf: 'string|size:11',
        email: 'required|email|min:3|max:255',
        password: 'required|string|min:6|max:32'
      })) {
        ret.setError(true)
        ret.setCode(400)
        ret.addMessage('Verifique todos os campos.')
        return reject(ret)
      }

      const next = {
        fields: {
          name,
          cpf,
          email,
          password
        },
        ret
      }

      resolve(next)
    })
      // Essa promise verifica se o email do registro já existe
      .then(async next => {
        const dataExists = await db.getOne(`
          SELECT user_id
          FROM users
          WHERE deleted_at IS NULL
          AND email = ?;
        `, [
          next.fields.email
        ])

        /**/console.log('dataExists', dataExists)

        if (dataExists) {
          next.ret.setFieldError('email', true, 'Já existe um usuário com este e-mail.')

          next.ret.setError(true)
          next.ret.setCode(400)
          next.ret.addMessage('Verifique todos os campos.')

          throw next.ret
        }

        return next
      })
      // Essa promise verifica se o cpf do registro já existe
      .then(async next => {
        if (next.fields.cpf) {
          const dataExists = await db.getOne(`
            SELECT user_id
            FROM users
            WHERE deleted_at IS NULL
            AND cpf = ?;
          `, [
            next.fields.cpf
          ])

          if (dataExists) {
            next.ret.setFieldError('cpf', true, 'Já existe um usuário com este CPF.')

            next.ret.setError(true)
            next.ret.setCode(400)
            next.ret.addMessage('Verifique todos os campos.')

            throw next.ret
          }
        }

        return next
      })
      // Essa promise criptografa a senha
      .then(async next => {
        next.fields.password = await bcrypt.hashSync(next.fields.password, 10)

        return next
      })
      // Essa promise cria o registro e retorna sua estancia
      .then(async next => {
        next.fields.user_id = await db.uuid()

        await db.insert(`
          INSERT INTO users (user_id, tenant_id, name, cpf, email, password, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW());
        `, [
          next.fields.user_id,
          tenantId,
          next.fields.name,
          next.fields.cpf,
          next.fields.email,
          next.fields.password
        ])

        return this.findOneById(tenantId, next.fields.user_id)
      })
  }

  static async update (tenantId, userId, fields) {
    return this.findOneById(tenantId, userId, {
      withPassword: true
    })
      // Essa promise verifica os campos informados
      .then(async findRet => {
        const data = findRet.content.data

        const ret = new JsonReturn()

        const { name, cpf, email, password, active } = fields
        let fieldCount = 0
        const updateFields = {}
        const updateValidades = {}

        if (name !== undefined) {
          ret.addField('name')
          fieldCount++
          updateFields.name = name
          updateValidades.name = 'required|string|min:3|max:255'
        }

        if (cpf !== undefined) {
          ret.addField('cpf')
          fieldCount++
          updateFields.cpf = cpf
          updateValidades.cpf = 'required|string|size:11'
        }

        if (email !== undefined) {
          ret.addField('email')
          fieldCount++
          updateFields.email = email
          updateValidades.email = 'required|email|min:3|max:255'
        }

        if (password !== undefined) {
          ret.addField('password')
          fieldCount++
          updateFields.password = password
          updateValidades.password = 'required|string|min:6|max:32'
        }

        if (active !== undefined) {
          ret.addField('active')
          fieldCount++
          updateFields.active = active
          updateValidades.active = 'required|integer|between:0,1'
        }

        if (!fieldCount) {
          ret.setError(true)
          ret.setCode(400)
          ret.addMessage('Nenhum campo foi informado.')
          throw ret
        }

        if (!validator(ret, updateFields, updateValidades)) {
          ret.setError(true)
          ret.setCode(400)
          ret.addMessage('Verifique todos os campos.')
          throw ret
        }

        const next = {
          fields: {
            name,
            cpf,
            email,
            password,
            active
          },
          data,
          ret
        }

        return next
      })
      // Essa promise verifica se o email do registro já existe
      .then(async next => {
        if (next.fields.email) {
          const dataExists = await db.getOne(`
              SELECT user_id
              FROM users
              WHERE deleted_at IS NULL
              AND email = ?
              AND user_id != ?;
            `, [
            next.fields.email,
            next.data.user.id
          ])

          if (dataExists) {
            next.ret.setFieldError('email', true, 'Já existe um usuário com este e-mail.')

            next.ret.setError(true)
            next.ret.setCode(400)
            next.ret.addMessage('Verifique todos os campos.')

            throw next.ret
          }
        }

        return next
      })
      // Essa promise verifica se o cpf do registro já existe
      .then(async next => {
        if (next.fields.cpf) {
          const dataExists = await db.getOne(`
              SELECT user_id
              FROM users
              WHERE deleted_at IS NULL
              AND cpf = ?
              AND user_id != ?;
            `, [
            next.fields.cpf,
            next.data.user.id
          ])

          if (dataExists) {
            next.ret.setFieldError('cpf', true, 'Já existe um usuário com este CPF.')

            next.ret.setError(true)
            next.ret.setCode(400)
            next.ret.addMessage('Verifique todos os campos.')

            throw next.ret
          }
        }

        return next
      })
      // Essa promise criptografa a senha
      .then(async next => {
        if (next.fields.password !== undefined) {
          next.fields.password = await bcrypt.hashSync(next.fields.password, 10)
        }

        return next
      })
      // Essa promise coloca os novos campos no registro
      .then(next => {
        if (typeof next.fields.name !== 'undefined') next.data.user.name = next.fields.name
        if (typeof next.fields.cpf !== 'undefined') next.data.user.cpf = next.fields.cpf
        if (typeof next.fields.email !== 'undefined') next.data.user.email = next.fields.email
        if (typeof next.fields.password !== 'undefined') next.data.user.password = next.fields.password
        if (typeof next.fields.active !== 'undefined') next.data.user.active = Number(next.fields.active)

        return next
      })
      // Essa promise atualiza o registro
      .then(async next => {
        await db.update(`
          UPDATE users
          SET name = ?,
          cpf = ?,
          email = ?,
          password = ?,
          active = ?,
          altered_at = NOW()
          WHERE user_id = ?;
        `, [
          next.data.user.name,
          next.data.user.cpf,
          next.data.user.email,
          next.data.user.password,
          next.data.user.active,
          next.data.user.id
        ])

        return this.findOneById(tenantId, next.data.user.id)
      })
  }

  static delete (tenantId, userId) {
    return this.findOneById(tenantId, userId)
      .then(async findRet => {
        await db.update(`
          UPDATE users
          SET deleted_at = NOW()
          WHERE user_id = ?;
        `, [
          findRet.content.data.user.id
        ])
      })
  }

  static auth (email, password) {
    // const hash = bcrypt.hashSync('123456', 10)
    // /**/console.log('hash', hash)

    return new Promise((resolve, reject) => {
      const ret = new JsonReturn()

      ret.addFields(['email', 'password'])

      if (!validator(ret, {
        email,
        password
      }, {
        email: 'required|string|email|max:128',
        password: 'required|string|max:32'
      })) {
        ret.setError(true)
        ret.setCode(400)
        ret.addMessage('Verifique todos os campos.')
        return reject(ret)
      }

      const next = {
        fields: {
          email,
          password
        },
        ret
      }

      resolve(next)
    })
      // Essa promise verifica se já existe um usuário com este email
      .then(async next => {
        const dataExists = await db.getOne(`
          SELECT user_id, password
          FROM users
          WHERE deleted_at IS NULL
          AND active = 1
          AND email = ?;
        `, [
          next.fields.email
        ])

        if (!dataExists) {
          next.ret.setError(true)
          next.ret.setCode(404)
          next.ret.addMessage('Usuário não encontrado.')

          throw next.ret
        }

        next.data = dataExists

        return next
      })
      // Essa promise verifica a senha do usuário
      .then(async next => {
        const passwordVerify = bcrypt.compareSync(password, next.data.password)

        if (!passwordVerify) {
          next.ret.setError(true)
          next.ret.setCode(404)
          next.ret.addMessage('Usuário não encontrado.')

          throw next.ret
        }

        return next
      })
      // Essa promise gera o token
      .then(next => {
        const ret = new JsonReturn()

        const tokenObj = {
          hash: next.data.user_id
        }

        const exp = Number(process.env.TOKEN_EXPIRATION_SEC || 0)
        if (exp) {
          tokenObj.exp = Math.floor(Date.now() / 1000) + exp
        }

        const key = process.env.TOKEN_SECRET || ''
        const token = jwt.sign(tokenObj, key)

        ret.addContent('token', token)

        return ret.generate()
      })
  }

  static verifyAuth (accessToken) {
    return new Promise((resolve, reject) => {
      const ret = new JsonReturn()

      if (!accessToken) {
        ret.setError(true)
        ret.setCode(401)
        ret.addMessage('Token inválido.')
        return reject(ret)
      }

      const next = {
        accessToken,
        ret
      }

      resolve(next)
    })
      // Essa promise verifica se o token é um jwt válido e decoda ele
      .then(async next => {
        const key = process.env.TOKEN_SECRET || ''

        try {
          const decodedToken = jwt.verify(next.accessToken, key)

          next.hash = decodedToken.hash

          return next
        } catch (error) {
          next.ret.setError(true)
          next.ret.setCode(401)
          next.ret.addMessage('Token inválido.')

          throw next.ret
        }
      })
      // Essa promise verifica se o usuário existe
      .then(async next => {
        const dataExists = await db.getOne(`
          SELECT u.user_id, t.tenant_id
          FROM users u
          INNER JOIN tenants t ON (u.tenant_id = t.tenant_id AND t.deleted_at IS NULL)
          WHERE u.deleted_at IS NULL
          AND u.active = 1
          AND u.user_id = ?;
        `, [
          next.hash
        ])

        if (!dataExists) {
          next.ret.setError(true)
          next.ret.setCode(401)
          next.ret.addMessage('Token inválido.')

          throw next.ret
        }

        next.data = dataExists

        return this.findOneById(dataExists.tenant_id, dataExists.user_id)
      })
  }
}

module.exports = TenantUsersRepository
