const TenantUsersRepository = require('../repositories/tenant-users')

module.exports = async (req, res, next) => {
  let ret = req.ret()

  try {
    const accessToken = (req.header('authorization') || '').replace(/^Bearer\s/, '')
    const auth = (await TenantUsersRepository.verifyAuth(accessToken)).content.data

    if (!auth) {
      ret.setCode(404)
      throw new Error('Inquilino não encontrado.')
    }

    req.auth = auth

    next()
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
