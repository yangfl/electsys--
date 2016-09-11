'use strict'
if (window.name == 'login') {
  window.close()
}

chrome.storage.sync.get('old_sdtMain', item => {
  if (item.old_sdtMain) {
    $(document).ready(() => {
      var frameset_main = document.getElementsByTagName('frameset')[0]
      var frameset_bottom = document.getElementsByTagName('frameset')[1]
      var frame_left = document.getElementsByName('leftFrame')[0]
      var frame_main = document.getElementsByName('main')[0]

      frameset_main.rows = '25,*'
      frameset_bottom.cols = '145,*'
      frame_left.scrolling = 'yes' }) }
  else {
    window.stop()
    $.get(chrome.extension.getURL('/views/sdtMain/sdtMain.html'), data => {
      document.open('text/html', true)
      document.write(data
        .replace(/<link href="\//g,
                 '<link href="' + chrome.extension.getURL(''))
        .replace(/<script src="\//g,
                 '<script src="' + chrome.extension.getURL('')))
      document.close()
      load() }) }})
