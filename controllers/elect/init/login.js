'use strict'

function isLogin (method) {
  switch (method) {
    case 1:
      return !!stu_info.name
    default:
      return fetch(ELECT.testLogin, {credentials: 'include'})
        .then(response => !response.url.endsWith('outTimePage.aspx'))
  }
}


function openLogin () {
  return fetch(ELECT.login, {credentials: 'include'}).then(response => {
    let responseURL = response.url
    if (responseURL.includes('sdtMain')) {
      return
    }
    if (!responseURL.includes('login')) {
      throw new TypeError
    }
    return window.open(responseURL, 'login', 'width=436, height=527')
  })
}


async function waitLogin (loginWindow) {
  if (loginWindow === undefined) {
    window.dispatchEvent(new Event('login'))
    return true
  }
  while (true) {
    await sleep(1000)
    if (loginWindow.closed) {
      if (await isLogin()) {
        window.dispatchEvent(new Event('login'))
        return true
      }
      return false
    }
  }
}


function doLogin () {
  return openLogin().then(waitLogin)
}


function doLogout () {
  return fetch(ELECT.logout, {credentials: 'include'})
}
