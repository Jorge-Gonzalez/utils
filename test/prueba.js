function Curried (fn) {
  this.constructor.prototype[fn.name] = 'method ' + fn.name

}

function curry2 (fn, name) {
	return (function curry2(f, n = f.name) {
	  let _ = {
	    a: null,
	    [n + '_2'](a, ...r) { return r.length ? f(a, ...r) : (_.a = a, _[n + '_1']) },
	    [n + '_1'](...r) { return f(_.a, ...r) }
	  }
	  return _[n + '_2']
	})(fn, name)
}

const add = (a,b) => a + b

console.log ( new Curried(add).add )