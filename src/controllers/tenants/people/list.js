const TenantPeopleRepository = require('../../../repositories/tenant-people')

module.exports = async (req, res) => {
  let ret = req.ret()

  try {
    const { tenantId } = req.params
    const people = await TenantPeopleRepository.findAll(tenantId, {
      filter: req.query || {}
    })

    ret.addContent('meta', people.content.meta)
    ret.addContent('data', people.content.data)

    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
