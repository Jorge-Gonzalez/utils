
import * as _ from '../src/index.js'

const log = v => (console.log(v), v)

// ([1,2,3])

// let res = _.forEach(x => log(x + 2))({uno: 1, dos: 2, tres: 3})

let fn = (a, b, c) => a + b + c
let pairs = [
  ['uno', 'one'],
  ['dos', 'two'],
  ['tres', 'three'],
]
let list = [0, 1, 0, 4, 0, 2, 0, 5, 0, 9]
let numb = ['uno', 'one', 'dos', 'two', 'tres', 'three']

let flipped = _.flip(fn)
let normal = _.curry2(fn)
let fromPairs = _.fromPairs(pairs)

console.log(

  flipped(' uno ', ' dos ', ' tres '), '\n',
  normal(' uno ', ' dos ', ' tres '), '\n',
  fromPairs, '\n',
  _.findIndexes(n => n === 0)(list), '\n',
  _.concat(list)(numb), '\n',
  list.slice() == list, '\n',


)
