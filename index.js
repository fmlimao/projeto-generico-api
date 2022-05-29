console.clear()

require('dotenv-safe').config()

const express = require('express')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// const getAuthMiddleware = require('./src/middlewares/get-auth')
const verifyAuthMiddleware = require('./src/middlewares/verify-auth')
const getTenant = require('./src/middlewares/get-tenant')
const getTenantUser = require('./src/middlewares/get-tenant-user')

app.use(require('./src/middlewares/json-return'))

// app.use(getAuthMiddleware)

app.get('/', /* verifyAuthMiddleware,  */require('./src/controllers/home/get'))

// Rota de autenticação
app.post('/auth', require('./src/controllers/auth/auth'))

app.use(verifyAuthMiddleware)

// Inquilinos
app.get('/tenants', /* verifyAuthMiddleware,  */require('./src/controllers/tenants/list'))
app.post('/tenants', /* verifyAuthMiddleware,  */require('./src/controllers/tenants/store'))
app.get('/tenants/:tenantId', /* verifyAuthMiddleware,  */getTenant, require('./src/controllers/tenants/show'))
app.put('/tenants/:tenantId', /* verifyAuthMiddleware,  */getTenant, require('./src/controllers/tenants/update'))
app.delete('/tenants/:tenantId', /* verifyAuthMiddleware,  */getTenant, require('./src/controllers/tenants/remove'))

// Inquilino - Usuários
app.get('/tenants/:tenantId/users', /* verifyAuthMiddleware,  */getTenant, require('./src/controllers/tenants/users/list'))
app.post('/tenants/:tenantId/users', /* verifyAuthMiddleware,  */getTenant, require('./src/controllers/tenants/users/store'))
app.get('/tenants/:tenantId/users/:userId', /* verifyAuthMiddleware,  */getTenant, getTenantUser, require('./src/controllers/tenants/users/show'))
app.put('/tenants/:tenantId/users/:userId', /* verifyAuthMiddleware,  */getTenant, getTenantUser, require('./src/controllers/tenants/users/update'))
app.delete('/tenants/:tenantId/users/:userId', /* verifyAuthMiddleware,  */getTenant, getTenantUser, require('./src/controllers/tenants/users/remove'))

app.use(require('./src/middlewares/error-404'))
app.use(require('./src/middlewares/error-500'))

const { PORT = 3000 } = process.env

app.listen(PORT, async () => {
  console.log(`Servidor rodando no host http://localhost:${PORT}/`)
})
