'use strict'
// hide img
$('#lblXm').closest('tr').hide()

// hide some menu entries
var $entry = $('td > table:first > tbody > tr[onmouseover]')
chrome.storage.sync.get('sdtleft_hide', item =>
  item.sdtleft_hide.map(i => $entry.eq(i).hide().next('tr').hide()))

// make td clickable
$('td.menu').click(function () {$(this).find('a:first').click() })
$('a').click(function () {return !this.href.includes('#') })
