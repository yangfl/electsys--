'use strict'
var $submit = $('input[type=submit]')
if ($submit.attr('value') == '继续') {
  $('input[type=checkbox]').click()
  $submit.click() }
