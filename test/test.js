// import { _includes } from '../src/base.js'
// import { map, transduce } from '../src/extended.js'
import { _slice, _concat, _includes } from '../src/internal.js'

function concatSparse(placeholder, sparse, lst) {
  let i = 0,
    j = 0,
    li = sparse.length,
    lj = lst.length,
    res = [],
    curr

  for (; i < li; i++) {
    res[i] = sparse[i] === placeholder && j < lj ? lst[j++] : sparse[i]
  }

  for (; j < lj; j++, i++) {
    res[i] = lst[j]
  }

  return res
}

let s = [4, 7, 9]
let t = [1, 2, 3, 5, 6, 8, 0]

function incudesAny(source, target) {
  let i = 0, l = source.length
  for (; i < l; i++) {
    if( _includes(source[i], target)) { return true }
  }
  return false
}

console.log(incudesAny(s, t))