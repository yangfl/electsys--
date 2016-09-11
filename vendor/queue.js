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
    let p = new Deferred().then(func)
    super.push([p, options])
    this._start()
    return p
  }

  unshift (func, options = this.defaultOptions) {
    let p = new Deferred().then(func)
    super.unshift([p, options])
    this._start()
    return p
  }

  _then (options) {
    if (typeof options === 'object' && options.cooldown) {
      return setTimeout(() => this._then(), options.cooldown)
    }
    if (this.length) {
      let args = this.shift()
      args[0].then(() => {
        // prevent long async stack
        this._then(args[1])
      }, () => {
        // stop when error
        this.running = false
      })
      return args[0].resolve()
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
