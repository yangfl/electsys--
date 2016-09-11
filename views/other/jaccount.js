'use strict'
var img = document.querySelector('img[onclick]')
var submit = document.querySelector('input[type=submit]')
chrome.storage.sync.get(['autofill', 'autologin_retry'], item => {
  if (!item.autofill) {
    return
  }
  img.onload = function () {
    let result = decodeCaptcha(this)
    if (result) {
      document.getElementById('captcha').value = result
      if (!item.autologin_retry || item.autologin_retry < 1) {
        return
      }
      if (document.getElementById('user').value &&
          !document.getElementsByClassName('warn-info').length) {
        setTimeout(() => submit.click(), 1000)
      }
    }
    else if (!item.autologin_retry || item.autologin_retry < 1) {
      item.autologin_retry--
      img.click()
    }
  }
  img.onload()
})
