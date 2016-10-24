'use strict'
let user = {
  host: 'http://electsys.sjtu.edu.cn',
  url: new Proxy({
    login: '/edu/login.aspx',
    logout: '/edu/logout.aspx',
    sdtleft: '/edu/student/sdtleft.aspx',
    testLogin: '/edu/changePwd.aspx',
  }, {
    get (target, key) {
      return user.host + target[key]
    }
  }),

  isLogin () {
    return fetch(this.url.testLogin, {credentials: 'include'})
      .then(response => !response.url.endsWith('outTimePage.aspx'))
  },

  login () {
    return user.login.open().then(user.login.wait)
  },

  logout () {
    return fetch(this.url.logout, {credentials: 'include'})
  },
}

user.login.open = function openLogin () {
  return fetch(user.url.login, {credentials: 'include'}).then(response => {
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

user.login.wait = async function waitLogin (loginWindow) {
  if (loginWindow === undefined) {
    window.dispatchEvent(new Event('login'))
    return true
  }
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (loginWindow.closed) {
      if (await user.isLogin()) {
        window.dispatchEvent(new Event('login'))
        return true
      }
      return false
    }
  }
}
