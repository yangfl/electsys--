'use strict'
$.fn.dataTable.ext.order['dom-priority'] = function (settings, col) {
  return this.api().column(col, {order: 'index'}).nodes().map(
    td => Array.prototype.reduce.call(
      td.parentElement.classList,
      (priority, class_name) => {
        switch (class_name) {
          case 'not-full':
            priority = Math.max(priority, 1)
            break
          case 'full':
            priority = Math.max(priority, 2)
            break
          case 'confilcted':
            priority = Math.max(priority, 3)
            break
          case 'choosen':
            priority = Math.max(priority, 4)
            break
          case 'unavailable':
            priority = Math.max(priority, 5)
            break
        }
        return priority
      }, 0))
}


deferredPool.tasks.tablecolor = deferredPool.start
  .then(() => new Promise((resolve, reject) => {
    const COLOR_TYPE = ['color_head', 'color_not_full', 'color_full',
      'color_confilcted', 'color_choosen', 'color_hover', 'color_unavailable']
    chrome.storage.sync.get(COLOR_TYPE, item => {
      try {
        for (let key of COLOR_TYPE) {
          document.body.style.setProperty('--' + key.replace(/_/g, '-'), item[key])
        }
        return resolve()
      } catch (e) {
        return reject(e)
      }
    })
  }))
  .then(
    () => loggerInit('init.available_table', 'color settings loaded'),
    loggerError('init.datatable',
      'Error when loading color settings, UI may be affected.'))
