'use strict'
class HttpError extends TypeError {
  constructor (message) {
    super(message)
    this.name = 'HttpError'
  }
}


function handleResponseError (response) {
  if (!response.ok) {
    throw new HttpError(response.statusText)
  }
  return response
}


function responseText (response) {
  return response.text()
}


function responseErrorText (response) {
  handleResponseError(response)
  return response.text()
}


function refetch (url, options = {credentials: 'include'},
    filter = refetch.default.filter,
    ticker = refetch.default.tickerFactory(url, options)) {
  return fetch(url, options).then(handleResponseError)
    .then(response => Promise.resolve(filter(response.clone())).then(result =>
      result ? response : Promise.reject(new TypeError('filter failed'))))
    .catch(error => Promise.resolve(ticker(error)).then(wantsRetry =>
      wantsRetry ? refetch(url, options, filter, ticker) :
        Promise.reject(error)))
}


refetch.default = {
  filter: () => true,
  tickerFactory: () => () => false,
}


function steppingTicker (delay = 0, power = 1, maxRetry = 3) {
  let retry = 0
  return error => {
    retry++
    if (retry === maxRetry || error instanceof LogoutError) {
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


class ElectError extends TypeError {
  constructor (message) {
    super(message)
    this.name = 'ElectError'
  }
}


class LogoutError extends ElectError {
  constructor (message = 'Logout') {
    super(message)
    this.name = 'LogoutError'
  }
}


function pageFilter (response) {
  if (response.url.endsWith('outTimePage.aspx')) {
    throw new LogoutError
  }
  if (response.url.includes('messagePage.aspx')) {
    throw new ElectError(
      decodeURIComponent(response.url.substr(response.url.indexOf('=') + 1)))
  }
  return true
}
