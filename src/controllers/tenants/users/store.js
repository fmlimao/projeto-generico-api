const TenantUsersRepository = require('../../../repositories/tenant-users')

module.exports = async (req, res) => {
  let ret = req.ret()

  try {
    const { tenantId } = req.params
    const user = await TenantUsersRepository.create(tenantId, req.body)

    ret.setCode(201)
    ret.addContent('data', user.content.data)

    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
