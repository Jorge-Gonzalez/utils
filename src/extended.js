import { _all, _any, _aperture, _concat, _slice } from './internal.js'
import { bind, identity, curry2, curry3, curryN, isArray, isArrayLike, log } from './base.js'
import { mapPoly } from './base.js'
import { isTransformer, INIT, STEP, RESULT, VALUE, REDUCED } from './transducers.js'
// export { transduce } from './transducers.js'


// const ap = curry2((applyF, applyX) => {
//   return (
//     typeof applyX['fantasy-land/ap'] === 'function' ? applyX['fantasy-land/ap'](applyF) :
//       typeof applyF.ap === 'function' ? applyF.ap(applyX) :
//         typeof applyF === 'function' ? (x) => applyF(x)(applyX(x)) :
//           _reduce((acc, f) => acc.concat(map(f, applyX)), [], applyF)
//   )
// })


// _createReduce

const symIterator = (typeof Symbol !== 'undefined') ? Symbol.iterator : '@@iterator';

const _createReduce = (arrayReduce, methodReduce, iterableReduce) => (xf, acc, list) =>
  isArrayLike(list) ? arrayReduce(xf, acc, list) :
    list == null ? acc :
      typeof list['fantasy-land/reduce'] === 'function' ? methodReduce(xf, acc, list, 'fantasy-land/reduce') :
        list[symIterator] != null ? iterableReduce(xf, acc, list[symIterator]()) :
          typeof list.next === 'function' ? iterableReduce(xf, acc, list) :
            typeof list.reduce === 'function' ? methodReduce(xf, acc, list, 'reduce') :
              new TypeError('reduce: list must be array or iterable')

// _xReduce

const _xArrayReduce = (xf, acc, list) => {
  let idx = 0,
    len = list.length

  while (idx < len) {
    acc = xf[STEP](acc, list[idx]);
    if (acc?.[REDUCED]) {
      acc = acc[VALUE];
      break;
    }
    idx += 1;
  }
  return xf[RESULT](acc)
}

function _xIterableReduce(xf, acc, iter) {
  var step = iter.next();
  while (!step.done) {
    acc = xf[STEP](acc, step.value);
    if (acc && acc[REDUCED]) {
      acc = acc[VALUE];
      break;
    }
    step = iter.next();
  }
  return xf[RESULT](acc);
}

function _xMethodReduce(xf, acc, obj, methodName) {
  return xf[RESULT](obj[methodName](bind(xf[STEP], xf), acc));
}

var _xReduce = _createReduce(_xArrayReduce, _xMethodReduce, _xIterableReduce);

// setpCat

// var reducerBoolean = {
//   [INIT]: Boolean,
//   [STEP](acc, v) {
//     return v
//   },
//   [RESULT]: identity
// }

var reducerArray = {
  [INIT]: Array,
  [STEP](acc, v) {
    acc.push(v)
    return acc
  },
  [RESULT]: identity
}

var reducerString = {
  [INIT]: String,
  [STEP](acc, v) { return acc + v },
  [RESULT]: identity
}

var reducerObject = {
  [INIT]: Object,
  [STEP](acc, v) {
    return Object.assign(
      acc,
      isArrayLike(v) ? ({ [v[0]]: v[1] }) : v
    )
  },
  [RESULT]: identity
}

const reducerFrom = (obj) =>
  isTransformer(obj) ? obj :
    isArrayLike(obj) ? reducerArray :
      typeof obj === 'string' ? reducerString :
        typeof obj === 'object' ? reducerObject :
          new Error('Cannot create transformer for ' + obj)

// Into

export const into = curry3(function into(acc, transducer, list) {
  const xf = transducer(isTransformer(acc) ? acc : reducerFrom(acc))
  return _xReduce(xf, xf[INIT](), list)
})

// transduce

export const transduce = curryN(4, (xf, fn, acc, list) =>
  _xReduce(xf(typeof fn === 'function' ? wrap(fn) : fn), acc, list)
)

// const reduced = value => ({ [REDUCED]: true, [VALUE]: value, })

const reduced = v =>
  v?.[REDUCED] ? v : ({ [REDUCED]: true, [VALUE]: v })

// const isReduced = value => !!(value?.[REDUCED] === true)

// const deref = reducedValue => reducedValue[VALUE]

const extend = (xf, methods) => ({
  [INIT]: methods.init || xf[INIT],
  [STEP]: methods.step || xf[STEP],
  [RESULT]: methods.result || xf[RESULT],
  xf: methods.xf,
  f: methods.f
})

function wrap(reducer) {
  return ({
    [INIT]() { throw new Error('Reducer must be given an intial value') },
    [STEP]: reducer,
    [RESULT](acc) { return acc },
  })
}

const xmap = f => xf =>
  extend(xf, {
    step(acc, x) { return xf[STEP](acc, f(x)) },
    f,
    xf
  })

const xall = f => xf => {
  let areAll = true
  return extend(xf, {
    step(acc, x) {
      if (!f(x)) {
        areAll = false
        acc = reduced(xf[STEP](acc, false))
      }
      return acc
    },
    result(acc) {
      if (areAll) {
        acc = xf[STEP](acc, true)
      }
      return xf[RESULT](acc)
    },
    f,
    xf
  })
}

const xany = f => xf => {
  let areAny = false
  return extend(xf, {
    step(acc, x) {
      if (f(x)) {
        areAny = true
        acc = reduced(xf[STEP](acc, true))
      }
      return acc
    },
    result(acc) {
      if (!areAny) {
        acc = xf[STEP](acc, false)
      }
      return xf[RESULT](acc)
    },
    f,
    xf
  })
}

const xaperture = n => xf => {
  let pos = 0, full = false, res = Array(n)

  return extend(xf, {
    step(acc, x) {
      res[pos] = x
      pos += 1

      if (pos === res.length) {
        pos = 0
        full = true
      }

      return full ? xf[STEP](acc, _concat(_slice(pos, undefined, res), _slice(0, pos, res))) : acc
    },
    result(acc) {
      res = null
      return xf[RESULT](acc)
    }
  })
}

const xchain = f => xf => _xmap(f)(_flatCat(xf))


// Dispachable

const dispatchable = (methodNames, transducerCreator, fn) =>
  function(...args) {
    let obj = args[args.length - 1], method
    return args.length === 0 ? fn() :
      !isArray(obj) && (method = methodNames.find(m => typeof obj[m] === 'function')) ?
        obj[method](...args.slice(0, -1)) :
        isTransformer(obj) ? transducerCreator(...args.slice(0, -1))(obj) :
          fn(...args)
  }

export const all = curry2(dispatchable(['all'], xall, _all))

export const aperture = curry2(dispatchable([], xaperture, _aperture))

export const any = curry2(dispatchable(['any'], xany, _any))

export const map = curry2(dispatchable(['fantasy-land/map', 'map'], xmap, mapPoly))

