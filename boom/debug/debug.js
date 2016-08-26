'use strict'
var settings = null
var cache = null

$(document).ready(() => {
  $('#dump-settings').click(
    () => chrome.storage.sync.get(item => {
      settings = item
      console.info(item) }))

  $('#dump-cache').click(
    () => chrome.storage.local.get(item => {
      cache = item
      console.info(item) }))

  $('#init-settings').click(
    () => syncInit(() => $('#dump-settings').click()))

  $('#init-cache').click(
    () => localInit(() => {
        $('#toggle-sth').click()
        $('#dump-cache').click() }))

  $('#toggle-sth').click(
    () => chrome.storage.local.set({sth: true})) })
