const TenantsRepository = require('../../repositories/tenants')

module.exports = async (req, res) => {
  let ret = req.ret()

  try {
    const tenants = await TenantsRepository.findAll({
      filter: req.query || {}
    })

    ret.addContent('meta', tenants.content.meta)
    ret.addContent('data', tenants.content.data)

    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
