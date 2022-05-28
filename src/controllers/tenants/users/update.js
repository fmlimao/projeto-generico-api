const TenantUsersRepository = require('../../../repositories/tenant-users')

module.exports = async (req, res) => {
  let ret = req.ret()

  try {
    const { tenantId, userId } = req.params
    const { name, email, cpf, active } = req.body

    const user = await TenantUsersRepository.update(tenantId, userId, { name, email, cpf, active })

    ret.addContent('data', user.content.data)
    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
