const TenantsRepository = require('../../repositories/tenants')

module.exports = async (req, res) => {
  let ret = req.ret()

  try {
    const { tenantId } = req.params

    await TenantsRepository.delete(tenantId)

    ret.setCode(204)
    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
