import listXf from './helpers/listXf.js'

import * as R from '../src/index.js'
import { all } from '../src/extended.js'
import eq from './shared/eq.js'
// import { all } from '../src/extended.js'

describe('all', function() {
  var even = function(n) { return n % 2 === 0; };
  var T = function() { return true; };
  var isFalse = function(x) { return x === false; };
  var intoArray = R.into([]);

  it('returns true if all elements satisfy the predicate', function() {
    eq(all(even, [2, 4, 6, 8, 10, 12]), true);
    eq(all(isFalse, [false, false, false]), true);
  });

  it('returns false if any element fails to satisfy the predicate', function() {
    eq(all(even, [2, 4, 6, 8, 9, 10]), false);
  });

  it('returns true for an empty list', function() {
    eq(all(T, []), true);
  });

  it('returns true into array if all elements satisfy the predicate', function() {
    eq(intoArray(all(even), [2, 4, 6, 8, 10, 12]), [true]);
    eq(intoArray(all(isFalse), [false, false, false]), [true]);
  });

  it('returns false into array if any element fails to satisfy the predicate', function() {
    eq(intoArray(all(even), [2, 4, 6, 8, 9, 10]), [false]);
  });

  it('returns true into array for an empty list', function() {
    eq(intoArray(all(T), []), [true]);
  });

  it('works with more complex objects', function() {
    var xs = [{ x: 'abc' }, { x: 'ade' }, { x: 'fghiajk' }];
    function len3(o) { return o.x.length === 3; }
    function hasA(o) { return o.x.indexOf('a') > -1; }
    eq(all(len3, xs), false);
    eq(all(hasA, xs), true);
  });

  it('dispatches when given a transformer in list position', function() {
    eq(all(even, listXf).xf, listXf)
    eq(all(even, listXf).f, even)
  });

  it('can act as a transducer', function() {
    var input = [2, 4, 6, 8, 9, 10];
    var expected = [false];
    eq(R.into([], all(even), input), expected);
    eq(R.transduce(all(even), R.flip(R.append), [], input), expected);
  });

});
