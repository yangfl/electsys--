'use strict'
class Queue extends Array {
  constructor () {
    super()
    this.running = false
    this.defaultOptions = undefined
  }

  clear () {
    while (this.length) {
      this.pop()
    }
  }

  push (func, options = this.defaultOptions) {
    let p = new Deferred()
    let q = p.then(func)
    super.push([p, q, options])
    this._start()
    return q
  }

  unshift (func, options = this.defaultOptions) {
    let p = new Deferred()
    let q = p.then(func)
    super.unshift([p, q, options])
    this._start()
    return q
  }

  _then (options) {
    if (typeof options === 'object' && options.cooldown) {
      return setTimeout(() => this._then(), options.cooldown)
    }
    if (this.length) {
      let args = this.shift()
      args[0].resolve()
      return args[1].then(() => this._then(args[2]), () => {
        // stop when error
        this.running = false
        this.clear()
      })
    } else {
      this.running = false
    }
  }

  _start () {
    if (this.running === false) {
      this.running = true
      return this._then()
    }
  }
}


class Deferred {
  constructor (func) {
    let resolve
    let reject
    let p = new Promise((u, v) => {
      resolve = u
      reject = v
    })
    if (typeof func === 'function') {
      p = p.then(() => new Promise(func))
    }
    p.resolve = resolve
    p.reject = reject
    return p
  }
}
