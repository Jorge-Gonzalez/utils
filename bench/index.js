import * as _ from '../src/index.js'
import Benchmark from 'benchmark'

const suite = new Benchmark.Suite('My performance test')

function _mapObject(fn, obj) {
  let keys = Object.keys(obj), l = keys.length, i = 0, res = {}, key
  obj = Object(obj)
  for (; i < l; i++) {
    key = keys[i]
    res[key] = fn(obj[key], key, obj)
  }
  return res
}

function mapValue(object, iteratee) {
  object = Object(object)
  const result = {}

  Object.keys(object).forEach((key) => {
    result[key] = iteratee(object[key], key, object)
  })
  return result
}

function mapObject(object, iteratee) {
  const props = Object.keys(object)
  const result = new Array(props.length)

  props.forEach((key, index) => {
    result[index] = iteratee(object[key], key, object)
  })
  return result
}

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
  .add('lodash mapValue', () => {
    const processed = mapValue(obj, double)
  })
  .add('my _mapObject', () => {
    const processed = _mapObject(double, obj)
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
