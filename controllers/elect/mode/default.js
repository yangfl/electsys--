'use strict'
mode.default = {
  pre () {
    const WAIT_BEFORE_CANCEL = 1000

    $('#confirm-elect')
      .on('shown.bs.modal', function () {
        loggerInit('init.dialog', 'dialog showed')
        ondeferredtaskerror = () => $(this).modal('hide')
        this.dataset.waitID = setTimeout(() => {
          delete this.dataset.waitID
          $(this).modal('hide')
        }, WAIT_BEFORE_CANCEL)
      })
      .on('hide.bs.modal', function () {
        ondeferredtaskerror = undefined
        if (this.dataset.waitID) {
          clearTimeout(this.dataset.waitID)
          delete this.dataset.waitID
          if (deferredPool.status !== 'failed') {
            // manually closed
            loggerInit('init.dialog', 'dialog closed by user', 'warn')
          } else {
            // aborted by error
            loggerInit('init.dialog', 'process aborted by error', 'warn')
          }
        } else {
          loggerInit('init.dialog', 'dialog confirmed')
          return mode.default.setup()
        }
      }).modal()
  },

  setup () {
    loggerInit('init.login', 'start login')
    let promise_openlogin = user.login.open()
    promise_openlogin.then(user.login.wait).then(isLogin => {
      if (!isLogin) {
        loggerInit('init.login', 'login canceled by user', 'warn')
        return
      }
      loggerInit('init.login', 'successfully login', 'log')
      loggerInit('init.elect_stage', 'determinating elect stage')
      loggerInit('init.stu_info', 'getting semester info')
      return Promise.all([
        stage.find().then(stage => {
          if (stage) {
            loggerInit('init.elect_stage', 'Current stage is: ' + stage)
            if (stage[1] === 3) {
              // short semester
              document.getElementById('list-type').style.display = 'none'
              deferredPool.tasks.datatable.then(() => {
                let btn_result = document.getElementById('btn-result')
                let div_header = document.getElementById('table-available_filter')
                div_header.insertBefore(btn_result, div_header.firstElementChild)
              })
            }
          } else {
            loggerInit('init.elect_stage', 'Elect is closed now', 'warn')
            $('#closed-elect').modal()
            return Promise.reject()
          }
        }, loggerError('init.elect_stage', true)),
        sdtleft.load().then(() => {
          if (sdtleft.info.isValid()) {
            loggerInit('init.info', [
              '\nThe semester info is:', JSON.stringify(sdtleft.info)])
          } else {
            return loggerError('init.info', 'sdtleft.info invalid', true)
              (sdtleft.info)
          }
        }, loggerError('init.info', true)),
      ])
    }, loggerError('init.login',
      'Login encountered an unknown problem, probably due to API broken'))
    .then(mode.main)
    promise_openlogin.then(deferredPool.start.resolve)
  },
}
