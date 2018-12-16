const orm = require('./ts-orm')
const TableStore = require('tablestore')
const Long = TableStore.Lang
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


const ccc = async function () {
  const res = await orm.getRow.init(config)
    .table('Auth')
    .select('password', 'username')
    .keys({ tk: 'up', id: '18520156336' })
    .find()
  console.log('format res', orm.formatRow(res.row))
}

ccc()


