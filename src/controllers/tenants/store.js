const TenantsRepository = require('../../repositories/tenants')

module.exports = async (req, res) => {
  let ret = req.ret()

  try {
    const tenant = await TenantsRepository.create(req.body)

    ret.setCode(201)
    ret.addContent('data', tenant.content.data)

    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
