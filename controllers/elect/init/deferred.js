'use strict'
let ondeferredtaskerror


let deferredPool = new class DeferredPool {
  constructor () {
    this.status = 'pending'
    this.tasks = {}
    this.start = new Deferred()
    this.finished = this.start.then(
      () => Promise.all(Object.values(this.tasks)))

    this.finished.then(() => {
      this.status = 'finished'
    }, () => {
      this.status = 'failed'
    })
  }
}


deferredPool.start.then(() => {
  loggerInit('deferred', 'deferred tasks start')
})
deferredPool.finished.then(
  () => loggerInit('deferred', 'deferred tasks finished'),
  () => {
    loggerInit('deferred', 'Error in deferred tasks')
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
