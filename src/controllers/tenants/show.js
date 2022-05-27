module.exports = async (req, res) => {
  let ret = req.ret()

  try {
    ret.addContent('data', req.tenant)
    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
