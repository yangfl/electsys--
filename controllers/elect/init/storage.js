'use strict'
let db_lesson
deferredPool.tasks.storage_lesson = deferredPool.start
  .then(() => new Promise((resolve, reject) => {
    let request_lesson = indexedDB.open('LessonInfoDatabase')
    request_lesson.onerror = function (event) {
      return reject(event.target.error)
    }
    request_lesson.onupgradeneeded = function (event) {
      db_lesson = this.result
      db_lesson.onerror = function (event) {
        loggerError('init.storage.lesson')(event.target.error)
      }
      if (!db_lesson.objectStoreNames.contains('lesson')) {
        let store = db_lesson.createObjectStore('lesson', {keyPath: 'fullref'})
        store.createIndex('bsid', 'bsid', { unique: true })
        loggerInit('init.storage.lesson', 'objectStore \'lesson\' created')
      }
    }
    request_lesson.onsuccess = function (event) {
      db_lesson = this.result
      db_lesson.onerror = function (event) {
        loggerError('init.storage.lesson')(event.target.error)
      }
      if (!db_lesson.objectStoreNames.contains('lesson')) {
        loggerInit('init.storage.lesson',
          'Broken database: no objectStore \'lesson\'', 'error')
        return reject()
      }
      if (!db_lesson.transaction('lesson').objectStore('lesson')
          .indexNames.contains('bsid')) {
        loggerInit('init.storage.lesson',
          'Broken database: index \'bsid\' missing on objectStore \'lesson\'',
          'error')
        return reject()
      }
      return resolve()
    }
  }))
  .then(
    () => loggerInit('init.storage.lesson', 'database ready'),
    loggerError('init.storage.lesson', 'Database error during opening', true))


let db_tab
let cur_tab_store_name
deferredPool.tasks.storage_tab = deferredPool.start
  .then(() => new Promise((resolve, reject) => {
    let request_tab = indexedDB.open('TabCacheDatabase')
    request_tab.onerror = function (event) {
      return reject(event.target.error)
    }
    request_tab.onsuccess = function (event) {
      try {
        db_tab = this.result
        db_tab.onerror = function (event) {
          loggerError('init.storage.tab')(event.target.error)
        }
        return resolve()
      } catch (e) {
        return reject(e)
      }
    }
  }))
  .then(
    () => loggerInit('init.storage.tab', 'database ready'),
    loggerError('init.storage.tab', 'Database error during opening', true))


function initTabCacheDatabase () {
  cur_tab_store_name = sdtleft.info.year + '-' + sdtleft.info.semester
  return deferredPool.tasks.storage_tab.then(() => {
    if (!db_tab.objectStoreNames.contains(cur_tab_store_name)) {
      return new Promise(function (resolve, reject) {
        db_tab.close()
        let request_tab = indexedDB.open('TabCacheDatabase', db_tab.version + 1)
        request_tab.onupgradeneeded = function (event) {
          db_tab = this.result
          db_tab.onerror = function (event) {
            loggerError('init.storage.tab')(event.target.error)
          }
          let store = db_tab.createObjectStore(
            cur_tab_store_name, { autoIncrement: true })
          store.createIndex('from', 'from')
          store.createIndex('to', 'to')
          loggerInit(
            'init.storage.tab', `objectStore '${cur_tab_store_name}' created`)
        }
        request_tab.onsuccess = function (event) {
          db_tab = this.result
          db_tab.onerror = function (event) {
            loggerError('init.storage.tab')(event.target.error)
          }
          if (!db_lesson.objectStoreNames.contains(cur_tab_store_name)) {
            loggerInit('init.storage.tab',
              `Broken database: no objectStore '${cur_tab_store_name}'`,
              'error')
            return reject()
          }
          let store = db_lesson.transaction(cur_tab_store_name)
            .objectStore(cur_tab_store_name)
          if (!store.indexNames.contains('from')) {
            loggerInit('init.storage.tab',
              `Broken database: index 'from' missing on objectStore '${cur_tab_store_name}'`,
              'error')
            return reject()
          }
          if (!store.indexNames.contains('to')) {
            loggerInit('init.storage.tab',
              `Broken database: index 'to' missing on objectStore '${cur_tab_store_name}'`,
              'error')
            return reject()
          }
          return resolve()
        }
      })
    }
  })
}
