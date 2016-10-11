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


config.loaders.push((item, hasAll) => {
  for (let key in item) {
    if (key.startsWith('color_')) {
      document.body.style.setProperty('--' + key.replace(/_/g, '-'), item[key])
    }
  }
})
