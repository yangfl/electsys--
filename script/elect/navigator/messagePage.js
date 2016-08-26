'use strict'
var message = $('#lblMessage').text()

if (message.includes('新生研讨课只能选择一门')) {
  chrome.storage.sync.set({skip_freshmanLesson: true}) }
// else if (message.includes('不能继续增加通识课')) {

chrome.storage.sync.get('show_message', item => {
  if (item.show_message) {
    setTimeout(() => $('#Button1').click(), item.show_message) }
  else {
    $(document).bind('keydown', 'b', () => window.history.back()) }})
