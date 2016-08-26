'use strict'
var img = document.getElementById('imageValidate')
chrome.storage.sync.get('autofill_retry', item => {
  if (item.autofill_retry < 0) {
    return }
  img.onload = function () {
    var result = decodeCaptcha(this)
    if (result) {
      document.getElementById('captcha').value = result
      if (document.getElementById('user').value &&
          !document.getElementsByName('form1')[0].getElementsByTagName('td')[0]
            .innerHTML.includes('请')) {
        return
        document.getElementsByName('imageField')[0].click() }}
    else if (item.autofill_retry > 0) {
      item.autofill_retry--
      img.click() }}})
