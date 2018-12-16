/**
 * 当前文件作用为包装ts， 完成new client
 * 实现orm操作的封装， create, set, delete
 * 提供额外的格式处理方法， format, formatToTable
 * */

const TableStore = require('tablestore')
const Long = TableStore.Lang
const { reduce, values, assoc, merge, mapObjIndexed, is } = require('ramda')

const client = function (config) {
  return new Promise((resolve, reject) => {
    try {
      const ts = new TableStore.Client(config)
      resolve(ts)
    } catch (err){
      reject(err)
    }
  })
}

const formatRow = function (row) {
  const keys = reduce((a, v) => {
    const kv = values(v)
    return assoc(kv[0], kv[1], a)
  }, {}, row.primaryKey)
  const attributes = reduce((a, v) => {
    const kv = values(v)
    return assoc(kv[0], kv[1], a)
  }, {}, row.attributes)
  return merge(keys, attributes)
}


const getRow = {
  config: {},
  tableName: null,
  primaryKey: [],
  columnToGet: [],
  maxVersions: 1,
  init: function (config) {
    this.config = config
    return this
  },
  select: function (...columns) {
    this.columnToGet = [...columns]
    return this
  },
  table: function (tableName) {
    if (!tableName) {
      throw new Error ('表名不能为空')
    }
    this.tableName = tableName
    return this
  },
  maxVersion: function (v) {
    this.maxVersions = v
    return this
  },
  keys: function (keys) {
    // 针对Number做处理
    // TODO 一个疑问，为什么TableStore 要演示为一个[ {a: 'a'}, {b: 'b'}]的结构, 而下面使用的[{a: 'a', b: 'b'}]亦可公共，是否存在问题?
    this.primaryKey = [mapObjIndexed((v, k, obj) => is(Number)(v) ? Long.fromNumber(v) : v)(keys)]
    return this
  },
  attr: function (attr) {
    // 处理attr结构问题
    return this
  },
  find: function () {
    return new Promise((resolve, reject) => {
      const params = {
        tableName: this.tableName,
        primaryKey: this.primaryKey,
        columnToGet: this.columnToGet,
        maxVersions: this.maxVersions
      }
      client(this.config).then(ts => {
        ts.getRow(params).then(data => {
          resolve(data)
        }).catch(err => {
          reject(err)
        })
      }).catch (err => {
        reject(err)
      })
    })
  }
}

module.exports = {
  client,
  getRow,
  formatRow
}

