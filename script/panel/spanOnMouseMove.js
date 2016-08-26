'use strict'
$('span[onmousemove]').each(function () {
  $(this).after($('<a target="_blank" />')
    .attr('href', /"(.*)"/.exec($(this).attr('onmousemove'))[1])
    .text($(this).text()))
  $(this).remove() })
