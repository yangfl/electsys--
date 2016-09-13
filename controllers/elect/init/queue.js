'use strict'
let bsidQueue = new Queue
let lessonQueue = new Queue


config.loaders.push(item => {
  if (typeof item.ajax_post_interval === 'number' &&
      typeof item.ajax_get_interval === 'number' &&
      typeof item.ajax_power === 'number' &&
      typeof item.ajax_retry === 'number') {
    refetch.default = {
      filter: pageFilter,
      tickerFactory: (url, options) => steppingTicker(
        (url.method || options.method) === 'POST' ?
          item.ajax_post_interval : item.ajax_get_interval,
        item.ajax_power, item.ajax_retry),
    }
  }
  if (typeof item.ajax_get_interval === 'number') {
    bsidQueue.defaultOptions = {
      cooldown: item.ajax_get_interval,
    }
  }
  if (typeof item.ajax_post_interval === 'number') {
    lessonQueue.defaultOptions = {
      cooldown: item.ajax_post_interval,
    }
  }
})


function postOptions (data) {
  let paras = []
  if (Array.isArray(data)) {
    for (let i = 0, k = data.length; i < k; i++) {
      paras.push(
        encodeURIComponent(data[i][0]) + '=' + encodeURIComponent(data[i][1]))
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
