'use strict'
// hide img
$('#lblXm').closest('tr').hide()

// hide some menu entries
var $entry = $('td > table:first > tbody > tr[onmouseover]')
chrome.storage.sync.get('sdtleft_hide', item =>
  item.sdtleft_hide.map(i => $entry.eq(i).hide().next('tr').hide()))

// make td clickable
{
  Array.prototype.forEach.call(
    document.getElementsByClassName('menu'),
    td => td.addEventListener('click', onclickMenu))

  function onclickMenu (event) {
    if (event.target.nodeName === 'A') {
      return true
    }
    this.getElementsByTagName('a')[0].click()
  }
}
$('a').click(function () {return !this.href.includes('#') })
