
/**
 * 当前文件作用为包装ts， 完成new client
 * 实现orm操作的封装， create, set, delete
 * 提供额外的格式处理方法， format, formatToTable
 * */

const TableStore = require('tablestore')
const Long = TableStore.Long
const R = require('ramda')

const client = function (config) {
  return new Promise((resolve, reject) => {
    try {
      const ts = new TableStore.Client(config)
      resolve(ts)
    } catch (err) {
      reject(err)
    }
  })
}

const formatRow = function (row) {
  if (R.isEmpty(row)) return row
  const keys = R.reduce((a, v) => {
    const kv = R.values(v)
    return R.assoc(kv[0], kv[1], a)
  }, {}, row.primaryKey)
  const attributes = R.reduce((a, v) => {
    const kv = R.values(v)
    return R.assoc(kv[0], kv[1], a)
  }, {}, row.attributes)
  return R.merge(keys, attributes)
}

const getRow = {
  config: {},
  params: {
    tableName: null,
    primaryKey: [],
    columnToGet: [],
    maxVersions: 1,
  },
  init: function (config) {
    if (R.isEmpty(config) || R.isNil(config)) {
      throw new Error('缺少TableStore配置')
    }
    this.config = config
    return this
  },
  select: function (...columns) {
    this.params.columnToGet = [...columns]
    return this
  },
  table: function (tableName) {
    if (!tableName) {
      throw new Error('表名不能为空')
    }
    this.params.tableName = tableName
    return this
  },
  maxVersion: function (v) {
    this.params.maxVersions = v
    return this
  },
  keys: function (keys) {
    // 针对Number做处理
    // TODO 一个疑问，为什么TableStore 要演示为一个[ {a: 'a'}, {b: 'b'}]的结构, 而下面使用的[{a: 'a', b: 'b'}]亦可公共，是否存在问题?
    this.params.primaryKey = R.reduce((a, v) => {
      return R.append(R.objOf(v[0], R.is(Number, v[1]) ? Long.fromNumber(v[1]) : v[1]), a)
    }, [], R.toPairs(keys))
    return this
  },
  attr: function (attr) {
    // 处理attr结构问题
    return this
  },
  find: function () {
    return new Promise((resolve, reject) => {
      client(this.config)
        .then(ts => ts.getRow(this.params))
        .then(data => resolve(data))
        .catch(err => {
          reject(err)
        })
    })
  }
}

const putRow = {
  config: {},
  tableName: null,
  primaryKey: [],
  condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
  attributeColumns: [],
  returnContent: { returnType: TableStore.ReturnType.PrimaryKey },
  init: function (config) {
    if (R.isEmpty(config) || R.isNil(config)) {
      throw new Error('缺少TableStore配置')
    }
    this.config = config
    return this
  },
  table: function (tableName) {
    if (!tableName) {
      throw new Error('表名不能为空')
    }
    this.tableName = tableName
    return this
  },
  keys: function (keys) { // obj => array, number => Long.formatNumber
    this.primaryKey = R.reduce((a, v) => {
      return R.append(R.objOf(v[0], R.is(Number, v[1]) ? Long.fromNumber(v[1]) : v[1]), a)
    }, [], R.toPairs(keys))
    return this
  },
  attr: function (attr) {
    // toPairs
    this.attributeColumns = R.reduce((a, v) => R.append(R.objOf(v[0])(v[1]))(a), [], R.toPairs(attr))
    return this
  },
  put: function () {
    return new Promise((resolve, reject) => {
      const params = {
        tableName: this.tableName,
        primaryKey: this.primaryKey,
        condition: this.condition,
        returnContent: this.returnContent,
        attributeColumns: this.attributeColumns
      }
      client(this.config).then(ts => {
        ts.putRow(params).then(data => {
          resolve(this.result(data))
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  result: function (data) {
    // 如果存在 consumed.capacity_unit.write > 0
    const w = R.path(['consumed', 'capacity_unit', 'write'], data)
    return R.not(R.isNil(w)) && R.gt(w, 0)
  }
}


const getRange = {
  config: {},
  params: {
    tableName: null,
    direction: TableStore.Direction.FORWARD,
    inclusiveStartPrimaryKey: [],
    exclusiveEndPrimaryKey: [],
    limitRows: 1,
  },
  resultRows: [],
  init: function (config) {
    if (R.isEmpty(config) || R.isNil(config)) {
      throw new Error('缺少TableStore配置')
    }
    this.config = config
    return this
  },
  table: function (tableName) {
    if (!tableName) {
      throw new Error('表名不能为空')
    }
    this.params.tableName = tableName
    return this
  },
  start: function (keys) {
    this.params.inclusiveStartPrimaryKey = R.reduce((a, v) => {
      return R.append(R.objOf(v[0], R.is(Number, v[1]) ? Long.fromNumber(v[1]) : v[1]), a)
    }, [], R.toPairs(keys))
    return this
  },
  end: function (keys) {
    this.params.exclusiveEndPrimaryKey = R.reduce((a, v) => {
      return R.append(R.objOf(v[0], R.is(Number, v[1]) ? Long.fromNumber(v[1]) : v[1]), a)
    }, [], R.toPairs(keys))
    return this
  },
  limit: function (limit) {
    this.params.limitRows = limit
    return this
  },
  find: function () {
    return new Promise((resolve, reject) => {
      client(this.config).then(ts => {
        ts.getRange(this.params).then(data => {
          this.resultRows = R.union(R.flatten(data.rows))(this.resultRows)
          if (data.next_start_primary_key) {
            this.find()
          } else {
            resolve(this.result(this.resultRows))
          }
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  result: function (data) {
    const item = i => {
      // console.log('a:', i.primaryKey)
      // console.log('b:', i.attributes)
      return i
    }
    const list = R.map(item, data)
    return R.flatten(data)
  }
}

const deleteRow = {
  config: {},
  params: {
    tableName: null,
    primaryKey: [],
    condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null)
  },
  init: function (config) {
    if (R.isEmpty(config) || R.isNil(config)) {
      throw new Error('缺少TableStore配置')
    }
    this.config = config
    return this
  },
  table: function (tableName) {
    if (!tableName) {
      throw new Error('表名不能为空')
    }
    this.params.tableName = tableName
    return this
  },
  keys: function (keys) {
    this.params.primaryKey = R.reduce((a, v) => {
      return R.append(R.objOf(v[0], R.is(Number, v[1]) ? Long.fromNumber(v[1]) : v[1]), a)
    }, [], R.toPairs(keys))
    return this
  },
  delete: function () {
    return new Promise((resolve, reject) => {
      client(this.config)
        .then(ts => ts.deleteRow(this.params))
        .then(data => {
          resolve(data)
        }).catch(err => {
          reject(err)
        })
    })
  }
}

module.exports = {
  client,
  getRow,
  putRow,
  getRange,
  deleteRow,
  formatRow
}
