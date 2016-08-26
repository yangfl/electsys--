'use strict'
const KEY_INVAILD = '00 invaild combinations'
var cur_grade = $('#OutSpeltyEP1_dpNj [selected]').text()
var cur_combination = $('#OutSpeltyEP1_dpYx [selected]').text() + cur_grade

if (!(KEY_INVAILD in localStorage)) {
  localStorage[KEY_INVAILD] = '' }

if (!l_available.length &&
    !localStorage[KEY_INVAILD].includes(cur_combination)) {
  localStorage[KEY_INVAILD] += cur_combination + ' ' }

$('#OutSpeltyEP1_dpYx option:not([selected])').each(function () {
  if (localStorage[KEY_INVAILD].includes(this.text + cur_grade)) {
    this.disabled = true }})
