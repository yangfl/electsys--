'use strict'
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason == 'install') {
    storageInit()
    window.open('/config/index.html#welcome') }
  else {
    // details.reason == 'update'
    //var thisVersion = chrome.runtime.getManifest().version
    //alert('Updated from ' + details.previousVersion + ' to ' + thisVersion + '!')
  }})
