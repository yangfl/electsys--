'use strict'
let mode = {
  modeName (hash = window.location.hash) {
    let name
    let i = hash.indexOf('/')
    if (i === -1) {
      name = hash.substr(1)
    } else {
      name = hash.substr(1, i)
    }
    if (name === '') {
      return 'default'
    }
    return name
  },

  get name () {
    return this.modeName()
  },

  pre () {
    document.getElementById('init-' + this.name).style.display = 'block'
    return this[this.name].pre()
  },

  main () {
    return deferredPool.finished.then(
      () => {
        document.getElementById('init').style.display = 'none'
        document.getElementById('main').style.display = 'block'
        loggerInit('main', 'main interface shown', 'log')
      },
      () => loggerInit('main', 'Abort due to error', 'warn', true))
  },
}


document.addEventListener('DOMContentLoaded', function startLoad () {
  loggerInit('init', 'DOM loaded')
  return mode.pre()
})


window.addEventListener('hashchange', event => {
  let oldHash
  let i = event.oldURL.indexOf('#')
  if (i !== -1) {
    oldHash = event.oldURL.substr(i)
  } else {
    oldHash = ''
  }
  if (mode.modeName(oldHash) !== mode.name) {
    window.location.reload()
  }
})
