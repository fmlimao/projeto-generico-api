const TenantsRepository = require('../../repositories/tenants')

module.exports = async (req, res) => {
  let ret = req.ret()

  try {
    const { tenantId } = req.params
    const { name, active } = req.body

    const tenant = await TenantsRepository.update(tenantId, { name, active })

    ret.addContent('data', tenant.content.data)
    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
