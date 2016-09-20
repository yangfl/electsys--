'use strict'
loggerInit('init', 'libraries loaded')


function startLoad () {
  loggerInit('init', 'DOM loaded')
  if (!window.location.hash && window.sessionStorage.debug) {
    window.location.hash = '#debug'
  }
  switch (window.location.hash) {
    case '#list':
      return showLessons()
    case '#debug':
      return preDebug()
    default:
      return preLogin()
  }
}


/* dry run */
function showLessons () {
  loggerInit('init', 'Show lesson list', 'log')
  isDryRun = true
  document.getElementById('list-type').style.display = 'none'
  deferredPool.start.resolve()
  return preMain()
}
/* dry run */


/* debug */
function preDebug () {
  loggerInit('init.debug', 'Preparing for Debug mode', 'log')
  document.getElementById('init-debug').style.display = 'block'
  document.getElementById('confirm-debug')
    .addEventListener('click', () => setupDebug())
  deferredPool.start.resolve()
}
/* debug */


/* login */
const WAIT_BEFORE_CANCEL = 1000


function preLogin () {
  let waitID
  document.getElementById('init-elect').style.display = 'block'
  $('#confirm-elect')
    .on('shown.bs.modal', function onshownInitModal () {
      loggerInit('init.dialog', 'dialog showed')
      ondeferredtaskerror = () => $(this).modal('hide')
      waitID = setTimeout(() => {
        waitID = undefined
        $(this).modal('hide')
      }, WAIT_BEFORE_CANCEL)
    })
    .on('hide.bs.modal', function onhideInitModal () {
      ondeferredtaskerror = undefined
      if (waitID) {
        clearTimeout(waitID)
        waitID = undefined
        if (!isError) {
          // manually closed
          loggerInit('init.dialog', 'dialog closed by user', 'warn')
        } else {
          // aborted by error
          loggerInit('init.dialog', 'process aborted by error', 'warn')
        }
        return
      } else {
        // timeout
        loggerInit('init.dialog', 'dialog confirmed')
        loggerInit('init.login', 'start login')
        let promise_openlogin = openLogin()
        promise_openlogin.then(waitLogin)
          .then(postLogin, loggerError('init.login',
            'Login encountered an unknown problem, ' +
            'probably due to broken API'))
        promise_openlogin.then(deferredPool.start.resolve)
      }
    }).modal()
}


function postLogin (isLogin) {
  if (isLogin) {
    loggerInit('init.login', 'successfully login', 'log')
    loggerInit('init.elect_stage', 'determinating elect stage')
    loggerInit('init.stu_info', 'getting semester info')
    return Promise.all([
      stage.find().then(stage => {
        if (stage) {
          loggerInit('init.elect_stage', 'Current stage is: ' + stage)
        } else {
          loggerInit('init.elect_stage', 'Elect is closed now', 'warn')
          $('#closed-elect').modal()
          return Promise.reject()
        }
      }, loggerError('init.elect_stage', true)),
      sdtleft.load().then(() => {
        if (sdtleft.info.isVaild()) {
          loggerInit('init.info', [
            '\nThe semester info is:', JSON.stringify(sdtleft.info)])
        } else {
          return loggerError('init.info', 'sdtleft.info invaild', true)
            (sdtleft.info)
        }
      }, loggerError('init.info', true)).then(initTabCacheDatabase),
    ]).then(preMain, () => {}) // catch promise rejection
  } else {
    loggerInit('init.login', 'login canceled by user', 'warn')
  }
}
/* login */


function preMain () {
  return deferredPool.finished.then(main, () =>
    loggerInit('main', 'Abort due to error', 'warn', true))
}


function main () {
  if (stage[1] === 3) {
    // short semester
    document.getElementById('list-type').style.display = 'none'
    deferredPool.tasks.datatable.then(() => {
      let btn_result = document.getElementById('btn-result')
      let div_header = document.getElementById('table-available_filter')
      div_header.insertBefore(btn_result, div_header.firstElementChild)
    })
  }
  if (sessionStorage.showLessontable == 'true') {
    document.getElementById('handler-schedule').click()
  }
  document.getElementById('init').style.display = 'none'
  document.getElementById('main').style.display = 'block'
  loggerInit('main', 'main interface shown', 'log')
}


/* start load */
document.addEventListener('DOMContentLoaded', startLoad)
