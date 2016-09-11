'use strict'
function refetch (url, options = {credentials: 'include'},
    filter = refetch.default.filter,
    ticker = refetch.default.tickerFactory(url, options)) {
  const handleErrors = function (response) {
    if (!response.ok) {
      throw Error(response.statusText)
    }
    return response
  }

  return fetch(url, options).then(handleErrors)
    .then(response => Promise.resolve(filter(response.clone())).then(result =>
      result ? response : Promise.reject(new TypeError('filter failed'))))
    .catch(error => Promise.resolve(ticker(error)).then(wantsRetry =>
      wantsRetry ? refetch(url, options, filter, ticker) :
        Promise.reject(error)))
}


refetch.default = {
  filter: () => true,
  tickerFactory: () => {},
}


function steppingTicker (delay = 0, power = 1, maxRetry = 3) {
  let retry = 0
  return error => {
    retry++
    if (retry === maxRetry || !(error instanceof TypeError)) {
      // give up
      return false
    } else {
      // retry
      return new Promise(resolve => {
        loggerInit('ajax', error, 'warn')
        setTimeout(() => {
          delay *= power
          return resolve(true)
        }, delay)
      })
    }
  }
}


class LogoutError extends Error {
  constructor (message = 'Logout') {
    super(message)
    this.name = 'LogoutError'
    document.dispatchEvent(new Event('logout'))
  }
}


function pageVaildator (data) {
  if (data.includes('请勿频繁刷新本页面')) {
    return false
  }
  if (data.includes('<title>请重新登录</title>')) {
    throw new LogoutError
  }
  return true
}


function pageFilter (response) {
  if (response.url.endsWith('outTimePage.aspx')) {
    throw new LogoutError
  }
  return response.text().then(pageVaildator)
}
