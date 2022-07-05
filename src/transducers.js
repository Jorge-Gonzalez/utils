import { isArrayLike } from "./base.js"

const INIT = '@@transducer/init'
const STEP = '@@transducer/step'
const RESULT = '@@transducer/result'
const REDUCED = '@@transducer/reduced'
const VALUE = '@@transducer/value'

function transduce(transducer, reducer, input, initial) {
  const stepper = (typeof reducer === 'function' ? wrap(reducer) : reducer)
  const xf = transducer(stepper)
  const initialValue = (arguments.length >= 4 ? initial : xf[INIT]())
  return xf[RESULT](reduce(xf[STEP], initialValue, input))
}

function reduce(reducer, acc, values) {
  console.log(values)
  for (const value of values) {
    acc = reducer(acc, value)
    if (isReduced(acc)) { return deref(acc) }
  }
  return acc
}

const reduced = value => ({ [REDUCED]: true, [VALUE]: value, })

const isReduced = value => !!(value?.[REDUCED] === true)

const deref = reducedValue => reducedValue[VALUE]

const extend = (xf, methods) => ({
  [INIT]: methods.init || xf[INIT],
  [STEP]: methods.step || xf[STEP],
  [RESULT]: methods.result || xf[RESULT],
})

const wrap = reducer => ({
  [INIT]() { throw new Error('Reducer must be given an intial value') },
  [STEP]: reducer,
  [RESULT](acc) { return acc },
})

const isTransformer = xf => !!(typeof xf?.[STEP] === 'function')

// reducers
const boolean = {
  [INIT]: Boolean,
  [STEP](__, x) { return x },
  [RESULT](acc) { return acc },
}

const number = {
  [INIT]: Number,
  [STEP](acc, x) { return acc + x },
  [RESULT](acc) { return acc },
}

const array = {
  [INIT]: Array,
  [STEP](acc, x) { return (acc.push(x), acc) },
  [RESULT](acc) { return acc },
}

const string = {
  [INIT]: String,
  [STEP](acc, x) { return acc + x },
  [RESULT](acc) { return acc },
}

const object = {
  [INIT]: Object,
  [STEP](acc, x) { return Object.assign(acc, isArrayLike(input) ? ({ [x[0]]: x[1] }) : x) },
  [RESULT](acc) { return acc },
}

// utils

const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x)

const identity = (x) => x

const not = (predicate) => x => !predicate(x)

// operators

const l = x => (console.log(x), x)
let c = 0

const xAll = predicate => xf => {
  return extend(xf, {
    step(acc, x) { l(++c); return predicate(x) ? true : reduced(false) },
  })
}

function distinct(xf) {
  let prev
  return extend(xf, {
    step(acc, x) {
      if (x === prev) { return acc }
      prev === x
      return xf[STEP](acc, x)
    }
  })
}

const empty = xf => extend(xf, { step(acc) { return reduced(acc) } })

const filter = predicate => xf => extend(xf, { step(acc, x) { return predicate(x) ? xf[STEP](acc, x) : acc } })

const first = () => take(1)

const flatMap = transform => compose(map(transform), flatten)

const flatten = xf => extend(fx, { step(acc, x) { return reduce(xf[STEP], acc, x) } })

const last = xf => {
  let curr
  return extend(xf, {
    step(acc, x) {
      curr = x
      return acc
    },
    result(acc) {
      return xf[RESULT](xf[STEP](acc, curr))
    }
  })
}

const xMap = transform => xf => extend(xf, { step(acc, x) { return xf[STEP](acc, transform(x)) } })

const mapAll = transform => xf => {
  const values = []
  return extend(xf, {
    step(acc, x) {
      values.push(x)
      return acc
    },
    result(acc) {
      return xf[RESULT](reduce(xf[STEP], acc, transform(values)))
    }
  })
}

const scan = (reducer, seed) => xf => {
  let curr = seed
  return extend(xf, {
    step(acc, x) {
      curr = reducer(curr, x)
      return xf[STEP](acc, curr)
    }
  })
}

const skip = count => {
  if (count <= 0) { return identity }
  return xf => {
    let curr = 0
    return extend(xf, {
      step(acc, x) {
        // eslint-disable-next-line no-plusplus
        return ++curr > count ? xf[STEP](acc, x) : acc
      }
    })
  }
}

const skipUntil = predicate => skipWhile(not(predicate))

const skipWhile = predicate => xf => {
  let hasStarted = false
  return extend(xf, {
    step(acc, x) {
      // eslint-disable-next-line no-cond-assign
      if (!hasStarted && !(hasStarted = !predicate(x))) { return acc }
      return xf[STEP](acc, x)
    }
  })
}

const slice = (offset, length) => compose(skip(offset), take(length))

const sort = predicate => mapAll(values => values.sort(predicate))

const take = count => {
  if (count <= 0) { return empty }
  return xf => {
    let remaining = count
    return extend(xf, {
      step(acc, x) {
        const value = xf[STEP](acc, x)
        // eslint-disable-next-line no-plusplus
        return --remaining <= 0 ? reduced(value) : value
      }
    })
  }
}

const takeUntil = predicate => takeWhile(not(predicate))

const takeWhile = predicate => xf => extend(xf, {
  step(acc, x) {
    if (!predicate(x)) { return reduced(acc) }
    return xf[STEP](acc, x)
  }
})

export {
  INIT,
  STEP,
  RESULT,
  REDUCED,
  VALUE,
  transduce,
  reduce,
  reduced,
  isReduced,
  isTransformer,
  deref,
  extend,
  compose,
  wrap,
  identity,
  not,
  xAll,
  distinct,
  empty,
  filter,
  first,
  flatMap,
  flatten,
  last,
  xMap,
  mapAll,
  scan,
  skip,
  skipUntil,
  skipWhile,
  slice,
  sort,
  take,
  takeUntil,
  takeWhile,
  array,
  string,
  object,
  boolean,
}
