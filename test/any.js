import listXf from './helpers/listXf.js'

import * as R from '../src/index.js'
import eq from './shared/eq.js'
import { any } from '../src/extended.js'


describe('any', function() {
  var odd = function(n) { return n % 2 === 1; };
  var T = function() { return true; };
  var intoArray = R.into([]);

  it('returns true if any element satisfies the predicate', function() {
    eq(any(odd, [2, 4, 6, 8, 10, 11, 12]), true);
  });

  it('returns false if all elements fails to satisfy the predicate', function() {
    eq(any(odd, [2, 4, 6, 8, 10, 12]), false);
  });

  it('returns true into array if any element satisfies the predicate', function() {
    eq(intoArray(any(odd), [2, 4, 6, 8, 10, 11, 12]), [true]);
  });

  it('returns false if all elements fails to satisfy the predicate', function() {
    eq(intoArray(any(odd), [2, 4, 6, 8, 10, 12]), [false]);
  });

  it('works with more complex objects', function() {
    var people = [{ first: 'Paul', last: 'Grenier' }, { first: 'Mike', last: 'Hurley' }, { first: 'Will', last: 'Klein' }];
    var alliterative = function(person) { return person.first.charAt(0) === person.last.charAt(0); };
    eq(any(alliterative, people), false);
    people.push({ first: 'Scott', last: 'Sauyet' });
    // eq(any(alliterative, people), true);
  });

  it('can use a configurable function', function() {
    var teens = [{ name: 'Alice', age: 14 }, { name: 'Betty', age: 18 }, { name: 'Cindy', age: 17 }];
    var atLeast = function(age) { return function(person) { return person.age >= age; }; };
    eq(any(atLeast(16), teens), true);
    eq(any(atLeast(21), teens), false);
  });

  it('returns false for an empty list', function() {
    eq(any(T, []), false);
  });

  it('returns false into array for an empty list', function() {
    eq(intoArray(any(T), []), [false]);
  });

  it('dispatches when given a transformer in list position', function() {
    eq(any(odd, listXf).xf, listXf)
    eq(any(odd, listXf).f, odd)
  });

  it('can act as a transducer', function() {
    var input = [2, 4, 6, 8, 10];
    var expected = [false];
    eq(R.into([], any(odd), input), expected);
    eq(R.transduce(any(odd), R.flip(R.append), [], input), expected);
  });

});
