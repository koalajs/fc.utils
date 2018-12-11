const jwt = require('jsonwebtoken')
module.exports = {
  checkToken: (token, key) => {
    return jwt.verify(token, key)
  },
  checkPermission: () => {
  }
}
