'use strict'
$.fn.dataTable.ext.order['dom-priority'] =  function (settings, col) {
  return this.api().column(col, {order: 'index'}).nodes().map(td => {
    var priority = 0
    for (var class_name of Array.from(td.parentElement.classList)) {
      switch (class_name) {
        case 'not-full':
          priority = Math.max(priority, 1)
          break
        case 'full':
          priority = Math.max(priority, 2)
          break
        case 'confilcted':
          priority = Math.max(priority, 3)
          break
        case 'choosen':
          priority = Math.max(priority, 4)
          break
        case 'unavailable':
          priority = Math.max(priority, 5)
          break }}
    return priority }) }


var initTableColor = (table = document.body) => chrome.storage.sync.get(
  ['color_head', 'color_not_full', 'color_full', 'color_confilcted',
   'color_choosen', 'color_hover', 'color_unavailable'],
  item => {
    for (var key in item) {
      table.style.setProperty('--' + key.replace(/_/g, '-'), item[key]) }})


var initTableCss = (table, columns) => {
  var l_clickable = []
  columns.forEach(column => {
    if (column.visible === false) {
      return }
    l_clickable.push(column.clickable) })
  var sheet = document.createElement('style')
  for (var i_slot = 0; i_slot < l_clickable.length; i_slot++) {
    if (!l_clickable[i_slot]) {
      if (sheet.innerHTML) {
        sheet.innerHTML += ',\n' }
      sheet.innerHTML += '#' + table.id  + ' > tbody > tr > td:nth-child(' +
        (i_slot + 1) + ')' }}
  if (sheet.innerHTML) {
    sheet.innerHTML += ' {\n  cursor: auto; }'
    document.head.appendChild(sheet) }}


var initTableIcon = () => {
  var path_images =
    chrome.extension.getURL('/vendor/DataTables-1.10.12/images/')
  var sheet = document.createElement('style')
  sheet.innerHTML = `
table.dataTable thead .sorting {
  background-image: url("${path_images}sort_both.png") }
table.dataTable thead .sorting_asc {
  background-image: url("${path_images}sort_asc.png") }
table.dataTable thead .sorting_desc {
  background-image: url("${path_images}sort_desc.png") }
table.dataTable thead .sorting_asc_disabled {
  background-image: url("${path_images}sort_asc_disabled.png") }
table.dataTable thead .sorting_desc_disabled {
  background-image: url("${path_images}sort_desc_disabled.png") }`
  document.head.appendChild(sheet) }
