'use strict'
$('img[src$="arrowdown.gif"]').closest('tr').click(function () {
  $(this).next().toggle()
  if ($(this).next().is(':visible')) {
    $(this).children('td').children('img').removeClass('folded') }
  else {
    $(this).children('td').children('img').addClass('folded') }})
