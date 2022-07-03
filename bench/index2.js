import * as _ from '../index.js'
const Benchmark = require('benchmark')
const suite = new Benchmark.Suite('My performance test')

const filterObjFor = (fn, obj) => {
  let keys = Object.keys(obj),
    l = keys.length, res = {}, i, key;
  for (i = 0; i < l; i++) {
    key = keys[i];
    if (fn(obj[key], key, obj)) res[key] = obj[key];
  }
  return res;
};

const filterObjWhile = (fn, obj) => {
  let keys = Object.keys(obj), l = keys.length, res = {}, i = -1, key;
  while (++i < l) {
    key = keys[i];
    if (fn(obj[key], key, obj)) res[key] = obj[key];
  }
  return res;
}

const filterObjWhile2 = (fn, obj) => {
  const keys = Object.keys(obj), l = keys.length, res = {};
  let i = -1, key;
  while (++i < l) {
    key = keys[i];
    if (fn(obj[key], key, obj)) res[key] = obj[key];
  }
  return res;
}

function reduce(fn, init, arr) {
  let l = arr.length, i = 0,
    res = init === undefined ? arr[i++] : init

  for (; i < l; i++) res = fn(res, arr[i], i, arr)

  return res
}

const filterObjReduce = (pred, obj) => Object.keys(obj).reduce((res, key) => pred(obj[key], key, obj) ? (res[key] = obj[key], res) : res, {});

const filterObjReduce2 = (pred, obj) => reduce((res, key) => pred(obj[key], key, obj) ? (res[key] = obj[key], res) : res, {}, Object.keys(obj));

const pow2 = value => value ** 2

const double = value => value * 2

const positive = v => v > 0;

const isEven = n => n % 2 === 0

const makeTestObj = (size) => {
  let res = {}, i = -1
  while (++i < size) {
    res[i] = i
  }
  return res
}

const obj = makeTestObj(1000)

suite
  .add('filter while loop', () => {
    const processed = filterObjWhile(isEven, obj)
  })
  .add('filter while loop 2', () => {
    const processed = filterObjWhile2(isEven, obj)
  })
  .add('filter for loop', () => {
    const processed = filterObjFor(isEven, obj)
  })
  .add('filter reducer', () => {
    const processed = filterObjReduce(isEven, obj)
  })
  .add('filter custom reducer', () => {
    const processed = filterObjReduce2(isEven, obj)
  })
  .on('cycle', event => {
    const benchmark = event.target;

    console.log(benchmark.toString());
  })
  .on('complete', event => {
    const suite = event.currentTarget;
    const fastestOption = suite.filter('fastest').map('name');

    console.log(`The fastest ${fastestOption.length === 1 ? 'is' : 'are'} ${fastestOption}`);
  })
  .run();
