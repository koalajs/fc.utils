const { tsGet, tsSet, getRow } = require('./ts-orm')
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


const ccc = async function () {
  const res = await getRow.select('array', 'aaa')
  .from('node')
  .keys({
    a: 'aa',
    b: 'bb'
  })
  .find()
  console.log('res', res)
}

ccc()


