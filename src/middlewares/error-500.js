module.exports = (err, req, res, next) => {
  let ret = req.ret()
  ret = res.errorHandler(err, ret)
  res.status(ret.getCode()).json(ret.generate())
}
