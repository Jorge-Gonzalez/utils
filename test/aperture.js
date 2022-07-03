import * as R from '../src/index.js'
import eq from './shared/eq.js'
import { aperture } from '../src/extended.js'


describe('aperture', function() {
  var sevenLs = [1, 2, 3, 4, 5, 6, 7];
  it('creates a list of n-tuples from a list', function() {
    eq(aperture(1, sevenLs), [[1], [2], [3], [4], [5], [6], [7]]);
    eq(aperture(2, sevenLs), [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]]);
    eq(aperture(3, sevenLs), [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [5, 6, 7]]);
    eq(aperture(4, [1, 2, 3, 4]), [[1, 2, 3, 4]]);
  });

  it('returns an empty list when `n` > `list.length`', function() {
    eq(aperture(6, [1, 2, 3]), []);
    eq(aperture(1, []), []);
  });
  null,
    it('can act as a transducer', function() {
      var expected = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]];
      eq(R.into([], aperture(2), sevenLs), expected);
      eq(R.transduce(aperture(2), R.flip(R.append), [], sevenLs), expected);
    });

});
