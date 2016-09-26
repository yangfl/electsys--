'use strict'
function toggleDebug () {
  if (window.sessionStorage.debug) {
    delete window.sessionStorage.debug
    window.location.hash = ''
  } else {
    window.sessionStorage.debug = 1
  }
  window.location.reload()
}


function clearCache () {
  db_lesson.close()
  db_tab.close()
  indexedDB.webkitGetDatabaseNames().onsuccess = (sender, args) => {
    let r = sender.target.result
    let i = r.length
    if (i === 0) {
      loggerInit('debug.clear_cache', 'nothing to remove')
      return
    }
    while (i--) {
      let name = r[i]
      let request = indexedDB.deleteDatabase(name)
      request.onsuccess = () => loggerInit(
        'debug.clear_cache', '\'' + name + '\' removed')
      request.onerror = () => loggerInit(
        'debug.clear_cache', '\'' + name + '\' can\'t be removed', 'warn')
    }
  }
}


function setupDebug (year = sdtleft.info.year, semester = sdtleft.info.semester,
    host = 'http://127.0.0.1:8080') {
  chrome.permissions.request({ origins: [host + '/'] }, granted => {
    if (!granted) {
      loggerInit('debug', 'Origins permission denied', 'error')
      return
    }

    sdtleft.info = {
      name: 'Dev',
      major: 'Ha?',
      year: year,
      semester: semester,
    }
    sdtleft.loaded.resolve()
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
    return preMain()
  })
}
