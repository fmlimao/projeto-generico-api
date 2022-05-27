const JsonReturn = require('fm-json-response')
const errorHandler = require('fm-express-error-handler')

module.exports = (req, res, next) => {
  req.ret = () => {
    return new JsonReturn()
  }
  res.errorHandler = errorHandler
  next()
}
