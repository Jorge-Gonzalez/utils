import { curry2, curry3, curryN, isObject, isArray, isArrayLike, isString, isFunction } from './base.js'
import { isTransformer, reduce, object, array, string, xMap, xAll, INIT } from './transducers.js'
export { transduce } from './transducers.js'

const reducerFrom = obj =>
  isArrayLike(obj) ? array :
    isString(obj) ? string :
      isObject(obj) ? object :
        new Error('Cannot create transformer for ' + obj)

const into = curry3((acc, transducer, list) => {
  var xf = transducer(isTransformer(acc) ? acc : reducerFrom(acc))
  return reduce(xf, xf[INIT](), list)
})

const ap = curry2((applyF, applyX) => {
  return (
    typeof applyX['fantasy-land/ap'] === 'function' ? applyX['fantasy-land/ap'](applyF) :
      typeof applyF.ap === 'function' ? applyF.ap(applyX) :
        typeof applyF === 'function' ? (x) => applyF(x)(applyX(x)) :
          _reduce((acc, f) => acc.concat(map(f, applyX)), [], applyF)
  )
})

// const symbIt = (typeof Symbol !== 'undefined') ? Symbol.iterator : '@@iterator';

// const methodReduce = (reducer, acc, obj, methodName) => obj[methodName](reducer, acc)

// function iterableReduce(reducer, acc, iter) {
//   for (val of iter) {
//     acc = reducer(acc, val)
//   }
//   return acc;
// }

// const createReduce = (itRdx, fnRdx) => (xf, acc, list) =>
//   isArrayLike(list) ? itRdx(xf, acc, list) :
//     list == null ? acc :
//       typeof list['fantasy-land/reduce'] === 'function' ? fnRdx(xf, acc, list, 'fantasy-land/reduce') :
//         list[symbIt] != null ? itRdx(xf, acc, list[symbIt]()) :
//           typeof list.next === 'function' ? itRdx(xf, acc, list) :
//             typeof list.reduce === 'function' ? fnRdx(xf, acc, list, 'reduce') :
//               new TypeError('reduce: list must be array or iterable')

// const _reduce = createReduce(iterableReduce, methodReduce, iterableReduce)

// function dispatchable2(methodNames, operator, fn) {
//   return (f, obj) =>
//     isArray(obj) ? fn(f, obj) :
//       isTransformer(obj) ? operator(f)(obj) :
//         isObject(obj) ? methodNames.reduce((o, m) => typeof o?.[m] === 'function' ? (o[m](f), o) : o, obj) :
//           fn(f, obj)
// }

const _xfBase = {
  init: function() {
    return this.xf['@@transducer/init']();
  },
  result: function(result) {
    return this.xf['@@transducer/result'](result);
  }
};


function XMap(f, xf) {
  this.xf = xf;
  this.f = f;
}
XMap.prototype['@@transducer/init'] = _xfBase.init;
XMap.prototype['@@transducer/result'] = _xfBase.result;
XMap.prototype['@@transducer/step'] = function(result, input) {
  return this.xf['@@transducer/step'](result, this.f(input));
};

const _xmap = function _xmap(f) {
  return function(xf) { return new XMap(f, xf); };
};

function dispatchable2(methodNames, transducerCreator, fn) {
  return function() {
    if (arguments.length === 0) {
      return fn();
    }
    var obj = arguments[arguments.length - 1];
    if (!isArray(obj)) {
      var idx = 0;
      while (idx < methodNames.length) {
        if (typeof obj[methodNames[idx]] === 'function') {
          return obj[methodNames[idx]].apply(obj, Array.prototype.slice.call(arguments, 0, -1));
        }
        idx += 1;
      }
      if (isTransformer(obj)) {
        var transducer = transducerCreator.apply(null, Array.prototype.slice.call(arguments, 0, -1));
        return transducer(obj);
      }
    }
    // return fn.apply(this, arguments);
    console.log('arguments sended from dispatchable2: ', ...arguments)
    return fn(...arguments);
  };
}

const log = (v) => (console.log(v), v)

const _map = (f, e) => {
  let l = e.length, i = 0, res = Array(l)
  for (; i < l; i++) {
    res[i] = f(e[i])
  }
  return res
}

var map = curry2(dispatchable2(['fantasy-land/map', 'map'], _xmap, (fn, functor) => {
  switch (Object.prototype.toString.call(functor)) {
    case '[object Function]':
      return curryN(functor.length, function() {
        return fn.call(this, functor.apply(this, arguments));
      });
    case '[object Object]':
      return Object.keys(functor).reduce((acc, key) => (acc[key] = fn(functor[key]), acc), {},);
    default:
      return [...Array(functor.length)].map((__, i) => fn(functor[i]))
  }
}), 'map');

const all = curry2(dispatchable2(['all'], xAll, (fn, arr) => {
  for (let l = arr.length, i = 0; i < l; i++) {
    if (!fn(arr[i])) { return false }
  }
  return true
}))

export {
  all,
  into,
  map
}
