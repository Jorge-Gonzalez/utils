/*!  Utils may be freely distributed under the MIT license. */
import { _all, _any, _concat, _map, _mapObject, _slice, _includes, _indexOf } from './internal.js'

const exp = {}

  ;['toLowerCase', 'toUpperCase', 'trim']
    .forEach(name => (exp[name] = (coll) => coll[name]()))

  ;['concat', 'every', 'filter', 'find', 'findIndex', 'forEach', 'indexOf', 'join', 'map', 'some', 'sort', 'match', 'split']
    .forEach(name => (exp[name] = curry2((arg, coll) => coll[name](arg), name)))

  ;['reduce', 'reduceRight', 'replace']
    .forEach(name => (exp[name] = curry3((arg1, arg2, coll) => coll[name](arg1, arg2), name)))

  ;['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error']
    .forEach(t => (exp['is' + t] = o => Object.prototype.toString.call(o) === '[object ' + t + ']'))

const __ = { '@@functional/placeholder': true }


const _add = (a, b) => a + b

const add = curry2(_add)

const _adjust = (fn, i, arr) => {
  const l = arr.length, res = arr.slice()
  return 0 <= (i < 0 ? i + l : i) < l ? (res[i] = fn(arr[i]), res) : res
}

const adjust = curry2(_adjust)

const all = curry2(_all)

const any = curry2(_any)

const _append = (val, arr) => [...arr, val]

const append = curry2(_append)

function arity(n, fn) {
  switch (n) {
    case 0: return function() { return fn.apply(this, arguments) }
    case 1: return function(a0) { return fn.apply(this, arguments) }
    case 2: return function(a0, a1) { return fn.apply(this, arguments) }
    case 3: return function(a0, a1, a2) { return fn.apply(this, arguments) }
    case 4: return function(a0, a1, a2, a3) { return fn.apply(this, arguments) }
    case 5: return function(a0, a1, a2, a3, a4) { return fn.apply(this, arguments) }
    case 6: return function(a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments) }
    default: throw new Error('arity\'s length must be between 0 and 6');
  }
}

const arrayFromIterator = (iter) => {
  let re = [], next
  while (!(next = iter.next()).done) re.push(next.value)
  return re
}

const _assoc = (prop, val, obj) => {
  const res = Number.isInteger(prop) && Array.isArray(obj)
    ? [].concat(obj)
    : cloneObject(obj)
  res[prop] = val
  return res
}

const assoc = curry3(_assoc)

const _assocPath = (path, val, obj) => {
  if (path.length === 0) {
    return val;
  }
  var prop = path[0];
  if (path.length > 1) {
    var nextObj = (obj != null && typeof obj?.[prop] === 'object') ? obj[prop] : Number.isInteger(path[1]) ? [] : {};
    val = _assocPath(_slice(1, null, path), val, nextObj);
  }
  return assoc(prop, val, obj);
}

const assocPath = curry3(_assocPath)

const _bind = (fn, ctx) => arity(fn.length, (...args) => fn.apply(ctx, args))

const bind = curry2(_bind)

const both = (a, b) => (x) => a(x) && b(x)

const cloneArray = arr => _slice(arr)

const cloneObject = obj => ({ ...obj })

const clone = e => isArray(e) ? cloneArray(e) : cloneObject(e)

const concat = curry2(_concat)

const _converge = (after, fns) => function() {
  var args = arguments
  var ctx = this
  return after.apply(ctx, map(function(fn) {
    return fn.apply(ctx, args)
  }, fns))
}

const converge = curry2(_converge)

const complement = fn => (...args) => !fn(...args)

function compose(...funcs) {
  if (funcs.length < 2) throw new Error('compose requires at least two arguments')
  var last = funcs.length - 1
  return arity(funcs[last].length, function(...args) {
    let i = last
    let result = funcs[last].apply(this, args)
    while (i--) result = funcs[i].call(this, result)
    return result;
  })
}

const _count = (fn, arr) => _reduce((c, v) => fn(v) ? ++c : c, 0, arr)

const count = curry2(_count)

const _chunk = (size, arr) => {
  if (size <= 0) throw Error('chunk size must be positive')
  let res = [], i = 0,
    j = 0, l = arr.length
  while (i < l) res[j++] = _slice(i, i += size, arr)
  return res
}

const chunk = curry2(_chunk)

const curry = (fn, n) => curryN(n || fn.length, fn)

function curry2(fn) {
  return function f2(a, b) {
    return arguments.length === 1 ?
      function f1(_b) { return fn(a, _b) } :
      fn(a, b)
  }
}

function curry3(fn) {
  return function f3(a, b, c) {
    switch (arguments.length) {
      case 1:
        return curry2(function(_b, _c) { return fn(a, _b, _c) })
      case 2:
        return function f1(_c) { return fn(a, b, _c) }
      default:
        return fn(a, b, c)
    }
  }
}

function _curryN(length, stored, fn) {
  return function(...coming) {
    let i = 0,
      j = 0,
      storedLen = stored.length,
      comingLen = coming.length,
      combined = [],
      left = length,
      curr

    for (; i < storedLen; i++) {
      if (isPlaceholder(stored[i])) {
        if (j < comingLen) {
          curr = coming[j]
          j = j + 1
          if (!isPlaceholder(curr)) {
            left--
          }
          combined[i] = curr
        } else {
          combined[i] = stored[i]
        }
      }
      else {
        combined[i] = stored[i]
        left--
      }
    }

    for (; j < comingLen; j++, i++) {
      curr = coming[j]
      combined[i] = curr
      if (!isPlaceholder(curr)) {
        left--
      }
    }

    return left <= 0
      ? fn.apply(this, combined)
      : arity(left, _curryN(length, combined, fn))
  }
}

// function _curryN(length, received, fn) {
//   return function() {
//     var combined = [];
//     var argsIdx = 0;
//     var left = length;
//     var combinedIdx = 0;
//     while (combinedIdx < received.length || argsIdx < arguments.length) {
//       var result;
//       if (combinedIdx < received.length &&
//         (!isPlaceholder(received[combinedIdx]) ||
//           argsIdx >= arguments.length)) {
//         result = received[combinedIdx];
//       } else {
//         result = arguments[argsIdx];
//         argsIdx += 1;
//       }
//       combined[combinedIdx] = result;
//       if (!isPlaceholder(result)) {
//         left -= 1;
//       }
//       combinedIdx += 1;
//     }
//     return left <= 0
//       ? fn.apply(this, combined)
//       : arity(left, _curryN(length, combined, fn));
//   };
// }

const curryN = curry2((length, fn) => arity(length, _curryN(length, [], fn)))

function _debounce (ms, fn) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = void 0
      fn(...args)
    }, ms)
  };
}

const debounce = curry2(_debounce)

const _defaultTo = (d, v) => v == null || v !== v ? d : v

const defaultTo = curry2(_defaultTo)

const _divide = (a, b) => a / b

const divide = curry2(_divide)

const _drop = (n, arr) => _slice(n, null, arr)

const drop = curry2(_drop)

const _dropWhile = (fn, arr) => {
  let i = 0, len = arr.length
  while (i < len && fn(arr[i])) i++
  return _slice(i, null, arr)
}

const dropWhile = curry2(_dropWhile)

const _dropLast = (n, arr) => _slice(0, -n, arr)

const dropLast = curry2(_dropLast)

const _dropLastWhile = (fn, arr) => {
  let i = arr.length - 1

  while (i >= 0 && fn(arr[i])) i--

  return _slice(0, i + 1, arr)
}

const dropLastWhile = curry2(_dropLastWhile)

const _either = (f, g) => isFunction(f) ? (...args) => f(...args) || g(...args) : lift(or)(f, g)

const either = curry2(_either)

//const either = (a, b) => (x) => a(x) || b(x)

const eq = (a, b, stackA = [], stackB = [], t, keysA, idx) =>
  _identical(a, b) ? true
    : type(a) !== type(b) ? false
      : a == null || b == null ? false
        : typeof a.equals === 'function' || typeof b.equals === 'function' ? a.equals(b) && b.equals(a)
          : includes((t = type(a)), ['Boolean', 'Number', 'String']) ? (typeof a === typeof b && _identical(a.valueOf(), b.valueOf()))
            : t === 'Date' ? _identical(a.valueOf(), b.valueOf())
              : t === 'Error' ? a.name === b.name && a.message === b.message
                : t === 'RegExp' ? ['source', 'global', 'ignoreCase', 'multiline', 'sticky', 'unicode'].every(k => a[k] === b[k])
                  : t === 'Map' || t === 'Set' ? eq(arrayFromIterator(a.entries()), arrayFromIterator(b.entries()), stackA, stackB)
                    : !includes(t, ['Arguments', 'Array', 'Object', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'ArrayBuffer']) ? false
                      : (keysA = keys(a)).length !== keys(b).length ? 'length'// false
                        : (idx = indexOf(a, stackA)) !== -1 ? 'stack'// stackB[idx] === b
                          : (stackA.push(a) && stackB.push(b)) && any(key => !(_has(key, b) && eq(b[key], a[key], stackA, stackB)), keysA) ? 'any'// false
                            : truty(stackA.pop(), stackB.pop())

const equals = curry2(eq)

// every

const _fill = (val, arr) => arr.fill(val)

const fill = curry2(_fill)

const _filterObject = (pred, obj) => Object.keys(obj).reduce((acc, key) => pred(obj[key], key, obj) ? (acc[key] = obj[key], acc) : acc, {})

function _filter(pred, arr) {
  return _reduce((acc, e) => pred(e) ? [...acc, e] : acc, [], arr)
  // let res = [], i = 0, l = arr.length
  // for (; i < l; i++) { if (pred(v)) res[res.length] = v }
  // return res
}

const filter = curry2((f, e) => isArray(e) ? _filter(f, e) : _filterObject(f, e), 'filter')

const _findIndexes = (fn, arr) => _reduce((acc, v, i) => fn(v) ? (acc.push(i), acc) : acc, [], arr)

const findIndexes = curry2(_findIndexes)

const _findLast = (fn, arr) => {
  let i = arr.length
  while (--i >= 0) if (fn(arr[i])) return arr[i]
}

const findLast = curry2(_findLast)

const _findLastIndex = (fn, arr) => {
  var i = arr.length
  while (--i >= 0) if (fn(arr[i])) return i
  return -1
}

const findLastIndex = curry2(_findLastIndex)

const flatten = (arr, res = []) => reduce((acc, val) => isArray(val) ? flatten(val, acc) : acc.push(val) && acc, res, arr)

const flip = f => curry2((a, b, ...rest) => f(b, a, ...rest))

const _forEachObject = (fn, obj) => Object.keys(obj).forEach(key => { fn(obj[key], key, obj) })

function _forEach(f, arr) {
  // return [...Array(arr.length)].map((_,i) => f(arr[i])
  // return _reduce((acc, v) => ( acc.push(f(v)), acc ), [], arr)
  // return _reduce((acc, v) => [...acc, f(v)], [], arr)
  // return _reduce((acc, v) => acc.concat([f(v)]), [], arr)
  let res = [], l = arr.length, i = 0
  for (; i < l; i++) { res[i] = f(arr[i], i, arr) }
  return res
}

const forEach = curry2((f, e) => isArrayLike(e) ? _forEach(f, e) : _forEachObject(f, e), 'forEach')

const fromPairs = pairs => _reduce((acc, pair) => pair.length ? (acc[pair[0]] = pair[1], acc) : acc, {}, pairs)

const _gt = (a, b) => a > b

const gt = curry2(_gt)

const _gte = (a, b) => a >= b

const gte = curry2(_gte)

const _has = (prop, obj) => Object.prototype.hasOwnProperty.call(obj, prop)

const has = curry2(_has)

const head = arr => arr[0]

const _identical = (a, b) => (a === b) ? a !== 0 || 1 / a === 1 / b : a !== a && b !== b

const identical = curry2(_identical)

const identity = x => x

const includes = curry2(_includes)

function _intersects(source, target) {
  let i = 0, l = source.length
  for (; i < l; i++) {
    if (_includes(source[i], target)) { return true }
  }
  return false
}

const intersects = curry2(_intersects)

const _includesWith = (fn, x, arr) => {
  let i = -1, l = arr.length
  while (++i < l) if (fn(x, arr[i])) return true
  return false
}

const includesWith = curry3(_includesWith)

const indexOf = curry2((target, xs) =>
  typeof xs.indexOf === 'function' && !isArray(xs) ?
    xs.indexOf(target) :
    _indexOf(xs, target, 0))

// const _indexOf = (val, arr) => arr.indexOf(val)
// const indexOf = curry2(_indexOf)

const init = arr => _slice(0, arr.length - 1, arr)

const isArray = Array.isArray || exp.isArray

var isArrayLike = (x) =>
  isArray(x) ? true :
    !x || typeof x !== 'object' || isString(x) ? false :
      x.length === 0 ? true :
        x.length > 0 ? x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1) :
          false

const symIterator = Symbol?.iterator ?? '@@iterator'

const isIterator = (it) => typeof it?.[symIterator] === 'function'

const isIterable = (it) => typeof it?.next === 'function'

const isObject = (obj) => typeof obj === 'object' && !!obj

const isPlaceholder = a => a != null && a['@@functional/placeholder'] === true

// join

const juxt = (fns) => converge(function() { return _slice(0, null, arguments) }, fns)


const keys = obj => Object.keys(obj)

const last = arr => arr[arr.length - 1]

const _lastIndexOf = (val, arr) => {
  let i = arr.length
  while (--i >= 0) if (eq(arr[i], val)) return i
  return -1
}

const lastIndexOf = curry2(_lastIndexOf)

const length = arr => arr.length

const _lt = (a, b) => a < b

const lt = curry2(_lt)

const _lte = (a, b) => a <= b

const lte = curry2(_lte)

const lift = (fn) => liftN(fn.length, fn)

const _liftN = function liftN(arity, fn) {
  var lifted = curryN(arity, fn)
  return curryN(arity, function() {
    return _arrayReduce(ap, map(lifted, arguments[0]), _slice(arguments, 1))
  })
}

const liftN = curry2(_liftN)

const log = x => (console.log(x), x)

const mapPoly = (fn, seq) => {
  switch (Object.prototype.toString.call(seq)) {
    case '[object Function]':
      return curryN(seq.length, function() {
        return fn.call(this, seq.apply(this, arguments))
      })
    case '[object Object]':
      return _mapObject(fn, seq)
    default:
      return _map(fn, seq)
  }
}

const map = curry2(mapPoly)

const _max = (a, b) => b > a ? b : a

const max = curry2(_max)

const mean = (arr) => sum(arr) / arr.length

const median = (arr) => {
  const len = arr.length
  if (len === 0) {
    return NaN
  }
  var width = 2 - len % 2
  var mid = (len - width) / 2;
  return mean(_slice(0, null, arr).sort((a, b) => a < b ? -1 : a > b ? 1 : 0).slice(mid, mid + width))
}

// match

const memoize = (fn, hasher, cache = {}) => arity(fn.length, function(key) {
  let address = '' + (hasher ? hasher(arguments) : key)
  if (!_has(address, cache)) cache[address] = fn.apply(this, arguments)
  return cache[address]
})

const _merge = (obj, props) => Object.assign({}, obj, props)

const merge = curry2(_merge)

const _mergeByIndexes = (idxs, update, base) => reduce((a, v, i) => (a[(idxs[i] != null ? idxs[i] : a.length)] = v) && a, base, update)

const mergeByIndexes = curry3(_mergeByIndexes)

const _mergeWith = (fn, l, r) => mergeWithKey((_, _l, _r) => fn(_l, _r), l, r)

const mergeWith = curry3(_mergeWith)

const _mergeWithKey = (fn, l = {}, r = {}) => {
  var res = {}, k
  for (k in l) if (_has(k, l)) res[k] = _has(k, r) ? fn(k, l[k], r[k]) : l[k]
  for (k in r) if (_has(k, r) && !(_has(k, res))) res[k] = r[k]
  return res
}

const mergeWithKey = curry3(_mergeWithKey)

const _min = (a, b) => b < a ? b : a

const min = curry2(_min)

const _multiply = (a, b) => a * b

const multiply = curry2(_multiply)

const _none = complement(any)

const none = curry2(_none)

const not = v => !v

const _nth = (i, arr) => arr?.[i]

const nth = curry2(_nth)

const _o = (g, f, x) => g(f(x))

const o = curry3(_o)

const _objOf = (k, v) => ({ [k]: v })

const objOf = curry2(_objOf)

const _omit = (keys, obj) => reduce((acc, key) => keys.indexOf(key) === -1 ? (acc[key] = obj[key]) && acc : acc, {}, Object.keys(obj))

const omit = curry2(_omit)

const _or = (a, b) => a || b

const or = curry2(_or)

const _path = (pathArr, obj) => reduce((res, p) => res === null ? void 0 : res[p], obj, pathArr)

const path = curry2(_path)

const _pick = (keys, obj) => reduce((acc, key) => key in obj ? (acc[key] = obj[key]) && acc : acc, {}, keys)

const pick = curry2(_pick)


function pipe(fst, ...funcs) {
  if (!funcs.length) throw new Error('pipe requires at least two arguments')
  let len = funcs.length
  return arity(fst.length, function(...args) {
    let i = 0, l = len
    let result = fst.apply(this, args)
    while (i++ < l) result = funcs[i].call(this, result)
    return result;
  })
}

const _prepend = (v, arr) => _concat([v], arr)

// const _prepend = (val, arr) => {
//   let i = -1,
//     l = arr.length,
//     res = Array(l + 1)
//   res[0] = val
//   while (++i < l) res[i + 1] = arr[i]
//   return res
// }

const prepend = curry2(_prepend)

const product = (arr) => _reduce(multiply, 1, arr)

const _prop = (prop, obj) => obj[prop]

const prop = curry2(_prop)

const _propEq = (key, val, obj) => obj[key] === val

const propEq = curry3(_propEq)

const _props = (props, obj) => props.map((p) => obj[p])

const props = curry2(_props)

const _pluck = (prop, arr) => {
  let l = arr.length,
    res = [], j = 0,
    obj, i = 0

  for (; i < l; i++) {
    obj = arr[i]
    if (obj != null && obj[prop] !== undefined) res[j++] = obj[prop]
  }

  return res
}

const pluck = curry2(_pluck)

const _quote = (s) => '"' + _reduce((str, p) => str.replace(p[0], p[1]), s, [
  [/\\/g, '\\\\'], [/[\b]/g, '\\b'], [/\f/g, '\\f'], [/\n/g, '\\n'], [/\r/g, '\\r'], [/\t/g, '\\t'], [/\v/g, '\\v'], [/\0/g, '\\0']
]) + '"'

const _range = (start, end) => Array(end - start).fill(1).map((_, i) => i + start)

const range = curry2(_range)

const _reduceObject = (fn, init, obj) => Object.keys(obj).reduce((acc, key) => fn(acc, obj[key], key, obj), init)

// const _reduceObject = (fn, init, obj) => {
//   let keys = Object.keys(obj),
//     l = keys.length, i = 0, key,
//     res = init === undefined ? obj[keys[i++]] : init

//   for (; i < l; i++) {
//     key = keys[i]
//     res = fn(res, obj[key], key, obj)
//   }

//   return res
// }

function _reduceIterable(reducer, acc, iter) {
  var step = iter.next()
  while (!step.done) {
    acc = reducer(acc, step.value)
    step = iter.next()
  }
  return acc
}

function _reduce(fn, init, arr) {
  return Array.prototype.reduce.call(arr, fn, init)
}

// function _reduce(fn, init, arr) {
//   let l = arr.length,
//     i = 0, res = init ?? arr[i++]
//   for (; i < l; i++) {
//     res = fn(res, arr[i], i)
//   }
//   return res
// }

const reduce = curry3((fn, ini, e) =>
  isArrayLike(e) ? _reduce(fn, ini, e) :
    isIterable(e) ? _reduceIterable(fn, ini, e) :
      _reduceObject(fn, ini, e), 'reduce')


const _reduceRightObject = (fn, init, obj) => obj.keys.reduceRight((acc, key) => fn(acc, obj[key], key, obj), init)

// const reduceRightObject = (fn, init, obj) => {
//   let keys = Object.keys(obj),
//     l = keys.length,
//     key,
//     res = init === undefined ? obj[keys[--l]] : init

//   while (--l >= 0) {
//     key = keys[l]
//     res = fn(res, obj[key], key, obj)
//   }

//   return res
// }

const _reduceRight = (fn, init, arr) => Array.prototype.reduceRight.call(arr, fn, init)

const reduceRight = curry3((f, ini, e) => isArrayLike(e) ? _reduceRight(f, ini, e) : _reduceRightObject(f, ini, e))

const _reject = (fn, arr) => filter(complement(fn), arr)

const reject = curry2(_reject)

// replace

const reverse = arr => cloneArray(arr).reverse()

// const reverse = arr => {
//   const l = arr.length, res = Array(l), i = 0, j = l - 1
//   for (; i < l; i++, j--) { res[i] = arr[j] }
//   return res
// }

const _scan = (fn, acc, arr) => {
  let i = -1
  const len = arr.length
  const res = [acc]
  while (++i < len) {
    acc = fn(acc, arr[i])
    res[i + 1] = acc
  }
  return res;
}

const scan = curry3(_scan)

const slice = curry3(_slice)

// sort

const _sortBy = (fn, arr) => cloneArray(arr).sort((a, b) => (a = fn(a), b = fn(b), a < b) ? -1 : a > b ? 1 : 0)

const sortBy = curry2(_sortBy)

// split

const _splitAt = (i, arr) => [_slice(0, i, arr), _slice(i, null, arr)]

const splitAt = curry2(_splitAt)

const _substract = (a, b) => b - a

const substract = curry2(_substract)

const sum = arr => reduce((sum, e) => sum + e, 0, arr)

const tail = arr => _slice(1, null, arr)

const _take = (i, arr) => _slice(0, i, arr)

const take = curry2(_take)

const _takeWhile = (fn, arr) => {
  let l = arr.length,
    i = -1, res = []

  while (++i < l && fn(arr[i])) res[i] = arr[i]

  return res
}

const takeWhile = curry2(_takeWhile)

const _takeLast = (i, arr) => _slice(-i, null, arr)

const takeLast = curry2(_takeLast)

const _takeLastWhile = (fx, arr) => {
  let l = arr.length

  while (--l > 0 && fx(arr[l])) { }

  return _slice(l + 1, null, arr)
}

const takeLastWhile = curry2(_takeLastWhile)

const _tap = (fx, x) => {
  fx(x)
  return x
}

const tap = curry2(_tap)

const _test = (regex, str) => str.search(regex) !== -1

const test = curry2(_test)

// toLowerCase

const toPairs = obj => {
  let pairs = [], prop

  for (prop in obj) if (_has(prop, obj)) pairs[pairs.length] = [prop, obj[prop]]

  return pairs
}

var pad = function pad(n) { return (n < 10 ? '0' : '') + n; };

var _toISOString = typeof Date.prototype.toISOString === 'function' ?
  function _toISOString(d) {
    return d.toISOString();
  } :
  function _toISOString(d) {
    return (
      d.getUTCFullYear() + '-' +
      pad(d.getUTCMonth() + 1) + '-' +
      pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) + ':' +
      pad(d.getUTCMinutes()) + ':' +
      pad(d.getUTCSeconds()) + '.' +
      (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z'
    );
  };

function _toString(x, seen) {
  var recur = function recur(y) {
    var xs = seen.concat([x]);
    return _includes(y, xs) ? '<Circular>' : _toString(y, xs);
  };

  //  mapPairs :: (Object, [String]) -> [String]
  var mapPairs = function(obj, keys) {
    return _map(function(k) { return _quote(k) + ': ' + recur(obj[k]); }, keys.slice().sort());
  };

  switch (Object.prototype.toString.call(x)) {
    case '[object Arguments]':
      return '(function() { return arguments; }(' + _map(recur, x).join(', ') + '))';
    case '[object Array]':
      return '[' + _map(recur, x).concat(mapPairs(x, reject(function(k) { return /^\d+$/.test(k); }, keys(x)))).join(', ') + ']';
    case '[object Boolean]':
      return typeof x === 'object' ? 'new Boolean(' + recur(x.valueOf()) + ')' : x.toString();
    case '[object Date]':
      return 'new Date(' + (isNaN(x.valueOf()) ? recur(NaN) : _quote(_toISOString(x))) + ')';
    case '[object Map]':
      return 'new Map(' + recur(Array.from(x)) + ')';
    case '[object Null]':
      return 'null';
    case '[object Number]':
      return typeof x === 'object' ? 'new Number(' + recur(x.valueOf()) + ')' : 1 / x === -Infinity ? '-0' : x.toString(10);
    case '[object Set]':
      return 'new Set(' + recur(Array.from(x).sort()) + ')';
    case '[object String]':
      return typeof x === 'object' ? 'new String(' + recur(x.valueOf()) + ')' : _quote(x);
    case '[object Undefined]':
      return 'undefined';
    default:
      if (typeof x.toString === 'function') {
        var repr = x.toString();
        if (repr !== '[object Object]') {
          return repr;
        }
      }
      return '{' + mapPairs(x, keys(x)).join(', ') + '}';
  }
}

function toString(val) { return _toString(val, []) }

// toUpperCase
// trim

const truty = () => true

const type = a => Object.prototype.toString.call(a).slice(8, -1)

const uniq = arr => reduce((acc, val) => !_inculdes(val, acc) ? acc.push(val) && acc : acc, [], arr)

const _uniqWith = (fn, arr) => {
  let i = -1, l = arr.length,
    res = [], val

  while (++i < l) {
    val = arr[i]
    if (!_inculdesWith(fn, val, res)) res[res.length] = val
  }

  return res
}

const uniqWith = curry2(_uniqWith)

const _update = (i, val, arr) => {
  const res = cloneArray(arr),
    l = arr.length

  if (i < 0) i = l + i
  if (i >= 0 && i < l) res[i] = val

  return res
}

const update = curry3(_update)

const values = obj => {
  let keys = Object.keys(obj),
    l = keys.length,
    res = Array(l), i = 0

  for (; i < l; i++) res[i] = obj[keys[i]]

  return res
}

const _without = (vals, arr) => {
  let l = arr.length, i = -1,
    j = 0, res = [], val

  while (++i < l) {
    val = arr[i]
    if (!_inculdes(val, vals)) res[j++] = val
  }

  return res
}

const without = curry2(_without)

export const {
  toLowerCase,
  toUpperCase,
  trim,
  // concat,
  every,
  //filter,
  find,
  findIndex,
  //forEach,
  //indexOf,
  join,
  //map,
  some,
  sort,
  match,
  split,
  //reduce,
  //reduceRight,
  replace,
  isArguments,
  isFunction,
  isString,
  isNumber,
  isDate,
  isRegExp,
  isError
} = exp
export {
  __,
  add,
  adjust,
  all,
  any,
  append,
  arrayFromIterator,
  assoc,
  assocPath,
  bind,
  both,
  clone,
  concat,
  converge,
  complement,
  compose,
  count,
  chunk,
  curry,
  curry2,
  curry3,
  curryN,
  debounce,
  defaultTo,
  divide,
  drop,
  dropWhile,
  dropLast,
  dropLastWhile,
  either,
  equals,
  fill,
  filter,
  findIndexes,
  findLast,
  findLastIndex,
  flatten,
  flip,
  forEach,
  fromPairs,
  gt,
  gte,
  has,
  head,
  identical,
  identity,
  includes,
  intersects,
  includesWith,
  indexOf,
  init,
  isArray,
  isArrayLike,
  isIterable,
  isIterator,
  isObject,
  isPlaceholder,
  juxt,
  keys,
  last,
  lastIndexOf,
  length,
  lt,
  lte,
  lift,
  log,
  map,
  mapPoly,
  max,
  mean,
  median,
  memoize,
  merge,
  mergeByIndexes,
  mergeWith,
  mergeWithKey,
  min,
  multiply,
  none,
  not,
  nth,
  o,
  objOf,
  omit,
  or,
  path,
  pick,
  pipe,
  prepend,
  product,
  prop,
  propEq,
  props,
  pluck,
  range,
  reduce,
  reduceRight,
  reject,
  reverse,
  scan,
  slice,
  sortBy,
  splitAt,
  substract,
  sum,
  tail,
  take,
  takeWhile,
  takeLast,
  takeLastWhile,
  tap,
  test,
  toPairs,
  toString,
  truty,
  type,
  uniq,
  uniqWith,
  update,
  values,
  without
}
