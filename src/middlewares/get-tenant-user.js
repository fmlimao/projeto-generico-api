const TenantUsersRepository = require('../repositories/tenant-users')

module.exports = async (req, res, next) => {
  let ret = req.ret()

  try {
    const { tenantId, userId } = req.params
    const user = (await TenantUsersRepository.findOneById(tenantId, userId)).content.data

    if (!user) {
      ret.setCode(404)
      throw new Error('Usuário não encontrado.')
    }

    req.user = user

    next()
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
