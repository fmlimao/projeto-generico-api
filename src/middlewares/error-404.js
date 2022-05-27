module.exports = (req, res, next) => {
  const ret = req.ret()

  ret.setCode(404)
  ret.setError(true)
  ret.addMessage('Rota não encontrada')

  res.status(ret.getCode()).json(ret.generate())
}
