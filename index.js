const getRawBody = require('raw-body')
const R = require('ramda')
module.exports = {
  getBody: async (req) => {
    const data = await getRawBody(req)
    return R.isNil(data) ? {} : JSON.parse(data)
  },
  httpSend: (rep, data, code=200, hander=null) => {
    rep.setHeader('content-type', 'application/json')
    rep.setStatusCode(code)
    rep.send(JSON.stringify(data))
  }
}
