module.exports = (req, res) => {
  let ret = req.ret()

  try {
    ret.addContent('status', 'ok')
    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
