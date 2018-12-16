/**
 * 当前文件作用为包装ts， 完成new client
 * 实现orm操作的封装， create, set, delete
 * 提供额外的格式处理方法， format, formatToTable
 * */

const TableStore = require('tablestore')
const Long = TableStore.Lang
const R = require('ramda')

const client = function (config) {
  return new Promise((resolve, reject) => {
    try {
      const c = new TableStore.Client(config)
      resolve(c)
    } catch (err){
      reject(err)
    }
  })
}


const getRow = {
  table: '',
  params: {},
  columnFilter: [],
  select: function (...columns) {
    // 处理*的问题
    this.columnFilter = [...columns]
    return this
  },
  from: function (tableName) {
    if (!tableName) {
      throw new Error ('表名不能为空')
    }
    this.table = tableName
    this.format('is show format')
    return this
  },
  keys: function (keys) {
    this.params.paramsKey = keys
    return this
  },
  attr: function (attr) {
    // 处理attr结构问题
    return this
  },
  find: function () {
    return new Promise((resolve, reject) => {
      const result = {table: this.table, cloumns: this.columnFilter}
      resolve(this.format(result))
    })
  },
  format: function (data) {
    return R.assoc('c', 'ccc', data)
  }
}

const tsGet = {
  type: 'fun',
  get: function (primary) {
    if (!primary) throw new Error('表格名称不能为空')
    this.type = primary
    return this
  },
  find: function () {
    console.log('result:', this.type)
    return new Promise(resolve => {
      resolve('promise is good')
    })
  }
}

function tsSet() {}
tsSet.prototype = {
  type: 'fun',
  set: function (primary) {
    this.type = primary
    return this
  },
  find: function () {
    console.log('result:', this.type)
    return this
  }
}


module.exports = {
  client,
  tsGet,
  getRow
}

module.exports.tsSet = new tsSet()
