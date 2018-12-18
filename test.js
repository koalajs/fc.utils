const orm = require('./ts-orm')
const TableStore = require('tablestore')
const Long = TableStore.Lang
const config = require('./config')
// tsGet.get('henhao').find().then(res => {
//   console.log('is resolve:', res)
// })
// tsSet.set('good set').find()

// getRow.select('array', 'aaa')
//   .from('node')
//   .keys({
//     a: 'aa',
//     b: 'bb'
//   })
//   .find()
//   .then(res => {
//     console.log('getRow resolve:', res)
//   })
//
//


// const ccc = async function () {
//   const res = await orm.getRow.init(config.table)
//     .table('Auth')
//     .select('password', 'username')
//     .keys({ tk: 'up', id: '18520156336' })
//     .find()
//   console.log('res', res)
//   console.log('format res', orm.formatRow(res.row))
// }
// 
// ccc()

const getRange = async function () {
  const res = await orm.getRange
    .init(config.table)
    .table('Auth')
    .start({
      tk: 'up',
      id: TableStore.INF_MIN
    })
    .end({
      tk: 'up',
      id: TableStore.INF_MAX
    })
    .find()
  console.log(res)
}

getRange()
