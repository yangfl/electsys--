'use strict'
chrome.storage.sync.get('show_message', item => {
  if (item.show_message) {
    setTimeout(() => $('#Button1').click(), item.show_message) }})
