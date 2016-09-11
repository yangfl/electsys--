'use strict'
let isError = false
let ondeferredtaskerror


let deferredPool = new class {
  constructor () {
    this.start = new Deferred()
    this.finished = this.start.then(() => {
      loggerInit('deferred', 'deferred tasks start')
      return Promise.all(Object.values(this.tasks))
        .then(this.finished.resolve, this.finished.reject)
    })
    this.tasks = {}
  }
}


deferredPool.finished.then(
  () => loggerInit('deferred', 'deferred tasks finished'),
  () => {
    isError = true
    if (ondeferredtaskerror) {
      return ondeferredtaskerror()
    }
  })


deferredPool.tasks.config = deferredPool.start.then(() => config.init()).then(
  () => loggerInit('init.config', 'config loaded'),
  loggerError('init.config', true))
deferredPool.tasks.i18n = deferredPool.start.then(() => i18n('elect_')).then(
  () => loggerInit('init.i18n', 'loaded'),
  loggerError('init.i18n'))
