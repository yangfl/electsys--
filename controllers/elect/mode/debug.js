'use strict'
if (!window.location.hash && window.sessionStorage.debug) {
  window.location.hash = '#debug'
}


mode.debug = {
  toggle () {
    if (window.sessionStorage.debug) {
      delete window.sessionStorage.debug
      window.location.hash = ''
    } else {
      window.sessionStorage.debug = 1
    }
    window.location.reload()
  },

  pre () {
    loggerInit('init.debug', 'Preparing for Debug mode', 'log')
    document.getElementById('confirm-debug')
      .addEventListener('click', () => mode.debug.setup())
    document.getElementById('clear-db').addEventListener('click', () => {
      db_lesson.close()
      db_tab.close()
      indexedDB.webkitGetDatabaseNames().onsuccess = (sender, args) => {
        let r = sender.target.result
        let i = r.length
        if (i === 0) {
          loggerInit('debug.clear', 'nothing to remove')
          return
        }
        while (i--) {
          let name = r[i]
          let request = indexedDB.deleteDatabase(name)
          request.onsuccess = () => loggerInit(
            'debug.clear', '\'' + name + '\' removed')
          request.onerror = () => loggerInit(
            'debug.clear', '\'' + name + '\' can\'t be removed', 'warn')
        }
      }
    })
    document.getElementById('clear-tab').addEventListener('click', () => {
      db_tab.close()
      let name = db_tab.name
      indexedDB.deleteDatabase(name).onsuccess = () => loggerInit(
        'debug.clear', '\'' + name + '\' removed')
    })
    deferredPool.start.resolve()
  },

  fillInfo (year = sdtleft.info.year, semester = sdtleft.info.semester) {
    sdtleft.info = {
      name: 'Dev',
      major: 'Ha?',
      year: year,
      semester: semester,
    }
    sdtleft.loaded.resolve()
  },

  setup (host = 'http://127.0.0.1:8080') {
    chrome.permissions.request({ origins: [host + '/'] }, granted => {
      if (!granted) {
        loggerInit('debug', 'Origins permission denied', 'error')
        return
      }

      mode.debug.fillInfo()
      ELECT.host = host
      stage = [1, 1]

      window.addEventListener('beforeunload', () => {
        chrome.permissions.remove({ origins: [ELECT.host + '/'] }, removed => {
          if (removed) {
            loggerInit('debug', 'Origins permission removed')
          } else {
            loggerInit('debug', 'Permissions can\'t be removed', 'warn')
          }
        })
      })

      loggerInit('debug', 'Debug mode', 'warn')
      window.dispatchEvent(new Event('login'))
      return mode.main()
    })
  },
}
