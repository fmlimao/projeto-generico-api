module.exports = function makeObj (obj, keys, value = null) {
  if (typeof keys === 'string') {
    keys = keys.split('.')
    return makeObj(obj, keys, value)
  } else if (typeof keys === 'object') {
    if (keys.length > 1) {
      const key = keys.shift()

      if (typeof obj[key] === 'undefined') obj[key] = {}

      obj[key] = makeObj(obj[key], keys, value)
      return obj
    } else if (keys.length === 1) {
      const key = keys[0]

      if (typeof obj[key] === 'undefined') obj[key] = value
      return obj
    }
  }
}
