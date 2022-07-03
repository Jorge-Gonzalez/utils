const exp = {}

  ;['toLowerCase', 'toUpperCase', 'trim']
    .forEach(name => (exp[name] = (coll) => coll[name]()))

  ;['concat', 'every', 'filter', 'find', 'findIndex', 'forEach', 'indexOf', 'join', 'map', 'some', 'sort', 'match', 'split']
    .forEach(name => (exp[name] = curry2((arg, coll) => log(coll)[name](arg), name)))

  ;['reduce', 'reduceRight', 'replace']
    .forEach(name => (exp[name] = curry3((arg1, arg2, coll) => coll[name](arg1, arg2))))

  ;['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error']
    .forEach(t => (exp['is' + t] = o => Object.prototype.toString.call(o) === '[object ' + t + ']'))

const _ = { '@@functional/placeholder': true }

const add = curry2((a, b) => a + b)

const adjust = curry3((fn, i, arr) => {
  const l = arr.length, res = arr.slice()
  return 0 <= (i < 0 ? i + l : i) < l ? (res[i] = fn(arr[i]), res) : res
})

const all = curry2((fn, arr) => {
  for (const v of arr) {
    if (!fn(v)) { return false }
  }
  return true
})

const any = curry2((fn, arr) => arr.some(fn))

const ap = curry2((applyF, applyX) => {
  return (
    typeof applyX['fantasy-land/ap'] === 'function' ? applyX['fantasy-land/ap'](applyF) :
      typeof applyF.ap === 'function' ? applyF.ap(applyX) :
        typeof applyF === 'function' ? (x) => applyF(x)(applyX(x)) :
          _reduce((acc, f) => acc.concat(map(f, applyX)), [], applyF)
  )
})

const append = curry2((val, arr) => concat(arr, [val]))

// tslint:disable-line:no-unused-vars
const arity = (n, fn) =>
  n === 0 ? function() { return fn.apply(this, arguments) }
    : n === 1 ? function(a0) { return fn.apply(this, arguments) }
      : n === 2 ? function(a0, a1) { return fn.apply(this, arguments) }
        : n === 3 ? function(a0, a1, a2) { return fn.apply(this, arguments) }
          : n === 4 ? function(a0, a1, a2, a3) { return fn.apply(this, arguments) }
            : n === 5 ? function(a0, a1, a2, a3, a4) { return fn.apply(this, arguments) }
              : n === 6 ? function(a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments) }
                : fn

const arrayFromIterator = (iter) => {
  let re = [], next
  while (!(next = iter.next()).done) re.push(next.value)
  return re
}

const assoc = curry3((prop, val, obj) => {
  const res = Number.isInteger(prop) && Array.isArray(obj)
    ? [].concat(obj)
    : cloneObject(obj)
  res[prop] = val
  return res
})

const assocPath = curry3((path, val, obj) => {
  if (path.length === 0) {
    return val;
  }
  var prop = path[0];
  if (path.length > 1) {
    var nextObj = (obj != null && typeof obj?.[prop] === 'object') ? obj[prop] : Number.isInteger(path[1]) ? [] : {};
    val = assocPath(_slice(1, null, path), val, nextObj);
  }
  return assoc(prop, val, obj);
})

const both = (a, b) => (x) => a(x) && b(x)

const cloneArray = arr => arr.slice()

const cloneObject = obj => ({ ...obj })

const clone = e => isArray(e) ? cloneArray(e) : cloneObject(e)

const converge = curry2((after, fns) => function() {
  var args = arguments
  var ctx = this
  return after.apply(ctx, map(function(fn) {
    return fn.apply(ctx, args)
  }, fns))
})

const complement = fn => (...args) => !fn(...args)

const compose = function() { return pipe.apply(this, cloneArray(arguments).reverse()) }

const compose2 = function() {
  let funcs = arguments
  let i = funcs.length - 1
  let last = funcs[i]
  return arity(
    last.length,
    function() {
      let res = funcs[i].apply(this, arguments)
      while (i--) res = funcs[i].call(this, res)
      return res
    }
  )
}

const compose3 = function() {
  let funcs = arguments
  let start = funcs.length - 1
  let i = start
  let last = funcs[i]
  return arity(
    last.length,
    function composed(x) {
      if (i === start) return composed(funcs[i].apply(this, arguments))
      else if (i--) return composed(funcs[i].call(this, x))
    }
  )
}

const containsWith = curry3((fn, x, arr) => {
  let i = -1, l = arr.length
  while (++i < l) if (fn(x, arr[i])) return true
  return false
})

const count = curry2((fn, arr) => arr.reduce((c, v) => fn(v) ? ++c : c, 0))

const chunk = curry2((size, arr) => {
  if (size <= 0) throw Error('chunk size must be positive')
  let res = [], i = 0,
    j = 0, l = arr.length

  while (i < l) res[j++] = _slice(i, i += size, arr)

  return res
})

const curry = (fn, n) => curryN(n || fn.length, fn)

function curry2(f, name = f.name) {
  let o = {
    [name + '_0of2'](a, __) { return arguments.length === 1 ? (o.a = a, o[name + '_1of2']) : f(...arguments) },
    [name + '_1of2'](__) { return f(o.a, ...arguments) }
  }
  return o[name + '_0of2']
}

function curry3(f) {
  const name = f.name
  const o = {
    [name + '_0of3'](a, b, __) {
      const l = arguments.length
      return l === 1
        ? (o.a = a, o[name + '_1of3'])
        : l === 2
          ? (o.a = a, o.b = b, o[name + '_2of3'])
          : f(...arguments)
    },
    [name + '_1of3'](b, __) { return arguments.length === 1 ? (o.b = b, o[name + '_2of3']) : f(o.a, ...arguments) },
    [name + '_2of3'](__) { return f(o.a, o.b, ...arguments) },
  }
  return o[name + '_0of3']
}

const curryN = (length, fn) => {
  let args = [], places = [], count = 0

  return function curried() {
    let newPlaces = [], i = 0, l = arguments.length, index

    for (; i < l; i++) {
      index = places[i] != null ? places[i] : count++
      args[index] = arguments[i]
      if (isPlaceholder(args[index])) newPlaces[newPlaces.length] = index
      else length--
    }

    places = places.length <= l
      ? newPlaces.length > 0 ? newPlaces : []
      : newPlaces.length > 0 ? concat(_slice(l, null, places), newPlaces) : _slice(l, null, places)

    return length <= 0 ? fn.apply(this, args) : arity(length, curried)
  }
}

const defaultTo = curry2((d, v) => v == null || v !== v ? d : v)

const divide = curry2((a, b) => a / b)

const drop = curry2((n, arr) => _slice(n, null, arr))

const dropWhile = curry2((fn, arr) => {
  let i = 0
  const len = arr.length

  while (i < len && fn(arr[i])) i++

  return _slice(i, null, arr)
})

const dropLast = curry2((n, arr) => _slice(0, -n, arr))

const dropLastWhile = curry2((fn, arr) => {
  let i = arr.length - 1

  while (i >= 0 && fn(arr[i])) i--

  return _slice(0, i + 1, arr)
})

const either = curry2((f, g) => isFunction(f) ? (...args) => f(...args) || g(...args) : lift(or)(f, g))

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

const fill = curry2((val, arr) => arr.fill(val))

const filterObject = (pred, obj) => Object.keys(obj).reduce((acc, key) => pred(obj[key], key, obj) ? (acc[key] = obj[key], acc) : acc, {})

const filter = curry2((f, e) => isArray(e) ? e.filter(f) : filterObject(f, e))

const findIndexes = curry2((fn, arr) => arr.reduce((acc, v, i) => fn(v) ? (acc.push(i), acc) : acc, []))

const findLast = curry2((fn, arr) => {
  let i = arr.length
  while (--i >= 0) if (fn(arr[i])) return arr[i]
})

const findLastIndex = curry2((fn, arr) => {
  var i = arr.length
  while (--i >= 0) if (fn(arr[i])) return i
  return -1
})

const flatten = (arr, res = []) => reduce((acc, val) => isArray(val) ? flatten(val, acc) : acc.push(val) && acc, res, arr)

const flip = f => curry2((a, b, ...rest) => f(b, a, ...rest))

const forEachObject = (fn, obj) => Object.keys(obj).forEach(key => { fn(obj[key], key, obj) })

const forEach = curry2((f, e) => isArray(e) ? e.forEach(f) : forEachObject(f, e))

const fromPairs = pairs => pairs.reduce((acc, pair) => pair.length ? (acc[pair[0]] = pair[1], acc) : acc, {})

const gt = curry2((a, b) => a > b)

const gte = curry2((a, b) => a >= b)

const _has = (prop, obj) => Object.prototype.hasOwnProperty.call(obj, prop)

const has = curry2(_has)

const head = arr => arr[0]

const _identical = (a, b) => (a === b) ? a !== 0 || 1 / a === 1 / b : a !== a && b !== b

const identical = curry2(_identical)

const identity = x => x

const includes = curry2((e, arr) => arr.indexOf(e) !== -1)

const indexOf = curry2((val, arr) => arr.indexOf(val))

const init = arr => _slice(0, arr.length - 1, arr)

const isArray = Array.isArray || (val => toString.call(val) === '[object Array]')

const isArrayLike = (arr) =>
  isArray(arr) ? true :
    !isObject(arr) || isString(arr) ? false :
      arr.length === 0 ? true :
        arr.length > 0 ? _has(0, arr) && _has(arr.length - 1, arr) :
          false

const isIterable = (obj) => !!obj?.[Symbol.iterator] === 'function'

const isObject = (obj) => typeof obj === 'object' && !!obj

const isPlaceholder = a => a != null && a['@@functional/placeholder'] === true

// join

const juxt = (fns) => converge(function() { return _slice(0, null, arguments) }, fns)


const keys = obj => Object.keys(obj)

const last = arr => arr[arr.length - 1]

const lastIndexOf = curry2((val, arr) => {
  let i = arr.length
  while (--i >= 0) if (eq(arr[i], val)) return i
  return -1
})

const length = arr => arr.length

const lt = curry2((a, b) => a < b)

const lte = curry2((a, b) => a <= b)

const lift = (fn) => liftN(fn.length, fn)

const liftN = curry2(function liftN(arity, fn) {
  var lifted = curryN(arity, fn)
  return curryN(arity, function() {
    return _arrayReduce(ap, map(lifted, arguments[0]), _slice(arguments, 1))
  })
})

const mapObject = (fn, obj) => Object.keys(obj).reduce((acc, key) => (acc[key] = fn(obj[key], key, obj), acc), {})

const map = curry2((f, e) => isArray(e) ? e.map(f) : mapObject(f, e))



const max = curry2((a, b) => b > a ? b : a)

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

const merge = curry2((obj, props) => Object.assign({}, obj, props))

const mergeByIndexes = curry3((idxs, update, base) => reduce((a, v, i) => (a[(idxs[i] != null ? idxs[i] : a.length)] = v) && a, base, update))

const mergeWith = curry3((fn, l, r) => mergeWithKey((_, _l, _r) => fn(_l, _r), l, r))

const mergeWithKey = curry3((fn, l = {}, r = {}) => {
  var res = {}, k
  for (k in l) if (_has(k, l)) res[k] = _has(k, r) ? fn(k, l[k], r[k]) : l[k]
  for (k in r) if (_has(k, r) && !(_has(k, res))) res[k] = r[k]
  return res
})

const min = curry2((a, b) => b < a ? b : a)

const multiply = curry2((a, b) => a * b)

const none = curry2(complement(any))

const not = v => !v

const nth = curry2((i, arr) => arr ? arr[i] : void 0)

const omit = curry2((keys, obj) => reduce((acc, key) => keys.indexOf(key) === -1 ? (acc[key] = obj[key]) && acc : acc, {}, Object.keys(obj)))

const or = curry2((a, b) => a || b)

const path = curry2((pathArr, obj) => reduce((res, p) => res === null ? void 0 : res[p], obj, pathArr))

const pick = curry2((keys, obj) => reduce((acc, key) => key in obj ? (acc[key] = obj[key]) && acc : acc, {}, keys))

const pipe = function() {
  const funcs = cloneArray(arguments)
  return arity(
    funcs[0].length,
    reduce(
      (composite, fn) => function() {
        return fn.call(this, composite.apply(this, arguments))
      },
      funcs[0], // head(funcs)
      _slice(1, null, funcs) // tail(funcs)
    )
  )
}

const prepend = curry2((val, arr) => {
  let i = -1
  const l = arr.length
  const res = Array(l + 1)

  res[0] = val
  while (++i < l) res[i + 1] = arr[i]
  return res
})

const product = (arr) => reduce(multiply, 1, arr)

const prop = curry2((prop, obj) => obj[prop])

const propEq = curry3((key, val, obj) => obj[key] === val)

const props = curry2((props, obj) => props.map((p) => obj[p]))

const pluck = curry2((prop, arr) => {
  let l = arr.length,
    res = [], j = 0,
    obj, i = 0

  for (; i < l; i++) {
    obj = arr[i]
    if (obj != null && obj[prop] !== undefined) res[j++] = obj[prop]
  }

  return res
})

const quote = (s) => '"' + reduce((str, p) => str.replace(p[0], p[1]), s, [
  [/\\/g, '\\\\'], [/[\b]/g, '\\b'], [/\f/g, '\\f'], [/\n/g, '\\n'], [/\r/g, '\\r'], [/\t/g, '\\t'], [/\v/g, '\\v'], [/\0/g, '\\0']
]) + '"'

const range = curry2((start, end) => Array(end - start).fill(1).map((__, i) => i + start))

const reduceObject = (fn, init, obj) => {
  let keys = Object.keys(obj),
    l = keys.length, i = 0, key,
    res = init === undefined ? obj[keys[i++]] : init

  for (; i < l; i++) {
    key = keys[i]
    res = fn(res, obj[key], key, obj)
  }

  return res
}

const reduce = curry3((f, ini, e) => isArray(e) ? e.reduce(f, ini) : reduceObject(f, ini, e))

const reduceRightObject = (fn, init, obj) => {
  let keys = Object.keys(obj),
    l = keys.length,
    key,
    res = init === undefined ? obj[keys[--l]] : init

  while (--l >= 0) {
    key = keys[l]
    res = fn(res, obj[key], key, obj)
  }

  return res
}

const reduceRight = curry3((f, ini, e) => isArray(e) ? e.reduceRight(f, ini) : reduceRightObject(f, ini, e))

const _reject = (fn, arr) => filter(complement(fn), arr)

const reject = curry2(_reject)

// replace

const reverse = arr => cloneArray(arr).reverse()

const scan = curry3((fn, acc, arr) => {
  let i = -1
  const len = arr.length
  const res = [acc]
  while (++i < len) {
    acc = fn(acc, arr[i])
    res[i + 1] = acc
  }
  return res;
})

const _slice = (start, end, arr) => Array.prototype.slice.call(start, end, arr)

const slice = curry3(_slice)

// sort

const sortBy = curry2((fn, arr) => cloneArray(arr).sort((a, b, fnA, fnB) => (fnA = fn(a)) && (fnB = fn(b)) && fnA < fnB ? -1 : fnA > fnB ? 1 : 0))

// split

const splitAt = curry2((i, arr) => [_slice(0, i, arr), _slice(i, null, arr)])

const substract = curry2((a, b) => b - a)

const sum = arr => reduce((sum, e) => sum + e, 0, arr)

const tail = arr => _slice(1, null, arr)

const take = curry2((i, arr) => _slice(0, i, arr))

const takeWhile = curry2((fn, arr) => {
  let l = arr.length,
    i = -1, res = []

  while (++i < l && fn(arr[i])) res[i] = arr[i]

  return res
})

const takeLast = curry2((i, arr) => _slice(-i, null, arr))

const takeLastWhile = curry2((fx, arr) => {
  let l = arr.length

  while (--l > 0 && fx(arr[l])) { }

  return _slice(l + 1, null, arr)
})

const tap = curry2((fx, x) => {
  fx(x)
  return x
})

const test = curry2((regex, str) => str.search(regex) !== -1)

// toLowerCase

const toPairs = obj => {
  let pairs = [], prop

  for (prop in obj) if (_has(prop, obj)) pairs[pairs.length] = [prop, obj[prop]]

  return pairs
}

const toString = (x, seen) => {
  const recur = y => {
    let xs = concat([x], seen)
    return contains(y, xs) ? '<Circular>' : toString(y, xs)
  }
  const mapPairs = (obj, keys) => map(k => quote(k) + ': ' + recur(obj[k]), keys.slice().sort())
  let t = type(x), re
  return t === 'Arguments' ? '(function() { return arguments; }(' + map(recur, x).join(', ') + '))'
    : t === 'Array' ? '[' + map(recur, x).concat(mapPairs(x, _reject(k => /^\d+$/.test(k), keys(x)))).join(', ') + ']'
      : t === 'Boolean' ? typeof x === 'object' ? 'new Boolean(' + recur(x.valueOf()) + ')' : x.toString()
        : t === 'Date' ? 'new Date(' + (isNaN(x.valueOf()) ? recur(NaN) : quote(x.toISOString())) + ')'
          : t === 'Function' ? (re = x.toString()) && re !== '[object Object]' && re
            : t === 'Null' ? 'null'
              : t === 'Number' ? typeof x === 'object' ? 'new Number(' + recur(x.valueOf()) + ')' : 1 / x === -Infinity ? '-0' : x.toString(10)
                : t === 'Object' ? '{' + mapPairs(x, keys(x)).join(', ') + '}'
                  : t === 'String' ? typeof x === 'object' ? 'new String(' + recur(x.valueOf()) + ')' : quote(x)
                    : t === 'Undefined' ? 'undefined'
                      : 'Not implemented :('
}

// toUpperCase
// trim

const truty = () => true

const type = a => Object.prototype.toString.call(a).slice(8, -1)

const uniq = arr => reduce((acc, val) => !contains(val, acc) ? acc.push(val) && acc : acc, [], arr)

const uniqWith = curry2((fn, arr) => {
  let i = -1, l = arr.length,
    res = [], val

  while (++i < l) {
    val = arr[i]
    if (!containsWith(fn, val, res)) res[res.length] = val
  }

  return res
})

const update = curry3((i, val, arr) => {
  const res = cloneArray(arr),
    l = arr.length

  if (i < 0) i = l + i
  if (i >= 0 && i < l) res[i] = val

  return res
})

const values = obj => {
  let keys = Object.keys(obj),
    l = keys.length,
    res = Array(l), i = 0

  for (; i < l; i++) res[i] = obj[keys[i]]

  return res
}

const without = curry2(function(vals, arr) {
  let l = arr.length, i = -1,
    j = 0, res = [], val

  while (++i < l) {
    val = arr[i]
    if (!contains(val, vals)) res[j++] = val
  }

  return res
})

export const {
  toLowerCase,
  toUpperCase,
  trim,
  concat,
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
  _,
  add,
  adjust,
  all,
  any,
  append,
  arrayFromIterator,
  assoc,
  assocPath,
  both,
  clone,
  converge,
  complement,
  compose,
  containsWith,
  count,
  chunk,
  curry,
  curry2,
  curry3,
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
  indexOf,
  init,
  isArray,
  isArrayLike,
  isIterable,
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
  map,
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
  quote,
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