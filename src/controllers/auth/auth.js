const base64 = require('base-64')
const TenantUsersRepository = require('../../repositories/tenant-users')

module.exports = async (req, res) => {
  let ret = req.ret()

  try {
    const authorization = (req.header('authorization') || '').replace(/^Basic\s/, '')
    const decodedAutorization = base64.decode(authorization)
    const [email, password] = decodedAutorization.split(':')

    const auth = await TenantUsersRepository.auth(email, password)

    ret.addContent('accessToken', auth.content.token)

    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
