'use strict'
// DO NOT CHANGE THIS!!!!
var this_interval = Math.random() * 2000 + 500
setTimeout(
  () => {
    if (window.location.search.endsWith('a=1')) {
      window.location.reload() }
    else {
      window.location.replace(window.location.toString() + '&a=1') }},
  this_interval)
chrome.storage.local.get(
  ['last_interval', 'success_interval', 'failed_interval'], item => {
    if (item.success_interval == undefined) {
      item.success_interval = [] }
    if (item.failed_interval == undefined) {
      item.failed_interval = [] }
    if (window.location.search.endsWith('a=1')) {
      item.success_interval.push(item.last_interval) }
    else {
      item.failed_interval.push(item.last_interval) }
    item.last_interval = this_interval
    chrome.storage.local.set(item) })
