// import assert from './assert.js'
const assert = chai.assert

import * as R from '../../src/index.js'


export default function(actual, expected) {
  assert.strictEqual(arguments.length, 2);
  assert.strictEqual(R.toString(actual), R.toString(expected));
};
