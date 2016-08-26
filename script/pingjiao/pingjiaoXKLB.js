'use strict'
// hide nonsense message
$('table.p18padding').closest('tr').toggle().next().toggle()

// find entries
var $entry = $('tr.tdcolour1, tr.tdcolour2')

// remove original a
$entry.each(function () {
  var $entry_a = $(this).find('a')
  $(this).data('href', $entry_a.attr('href'))
  $entry_a.closest('td').text($entry_a.text())
  $entry_a.remove() })

$entry.click(function () {
  var url = $(this).data('href')
  BootstrapDialog.show({
    title: chrome.i18n.getMessage('pingjiao_title'),
    message: `<div class="list-group">\
  <a href="${url}#good-y" class="list-group-item">${chrome.i18n.getMessage('pingjiao_good')}</a>\
  <a href="${url}#good" class="list-group-item">${chrome.i18n.getMessage('pingjiao_good')}</a>\
  <a href="${url}#average" class="list-group-item">${chrome.i18n.getMessage('pingjiao_average')}</a>\
  <a href="${url}#poor" class="list-group-item">${chrome.i18n.getMessage('pingjiao_poor')}</a>\
  <a href="${url}#empty" class="list-group-item">${chrome.i18n.getMessage('pingjiao_empty')}</a>\
</div>`, }) })
