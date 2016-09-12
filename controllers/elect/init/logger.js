'use strict'
function loggerInit (func, msg, method = 'debug',
    wantsAlert = method === 'error') {
  if (Array.isArray(msg)) {
    console[method]('%c[%s] %c%s:', 'color: lime',
      performance.now().toFixed(3), 'color: orange', func, ...msg)
    if (wantsAlert) {
      addAlert(func, msg.slice(0, msg.length - 1).join(''),
        msg[msg.length - 1], method)
    }
  } else {
    console[method]('%c[%s] %c%s:', 'color: lime',
      performance.now().toFixed(3), 'color: orange', func, msg)
    if (wantsAlert) {
      addAlert(func, msg, undefined, method)
    }
  }
}


function loggerError (func, hint, wantThrow) {
  if (typeof hint === 'boolean') {
    wantThrow = hint
    hint = undefined
  }
  if (hint === undefined) {
    hint = 'Unknown problem occurred, we are sorry for the inconvenience'
  }
  return function loggerErrorHandler (e) {
    let msg
    if (e) {
      if (Array.isArray(hint)) {
        msg = hint.concat(['\nThe error is:\n', e])
      } else {
        msg = [hint, '\nThe error is:\n', e]
      }
      loggerInit(func, msg, 'error')
    }
    if (hint === true || wantThrow === true) {
      return Promise.reject()
    }
  }
}


function addAlert (func, msg, e, method) {
  let className
  let typeHint
  switch (method) {
    case 'warn':
      className = 'warning'
      typeHint = 'Warning'
      break
    case 'error':
      className = 'danger'
      typeHint = 'Error'
      break
    default:
      className = 'info'
      typeHint = 'Info'
      break
  }
  document.getElementById('alert').innerHTML +=
`<div class="alert alert-${className} fade in">
  <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
  <p><strong>${typeHint} from '${func}'</strong></p>
  <div class="alert-hint">
    ${msg.replace(/\n/g, '<br />')}
  </div>${e ? `
  <pre>${e.statusText || e.stack || (typeof e === 'object' && JSON.stringify(e)) || e}</pre>` : ''}
</div>`
}


function clearAlert () {
  let block_alert = document.getElementById('alert')
  while (block_alert.lastChild) {
    block_alert.removeChild(block_alert.lastChild)
  }
}


window.addEventListener('error',
  function loggerGlobalError (message, source, lineno, colno, error) {
    loggerError('global')(error)
  })


window.addEventListener('unhandledrejection',
  function loggerGlobalPromiseError (event) {
    loggerError('global.promise')(event.reason)
  })


window.addEventListener('login', () => {
  loggerInit('global', 'login fired')
})


$(document).ajaxError(
  function loggerAjaxError (event, jqXHR, settings, thrownError) {
    loggerError('ajax', ['Error when getting', settings.url, '@', settings.type])
      (jqXHR)
    return
  })
