var eq = require('../shared/eq.js');
var _curry2 = require('../../source/internal/_curry2.js');


describe('_curry2', function() {
  it('Coudl be called with one argument at a time or both a the same time.', function() {
    var f = function(a, b) { return [a, b]; };
    var g = _curry2(f);

    eq(g(1)(2), [1, 2]);
    eq(g(1, 2), [1, 2]);

  });
});
