export function _all(fn, lst) {
  let i = 0, l = lst.length
  for (; i < l; i++) {
    if (!fn(lst[i])) {
      return false
    }
  }
  return true
}

export function _any(fn, lst) {
  let i = 0, l = lst.length
  for (; i < l; i++) {
    if (fn(lst[i])) { return true }
  }
  return false
}

export function _aperture(n, list) {
  let idx = 0;
  const limit = list.length - (n - 1);
  const acc = new Array(limit >= 0 ? limit : 0);
  while (idx < limit) {
    acc[idx] = Array.prototype.slice.call(list, idx, idx + n);
    idx += 1;
  }
  return acc;
}

export function _concat(a = [], b = []) {
  let al = a.length, bl = b.length, res = Array(al + bl), i = 0, j = 0
  for (; i < al; i++) { res[i] = a[i] }
  for (; j < bl; j++, i++) { res[i] = b[j] }
  return res
}

export function _includes (e, arr) { return _indexOf(arr, e, 0) >= 0 }

export function _indexOf (list, a, idx) {
  var inf, item;
  switch (typeof a) {
    case 'number':
      if (a === 0) {
        // manually crawl the list to distinguish between +0 and -0
        inf = 1 / a;
        while (idx < list.length) {
          item = list[idx];
          if (item === 0 && 1 / item === inf) {
            return idx;
          }
          idx += 1;
        }
        return -1;
      } else if (a !== a) {
        // NaN
        while (idx < list.length) {
          item = list[idx];
          if (typeof item === 'number' && item !== item) {
            return idx;
          }
          idx += 1;
        }
        return -1;
      }
      // non-zero numbers can utilise Set
      return list.indexOf(a, idx);

    // all these types can utilise Set
    case 'string':
    case 'boolean':
    case 'function':
    case 'undefined':
      return list.indexOf(a, idx);

    case 'object':
      if (a === null) {
        // null can utilise Set
        return list.indexOf(a, idx);
      }
  }

  // anything else not covered above, defer to R.equals
  while (idx < list.length) {
    if (equals(list[idx], a)) {
      return idx;
    }
    idx += 1;
  }
  return -1;
}

export function _map(fn, lst) {
  let i = 0, l = lst.length, res = Array(l)
  for (; i < l; i++) {
    res[i] = fn(lst[i], i, lst)
  }
  return res
}

export function _mapObject(fn, obj) {
  let keys = Object.keys(obj), l = keys.length, i = 0, res = {}, key
  obj = Object(obj)
  for (; i < l; i++) {
    key = keys[i]
    res[key] = fn(obj[key], key, obj)
  }
  return res
}

export function _slice(start, end, arr) { return Array.prototype.slice.call(arr, start, end) }

