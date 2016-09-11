'use strict'
let bsidQueue
let lessonQueue


config.loaders.push(item => {
  refetch.default = {
    filter: pageFilter,
    tickerFactory: (url, options) => steppingTicker(
      (url.method || options.method) === 'POST' ? 2000 : item.step_base,
      item.step_penalty, item.step_retry),
  }
  bsidQueue = new Queue
  bsidQueue.defaultOptions = {
    cooldown: item.step_base,
  }
  lessonQueue = new Queue
  lessonQueue.defaultOptions = {
    cooldown: 2000,
  }
})


function postOptions (data) {
  let paras = []
  if (Array.isArray(data)) {
    for (let i = 0, k = data.length; i < k; i++) {
      paras.push(encodeURIComponent(data[i].name) + '=' + encodeURIComponent(data[i].value))
    }
  } else {
    for (let key in data) {
      paras.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    }
  }
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: paras.join('&'),
    credentials: 'include',
  }
}
