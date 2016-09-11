'use strict'
// hide 重要通知, More, RSS, 电子教参
$('img[src$="mainnotice.gif"]').closest('table').remove()
$('img[src$="more.gif"]').closest('tr').remove()
$('img[src$="rss.gif"]').closest('tr').remove()
$('a[href$="学生版.doc"]').closest('tr').remove()

// add a button to show 重要通知
var $tr_notice = $('table#gridMain').closest('tr')
var $tr_title_notice =
  $('img[src$="arrowdown.gif"]').closest('tr').first().clone()
$tr_title_notice.children('td').contents().filter(function () {
  return this.nodeType == 3 }).each(function () {this.textContent = '通知' })
$tr_title_notice.children('td').children('img').addClass('folded')
$tr_notice.before($tr_title_notice)
$tr_notice.hide()
