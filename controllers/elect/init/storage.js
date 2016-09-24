'use strict'
let db
function initDatabase () {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open(sdtleft.info.toString())

    request.onerror = function (event) {
      return reject(event.target.error)
    }

    request.onupgradeneeded = function (event) {
      db = this.result
      db.onerror = function (event) {
        loggerError('init.storage')(event.target.error)
      }

      let store_lesson = db.createObjectStore('lesson', {keyPath: 'fullref'})
      store_lesson.createIndex('bsid', 'bsid', { unique: true })

      let store_tab = db.createObjectStore('tab', { autoIncrement: true })
      store_tab.createIndex('from', 'from')
      store_tab.createIndex('to', 'to')
      loggerInit('init.storage', 'database \'' + sdtleft.info + '\' created')
    }

    request.onsuccess = function (event) {
      db = this.result
      db.onerror = function (event) {
        loggerError('init.storage')(event.target.error)
      }

      if (!db.objectStoreNames.contains('lesson')) {
        loggerInit('init.storage',
          'Broken database: no objectStore \'lesson\'', 'error')
        return reject()
      }
      if (!db.transaction('lesson').objectStore('lesson')
          .indexNames.contains('bsid')) {
        loggerInit('init.storage',
          'Broken database: index \'bsid\' missing on objectStore \'lesson\'',
          'error')
        return reject()
      }

      if (!db.objectStoreNames.contains('tab')) {
        loggerInit('init.storage',
          'Broken database: no objectStore \'tab\'', 'error')
        return reject()
      }
      if (!db.transaction('tab').objectStore('tab')
          .indexNames.contains('from')) {
        loggerInit('init.storage',
          'Broken database: index \'from\' missing on objectStore \'tab\'',
          'error')
        return reject()
      }
      if (!db.transaction('tab').objectStore('tab')
          .indexNames.contains('to')) {
        loggerInit('init.storage',
          'Broken database: index \'to\' missing on objectStore \'tab\'',
          'error')
        return reject()
      }
      return resolve()
    }
  })
  .then(
    () => loggerInit('init.storage', 'database ready'),
    loggerError('init.storage', 'Database error during opening', true))
}
