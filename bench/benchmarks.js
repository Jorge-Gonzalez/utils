import * as _ from '../src/index.js'

const benchmarks = [
  {
    "filterObject_while_loop": 16168,
    "filterObject_while_loop_2": 16124,
    "filterObject_for_loop": 17006,
    "filterObject_reducer": 16617,
    "filterObject_custom_reducer": 16375,
  },
  {
    "filterObject_while_loop": 16144,
    "filterObject_while_loop_2": 16622,
    "filterObject_for_loop": 16949,
    "filterObject_reducer": 14800,
    "filterObject_custom_reducer": 15577,
  },
  {
    "filterObject_while_loop": 16403,
    "filterObject_while_loop_2": 16370,
    "filterObject_for_loop": 16917,
    "filterObject_reducer": 15376,
    "filterObject_custom_reducer": 15131,
  },
  {
    "filterObject_while_loop": 16665,
    "filterObject_while_loop_2": 17113,
    "filterObject_for_loop": 16003,
    "filterObject_reducer": 15646,
    "filterObject_custom_reducer": 16705,
  },
  {
    "filterObject_while_loop": 16295,
    "filterObject_while_loop_2": 16647,
    "filterObject_for_loop": 17122,
    "filterObject_reducer": 15844,
    "filterObject_custom_reducer": 14826,
  },
  {
    "filterObject_while_loop": 16389,
    "filterObject_while_loop_2": 16398,
    "filterObject_for_loop": 16002,
    "filterObject_reducer": 14968,
    "filterObject_custom_reducer": 14726,
  },
  {
    "filterObject_while_loop": 16279,
    "filterObject_while_loop_2": 16894,
    "filterObject_for_loop": 15612,
    "filterObject_reducer": 14019,
    "filterObject_custom_reducer": 14987,
  },
  {
    "filterObject_while_loop": 15106,
    "filterObject_while_loop_2": 15083,
    "filterObject_for_loop": 15596,
    "filterObject_reducer": 15335,
    "filterObject_custom_reducer": 14899,
  },
  {
    "filterObject_while_loop": 15620,
    "filterObject_while_loop_2": 15565,
    "filterObject_for_loop": 15981,
    "filterObject_reducer": 13852,
    "filterObject_custom_reducer": 14752,
  },
  {
    "filterObject_while_loop": 15868,
    "filterObject_while_loop_2": 15143,
    "filterObject_for_loop": 15346,
    "filterObject_reducer": 16240,
    "filterObject_custom_reducer": 14500,
  },
  {
    "filterObject_while_loop": 16543,
    "filterObject_while_loop_2": 17340,
    "filterObject_for_loop": 16971,
    "filterObject_reducer": 15853,
    "filterObject_custom_reducer": 16009,
  },
  {
    "filterObject_while_loop": 16619,
    "filterObject_while_loop_2": 16701,
    "filterObject_for_loop": 16789,
    "filterObject_reducer": 15720,
    "filterObject_custom_reducer": 15901,
  },
  {
    "filterObject_while_loop": 16179,
    "filterObject_while_loop_2": 16609,
    "filterObject_for_loop": 16941,
    "filterObject_reducer": 16488,
    "filterObject_custom_reducer": 15444,
  },
  {
    "filterObject_while_loop": 15195,
    "filterObject_while_loop_2": 15152,
    "filterObject_for_loop": 15288,
    "filterObject_reducer": 14217,
    "filterObject_custom_reducer": 14637,
  },
  {
    "filterObject_while_loop": 16666,
    "filterObject_while_loop_2": 16221,
    "filterObject_for_loop": 15496,
    "filterObject_reducer": 15679,
    "filterObject_custom_reducer": 16744,
  },
  {
    "filterObject_while_loop": 16068,
    "filterObject_while_loop_2": 15940,
    "filterObject_for_loop": 16283,
    "filterObject_reducer": 16544,
    "filterObject_custom_reducer": 16596,
  },
  {
    "filterObject_while_loop": 16172,
    "filterObject_while_loop_2": 16960,
    "filterObject_for_loop": 17030,
    "filterObject_reducer": 16695,
    "filterObject_custom_reducer": 16921,
  }
]

const init = {
  "filterObject_while_loop": 0,
  "filterObject_while_loop_2": 0,
  "filterObject_for_loop": 0,
  "filterObject_reducer": 0,
  "filterObject_custom_reducer": 0,
}

let sumBenchmarks = _.reduce(_.mergeWith(_.add))

let getSmallest = _.reduce((min, n) => min < n ? min : n, Infinity)

let totalBenchmark = sumBenchmarks(init, benchmarks)
let smallest = getSmallest(totalBenchmark)
let percentBenchmarks = _.map(v => Math.round(v / smallest * 100), totalBenchmark)

console.log(percentBenchmarks)
