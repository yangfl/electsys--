'use strict'
let db_lesson
deferredPool.tasks.storage_lesson = deferredPool.start
  .then(() => new Promise((resolve, reject) => {
    let request_lesson = indexedDB.open('LessonInfoDatabase')

    request_lesson.onerror = event => reject(event.target.error)

    request_lesson.onupgradeneeded = event => {
      db_lesson = event.target.result

      if (!db_lesson.objectStoreNames.contains('lesson')) {
        let store = db_lesson.createObjectStore('lesson', {keyPath: 'fullref'})
        store.createIndex('bsid', 'bsid', { unique: true })
        loggerInit('init.storage.lesson', 'objectStore \'lesson\' created')
      }
    }

    request_lesson.onsuccess = event => {
      db_lesson = event.target.result
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
deferredPool.tasks.storage_tab = deferredPool.start
  .then(() => new Promise((resolve, reject) => {
    let request_tab = indexedDB.open('TabCacheDatabase')

    request_tab.onerror = event => reject(event.target.error)

    request_tab.onsuccess = event => {
      try {
        db_tab = event.target.result
        db_tab.onerror = function (event) {
          loggerError('init.storage.tab')(event.target.error)
        }
        return resolve(sdtleft.loaded)
      } catch (e) {
        return reject(e)
      }
    }
  })).then(() => {
    let absSemester = sdtleft.info.toString()
    if (!db_tab.objectStoreNames.contains(absSemester)) {
      return new Promise((resolve, reject) => {
        db_tab.close()
        let request_tab = indexedDB.open('TabCacheDatabase', db_tab.version + 1)

        request_tab.onerror = event => reject(event.target.error)

        request_tab.onupgradeneeded = event => {
          db_tab = event.target.result

          let store = db_tab.createObjectStore(
            absSemester, { autoIncrement: true })
          store.createIndex('from', 'from')
          store.createIndex('to', 'to')
          loggerInit('init.storage.lesson',
            'objectStore \'' + absSemester + '\' created')
        }

        request_tab.onsuccess = event => {
          db_tab = event.target.result

          db_tab.onerror = function (event) {
            loggerError('init.storage.tab')(event.target.error)
          }

          if (!db_tab.objectStoreNames.contains(absSemester)) {
            loggerInit('init.storage.tab',
              'Broken database: no objectStore \'' + absSemester + '\'',
              'error')
            return reject()
          }

          let store = db_tab.transaction(absSemester).objectStore(absSemester)
          if (!store.indexNames.contains('from')) {
            loggerInit('init.storage.tab',
              'Broken database: index \'from\' missing on objectStore \'' +
                absSemester + '\'',
              'error')
            return reject()
          }
          if (!store.indexNames.contains('to')) {
            loggerInit('init.storage.tab',
              'Broken database: index \'to\' missing on objectStore \'' +
                absSemester + '\'',
              'error')
            return reject()
          }

          return resolve()
        }
      })
    }
  })
  .then(
    () => loggerInit('init.storage.tab', 'database ready'),
    loggerError('init.storage.tab', 'database error during opening', true))
