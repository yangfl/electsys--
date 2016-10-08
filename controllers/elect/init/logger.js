'use strict'
function loggerInit (func, msg, method = 'debug',
    alertCloseDelay = method === 'error' ? true : undefined) {
  let curTime = performance.now().toFixed(3)
  if (Array.isArray(msg)) {
    console[method]('%c[%s] %c%s:', 'color: lime', curTime, 'color: orange',
      func, ...msg)
    if (alertCloseDelay) {
      return addAlert(func, msg.slice(0, msg.length - 1).join(''),
        msg[msg.length - 1], method, alertCloseDelay, curTime)
    }
  } else {
    console[method]('%c[%s] %c%s:', 'color: lime', curTime, 'color: orange',
      func, msg)
    if (alertCloseDelay) {
      return addAlert(func, msg, undefined, method, alertCloseDelay, curTime)
    }
  }
}


/**
 * @param {string} func
 * @param {(string|string[]|bool)} [hint=false]
 * @param {bool} [wantThrow=false]
 */
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


function addAlert (func, msg, e, method, closeDelay, curTime) {
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
  const section_alert = document.getElementById('alert')
  let id_alert = 'alert-' + curTime
  section_alert.insertAdjacentHTML('beforeend',
`<div id="${id_alert}" class="alert alert-${className} fade in">
  <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
  <p><strong>${typeHint} from '${func}'</strong></p>
  <div class="alert-hint">
    ${msg.replace(/\n/g, '<br />')}
  </div>${e ? `
  <pre>${
    e.statusText || e.stack || e.target && e.target.error ||
    typeof e === 'object' && JSON.stringify(e) || e
  }</pre>` : ''}
</div>`)
  let div_alert = section_alert.lastElementChild
  if (typeof closeDelay === 'number') {
    div_alert.dataset.timeoutID = setTimeout(
      () => $(div_alert).alert('close'), closeDelay)
  }
  return div_alert
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
    if (event.reason === undefined) {
      // loggerInit('global.promise', 'promise rejection has been handled')
      event.preventDefault()
    }
  })


window.addEventListener('login', () => {
  loggerInit('global', 'login fired')
})


$(document).ajaxError(
  function loggerAjaxError (event, jqXHR, settings, thrownError) {
    loggerError(
      'ajax', ['Error when getting', settings.url, '@', settings.type])(jqXHR)
    return
  })
