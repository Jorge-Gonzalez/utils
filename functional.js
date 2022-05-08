;(function () {
  'use strict'

  const _ = {}

  const toString = Object.prototype.toString

  // const curry2 = _.curry2 = fn => function curried0of2 (a, b) {
  //   return b === void 0
  //     ? function curried1of2 (_b) { return fn(a, _b) }
  //     : fn(a, b)
  // }

  const curry2 = _.curry2 = fn => function curried0of2 (a, b) {
    return isPlaceholder(a) 
      ? function curried2ndOf2 (_a) { return fn(_a, b) } 
      : b === void 0
      ? function curried1stOf2 (_b) { return fn(a, _b) }
      : fn(a, b)
  }

  const curry3 = _.curry3 = fn => function curried0of3 (a, b, c) {
    return b === void 0
      ? function curried1of3 (_b, _c) { return curried0of3(a, _b, _c) }
      : c === void 0
      ? function curried2of3 (_c) { return fn(a, b, _c) }
      : fn(a, b, c)
  }

  ;['toLowerCase', 'toUpperCase', 'trim']
    .forEach(name => (_[name] = (coll) => coll[name]()))

  ;['every', 'find', 'findIndex', 'indexOf', 'join', 'some', 'sort', 'match', 'split']
    .forEach(name => (_[name] = curry2((arg, coll) => coll[name](arg))))

  ;['reduceRight', 'replace']
    .forEach(name => (_[name] = curry3((arg1, arg2, coll) => coll[name](arg1, arg2))))

  ;['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error']
    .forEach(t => (_['is' + t] = o => toString.call(o) === '[object ' + t + ']'))

  _._ = { '@@functional/placeholder': true }

  _.isArray = Array.isArray || (val => toString.call(val) === '[object Array]')

  _.isObject = (obj) => typeof obj === 'object' && !!obj

  _.add = curry2((a, b) => a + b)

  _.adjust = curry3((fn, i, arr) => {
    const l = arr.length, res = cloneArray(arr)
    if (i < 0) i = l + i
    if (i >= 0 && i < l) res[i] = fn(arr[i])
    return res
  })

  const all = (fn, arr) => {
    let i = 0, l = arr.length

    for (; i < l; i++) if (!fn(arr[i], i, arr)) return false

    return true
  }

  _.all = curry2(all)

  const any = (f, a) => {
    let i = 0, l = a.length

    for (; i < l; i++) if (f(a[i], i, a)) return true

    return false
  }

  _.any = curry2(any)

  _.append = curry2((val, arr) => concat(arr, [val]))

  const arity = function (n, fn) {
    return n === 0 ? function () { return fn.apply(this, arguments) }
         : n === 1 ? function (a0) { return fn.apply(this, arguments) }
         : n === 2 ? function (a0, a1) { return fn.apply(this, arguments) }
         : n === 3 ? function (a0, a1, a2) { return fn.apply(this, arguments) }
         : n === 4 ? function (a0, a1, a2, a3) { return fn.apply(this, arguments) }
         : n === 5 ? function (a0, a1, a2, a3, a4) { return fn.apply(this, arguments) }
         : n === 6 ? function (a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments) }
         : fn
  }

  const arrayFromIterator = (iter) => {
    let re = [], next
    while (!(next = iter.next()).done) re.push(next.value)
    return re
  }

  _.assoc = curry3((prop, val, obj) => {
    var re = cloneObject(obj)
    re[prop] = val
    return re
  })

  _.both = (a, b) => (x) => a(x) && b(x)

  const curryN = (length, fn) => {
    let args = [], places = [], count = 0

    return function curried () {
      let newPlaces = [], i = 0, l = arguments.length, index

      for (; i < l; i++) {
        index = places[i] != null ? places[i] : count++
        args[index] = arguments[i]
        if (isPlaceholder(args[index])) newPlaces[newPlaces.length] = index
        else length--
      }

      places = places.length <= l
        ? newPlaces.length > 0 ? newPlaces : []
        : newPlaces.length > 0 ? concat(slice(l, null, places), newPlaces) : slice(l, null, places)

      return length <= 0 ? fn.apply(this, args) : arity(length, curried)
    }
  }

  const cloneArray = arr => {
    let l = arr.length,
        res = new Array(l), i = 0

    for (; i < l; i++) res[i] = arr[i]

    return res
  }

  const cloneObject = obj => {
    let keys = Object.keys(obj),
        l = keys.length,
        res = {}, i = 0, key

    for (; i < l; i++) {
      key = keys[i]
      res[key] = obj[key]
    }

    return res
  }

  _.clone = e => Array.isArray(e) ? cloneArray(e) : cloneObject(e)

  const concat = (arrA, arrB = []) => {
    let lenA = arrA.length,
        lenB = arrB.length,
        res = Array(lenA + lenB), i

    for (i = 0; i < lenA; i++) res[i] = arrA[i]
    for (i = 0; i < lenB; i++) res[lenA++] = arrB[i]

    return res
  }

  _.converge = curry2((after, fns) => function() {
    var args = arguments
    var ctx = this
    return after.apply(ctx, map(function(fn) {
      return fn.apply(ctx, args)
    }, fns))
  })

  _.concat = curry2(concat)

  _.complement = fn => function () { return !fn.apply(this, arguments) }

  _.compose = function () { return _.pipe.apply(this, cloneArray(arguments).reverse()) }

  const contains = (val, arr) => arr.some(e => equals(e, val))

  _.contains = curry2(contains)

  _.containsWith = curry3((fn, x, arr) => {
    let i = -1, l = arr.length
    while (++i < l) if (fn(x, arr[i])) return true
    return false
  })

  _.count = curry2((fn, arr) => reduce((c, v) => fn(v) ? ++c : c, 0, arr))

  _.chunk = curry2((size, arr) => {
    if (size <= 0) throw Error('chunk size must be positive')
    let res = [], i = 0,
        j = 0, l = arr.length

    while (i < l) res[j++] = slice(i, i += size, arr)

    return res
  })

  _.curry = (fn, n) => curryN(n || fn.length, fn)
  // curry2
  // curry3
  _.defaultTo = curry2((d, v) => v == null || v !== v ? d : v)

  _.divide = curry2((a, b) => a / b)

  _.drop = curry2((n, arr) => slice(n, null, arr))

  _.dropWhile = curry2((fn, arr) => {
    let i = 0
    const len = arr.length

    while (i < len && fn(arr[i])) i++

    return slice(i, null, arr)
  })

  _.dropLast = curry2((n, arr) => slice(0, -n, arr))

  _.dropLastWhile = curry2((fn, arr) => {
    let i = arr.length - 1

    while (i >= 0 && fn(arr[i])) i--

    return slice(0, i + 1, arr)
  })

  _.either = (a, b) => (x) => a(x) || b(x)

  const equals = (a, b, stackA = [], stackB = [], t, keysA, idx) =>
    identical(a, b) ? true
    : _.type(a) !== _.type(b) ? false
    : a == null || b == null ? false
    : typeof a.equals === 'function' || typeof b.equals === 'function' ? a.equals(b) && b.equals(a)
    : includes((t = _.type(a)), ['Boolean', 'Number', 'String']) ? (typeof a === typeof b && identical(a.valueOf(), b.valueOf()))
    : t === 'Date' ? identical(a.valueOf(), b.valueOf())
    : t === 'Error' ? a.name === b.name && a.message === b.message
    : t === 'RegExp' ? ['source', 'global', 'ignoreCase', 'multiline', 'sticky', 'unicode'].every(k => a[k] === b[k])
    : t === 'Map' || t === 'Set' ? equals(arrayFromIterator(a.entries()), arrayFromIterator(b.entries()), stackA, stackB)
    : !includes(t, ['Arguments', 'Array', 'Object', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'ArrayBuffer']) ? false
    : (keysA = _.keys(a)).length !== _.keys(b).length ? 'length'// false
    : (idx = indexOf(a, stackA)) !== -1 ? 'stack'// stackB[idx] === b
    : (stackA.push(a) && stackB.push(b)) && any(key => !(has(key, b) && equals(b[key], a[key], stackA, stackB)), keysA) ? 'any'// false
    : truty(stackA.pop(), stackB.pop())
  
  _.equals = curry2(equals)
  // every
  _.fill = curry2((val, arr) => {
    let i = 0, l = a.length
    for (; i < l; i++) arr[i] = val
    return arr
  })

  const filter = (fn, arr) => {
    let i = -1, j = 0, l = arr.length, res = []
    while (++i < l) if (fn(arr[i])) res[j++] = arr[i]
    return res
  }

  const filterObject = (fn, obj) => {
    let keys = Object.keys(obj),
        l = keys.length, res = {}, i, k
    for (i = 0; i < l; i++) {
      key = keys[i]
      if (fn(obj[key], key, obj)) res[key] = obj[key]
    }
    return res
  }

  _.filter = curry2((f, e) => _.isArray(e) ? filter(f, e) : filterObject(f, e))

  // find
  _.findIndex = (fn, arr) => {
    let l = arr.length, i = -1
    while (++i < l) if (fn(arr[i])) return i
    return -1
  }

  _.findIndexes = curry2((fn, arr) => reduce((a, v, i) => fn(v) ? a.push(i) && a : a, [], arr))

  _.findIndexes2 = curry2((fn, arr) => {
    let l = arr.length,
        i = 0, j = 0, res = []
    for (; i < l; i++) {
      if (fn(arr[i])) res[j++] = i
    }
    return res
  })

  _.findLast = curry2((fn, arr) => {
    let i = arr.length
    while (--i >= 0) if (fn(arr[i])) return arr[i]
  })

  _.findLastIndex = curry2((fn, arr) => {
    var i = arr.length
    while (--i >= 0) if (fn(arr[i])) return i
    return -1
  })

  _.flatten = (arr, res = []) => reduce((acc, val) => Array.isArray(val) ? _.flatten(val, acc) : acc.push(val) && acc, res, arr)

  _.flip = f => curry2(function (a, b) {
    let args = cloneArray(arguments)
    args[0] = b
    args[1] = a
    return f.apply(this, args)
  })

  const forEach = (fn, arr) => {
    let len = arr.length, i
    for (i = 0; i < len; i++) {
      fn(arr[i], i, arr)
    }
  }

  const forEachObject = (obj, fn) => {
    let keys = Object.keys(obj),
        len = keys.length,
        key, i
    for (i = 0; i < len; i++) {
      key = keys[i]
      fn(obj[key], key, obj)
    }
  }
  
  _.forEach = curry2((f, e) => _.isArray(e) ? forEach(f, e) : forEachObject(f, e))

  _.fromPairs = prs => {
    let i = -1,
        l = prs.length,
        res = {}
    while (++i < l) if (prs[i].length) res[prs[i][0]] = prs[i][1]
    return res
  }

  _.gt = curry2((a, b) => a > b)

  _.gte = curry2((a, b) => a >= b)

  const has = (prop, obj) => Object.prototype.hasOwnProperty.call(obj, prop)

  _.has = curry2(has)

  _.head = arr => arr[0]

  const identical = (a, b) => (a === b) ? a !== 0 || 1 / a === 1 / b : a !== a && b !== b

  _.identical = curry2(identical)

  _.identity = x => x

  const includes = (e, arr) => arr.indexOf(e) !== -1

  _.includes = curry2(includes)

  const indexOf = (val, arr) => {
    let i = 0, l = arr.length
    for (; i < l; i++) if (arr[i] === val) return i
    return -1
  }

  _.indexOf = curry2(indexOf)

  _.init = arr => slice(0, arr.length - 1, arr)
  // join
  _.juxt = (fns) => _.converge(function() { return slice(0, null, arguments) }, fns)

  const isPlaceholder = a => a != null && a['@@functional/placeholder'] === true

  _.keys = obj => Object.keys(obj)

  _.last = arr => arr[arr.length - 1]

  _.lastIndexOf = curry2((val, arr) => {
    let i = arr.length
    while (--i >= 0) if (equals(arr[i], val)) return i
    return -1
  })

  _.length = arr => arr.length

  _.lt = curry2((a, b) => a < b)

  _.lte = curry2((a, b) => a <= b)
  
  const map = (fn, arr) => {
    let l = arr.length,
        res = Array(l), i = -1

    while (++i < l) res[i] = fn(arr[i], i, arr)
    return res
  }

  const mapObject = (fn, obj) => {
    let keys = Object.keys(obj),
        l = keys.length,
        res = {}, i, key

    for (i = 0; i < l; i++) {
      key = keys[i]
      res[key] = fn(obj[key], key, obj)
    }

    return res
  }

  _.map = curry2((f, e) => _.isArray(e) ? map(f, e) : mapObject(f, e))

  _.max = curry2((a, b) => b > a ? b : a)

  _.mean = (arr) => _.sum(arr) / arr.length

  _.median = (arr) => {
    const len = arr.length
    if (len === 0) {
      return NaN
    }
    var width = 2 - len % 2
    var mid = (len - width) / 2;
    return _.mean(slice(0, null, arr).sort((a, b) => a < b ? -1 : a > b ? 1 : 0).slice(mid, mid + width))
  }

  // match
  _.memoize = (fn, hasher, cache = {}) => arity(fn.length, function (key) {
    let address = '' + (hasher ? hasher(arguments) : key)
    if (!has(address, cache)) cache[address] = fn.apply(this, arguments)
    return cache[address]
  })

  _.merge = curry2((obj, props) => Object.assign({}, obj, props))

  _.mergeByIndexes = curry3((idxs, update, base) => reduce((a, v, i) => (a[(idxs[i] != null ? idxs[i] : a.length)] = v) && a, base, update))

  _.min = curry2((a, b) => b < a ? b : a)

  _.multiply = curry2((a, b) => a * b)

  _.none = curry2(_.complement(any))

  _.not = v => !v

  _.nth = curry2((i, arr) => arr ? arr[i] : void 0)

  _.omit = curry2((keys, obj) => reduce((acc, key) => keys.indexOf(key) === -1 ? (acc[key] = obj[key]) && acc : acc, {}, Object.keys(obj)))

  _.or = curry2((a, b) => a || b)

  _.path = curry2((pathArr, obj) => reduce((res, p) => res === null ? void 0 : res[p], obj, pathArr))

  _.pick = curry2((keys, obj) => reduce((acc, key) => key in obj ? (acc[key] = obj[key]) && acc : acc, {}, keys))

  _.pipe = function () {
    const funcs = cloneArray(arguments)
    return arity(
      funcs[0].length,
      reduce(
        (composite, fn) => function () {
          return fn.call(this, composite.apply(this, arguments))
        },
        funcs[0], // head(funcs)
        slice(1, null, funcs) // tail(funcs)
      )
    )
  }

  _.compose2 = function () {
    let funcs = arguments
    let i = funcs.length - 1
    let last = funcs[i]
    return arity(
      last.length,
      function () {
        let res = funcs[i].apply(this, arguments)
        while (i--) res = funcs[i].call(this, res)
        return res
      }
    )
  }

  _.compose3 = function () {
    let funcs = arguments
    let start = funcs.length - 1
    let i = start
    let last = funcs[i]
    return arity(
      last.length,
      function composed (x) {
        if (i === start) return composed(funcs[i].apply(this, arguments))
        else if (i--) return composed(funcs[i].call(this, x))
      }
    )
  }

  function prepend (val, arr) {
    let i = -1
    const l = arr.length
    const res = Array(l + 1)

    res[0] = val
    while (++i < l) res[i+1] = arr[i]
    return res
  }

  _.prepend = curry2(prepend)

  _.product = (arr) => reduce(_.multiply, 1, arr)

  _.prop = curry2((prop, obj) => obj[prop])

  _.propEq = curry3((key, val, obj) => obj[ key ] === val)

  _.props = curry2((props, obj) => props.map((p) => obj[p]))

  _.pluck = curry2((prop, arr) => {
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

  _.range = curry2((start, end) => Array(end - start).fill(1).map((e, i) => i + start))

  function reduce (fn, init, arr) {
    let l = arr.length, i = 0,
        res = init === undefined ? arr[i++] : init

    for (; i < l; i++) res = fn(res, arr[i], i, arr)

    return res
  }

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

  _.reduce = curry3((f, ini, e) => Array.isArray(e) ? reduce(f, ini, e) : reduceObject(f, ini, e))
  
  const reduceRight = (fn, init, arr) => {
    let l = arr.length,
        res = init === undefined ? arr[--l] : init

    while (--l >= 0) {
      res = fn(res, arr[l], l, arr)
    }

    return res
  }

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

  _.reduceRight = curry3((f, ini, e) => Array.isArray(e) ? reduceRight(f, ini, e) : reduceRightObject(f, ini, e))

  const reject = (fn, arr) => filter(_.complement(fn), arr)

  _.reject = curry2(reject)
  // replace
  _.reverse = arr => cloneArray(arr).reverse()

  _.scan = curry3((fn, acc, arr) => {
    let i = -1
    const len = arr.length
    const res = [acc]
    while (++i < len) {
      acc = fn(acc, arr[i])
      res[i + 1] = acc
    }
    return res;
  })

  const slice = (start, end, arr) => {
    let res, 
        len = arr.length, i = 0

    start = start === undefined ? 0 : start < 0 ? start + len < 0 ? 0 : start + len : start
    end = end == null ? len : end < 0 ? end + len : end > len ? len : end
    res = Array(end - start)

    for (; start < end; start++) res[i++] = arr[start]

    return res
  }

  _.slice = curry3(slice)
  // some
  // sort
  _.sortBy = curry2((fn, arr) => cloneArray(arr).sort((a, b, fnA, fnB) => (fnA = fn(a)) && (fnB = fn(b)) && fnA < fnB ? -1 : fnA > fnB ? 1 : 0))
  // split
  _.splitAt = curry2((i, arr) => [slice(0, i, arr), slice(i, null, arr)])

  _.substract = curry2((a, b) => b - a)

  _.sum = arr => reduce((sum, e) => sum + e, 0, arr)

  _.tail = arr => slice(1, null, arr)

  _.take = curry2((i, arr) => slice(0, i, arr))

  _.takeWhile = curry2((fn, arr) => {
    let l = arr.length,
        i = -1, res = []

    while (++i < l && fn(arr[i])) res[i] = arr[i]

    return res
  })

  _.takeLast = curry2((i, arr) => slice(-i, null, arr))

  _.takeLastWhile = curry2((fx, arr) => {
    let l = arr.length

    while (--l > 0 && fx(arr[l])) {}

    return slice(l + 1, null, arr)
  })

  _.tap = curry2((fx, x) => {
    fx(x)
    return x
  })

  _.test = curry2((regex, str) => str.search(regex) !== -1)
  // toLowerCase
  _.toPairs = obj => {
    let pairs = [], prop

    for (prop in obj) if (has(prop, obj)) pairs[pairs.length] = [prop, obj[prop]]

    return pairs
  }

  _.toString = (x, seen) => {
    const recur = y => {
      let xs = concat([x], seen)
      return contains(y, xs) ? '<Circular>' : _.toString(y, xs)
    }
    const mapPairs = (obj, keys) => map(k => quote(k) + ': ' + recur(obj[k]), keys.slice().sort())
    let t = _.type(x), re
    return t === 'Arguments' ? '(function() { return arguments; }(' + map(recur, x).join(', ') + '))'
      : t === 'Array' ? '[' + map(recur, x).concat(mapPairs(x, reject(k => /^\d+$/.test(k), _.keys(x)))).join(', ') + ']'
      : t === 'Boolean' ? typeof x === 'object' ? 'new Boolean(' + recur(x.valueOf()) + ')' : x.toString()
      : t === 'Date' ? 'new Date(' + (isNaN(x.valueOf()) ? recur(NaN) : quote(x.toISOString())) + ')'
      : t === 'Function' ? (re = x.toString()) && re !== '[object Object]' && re
      : t === 'Null' ? 'null'
      : t === 'Number' ? typeof x === 'object' ? 'new Number(' + recur(x.valueOf()) + ')' : 1 / x === -Infinity ? '-0' : x.toString(10)
      : t === 'Object' ? '{' + mapPairs(x, _.keys(x)).join(', ') + '}'
      : t === 'String' ? typeof x === 'object' ? 'new String(' + recur(x.valueOf()) + ')' : quote(x)
      : t === 'Undefined' ? 'undefined'
      : 'Not implemented :('
  }
  // toUpperCase
  // trim
  const truty = _.truty = () => true

  _.type = a => toString.call(a).slice(8, -1)

  _.uniq = arr => reduce((acc, val) => !contains(val, acc) ? acc.push(val) && acc : acc, [], arr)

  _.uniqWith = curry2((fn, arr) => {
    let i = -1, l = arr.length, 
        res = [], val

    while (++i < l) {
      val = arr[i]
      if (!containsWith(fn, val, res)) res[res.length] = val
    }

    return res
  })

  _.update = curry3((i, val, arr) => {
    const res = cloneArray(arr),
          l = arr.length

    if (i < 0) i = l + i
    if (i >= 0 && i < l) res[i] = val

    return res
  })

  _.values = obj => {
    let keys = Object.keys(obj),
        l = keys.length,
        res = Array(l), i = 0

    for (; i < l; i++) res[i] = obj[keys[i]]

    return res
  }

  _.without = curry2(function (vals, arr) {
    let l = arr.length, i = -1,
        j = 0, res = [], val

    while (++i < l) {
      val = arr[i]
      if (!contains(val, vals)) res[j++] = val
    }

    return res
  })

  if (typeof exports === 'object') {
    module.exports = _
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return _ })
  } else {
    this._ = _
  }
}.call(this))
