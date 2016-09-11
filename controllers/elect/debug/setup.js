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


function setupDebug (year = sdtleft.info.year, semester = sdtleft.info.semester,
    host = 'http://127.0.0.1:8080') {
  chrome.permissions.request({ origins: [host + '/'] }, function (granted) {
    if (granted) {
      sdtleft._info = {
        name: 'Dev',
        major: 'Ha?',
        year: year,
        semester: semester,
      }
      ELECT.host = host
      current_stage = [1, 1]
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
      return initTabCacheDatabase().then(preMain)
    } else {
      loggerInit('debug', 'Origins permission denied', 'error')
    }
  })
}
