'use strict'
const SDTLEFT_URL = 'http://electsys.sjtu.edu.cn/edu/student/sdtleft.aspx'
const INFO_URL =
  'http://electsys.sjtu.edu.cn/edu/student/sdtModifyIndividualInfo.aspx'
var $sdtleft = null
var sdtleft_menu = null


var loadSdtleft = callback => {
  if ($sdtleft == null) {
    $.get(SDTLEFT_URL, data => {
      $sdtleft =
        $(data.match(/<table[^]*<\/table>/i)[0].replace(/src=/gi, 'tempsrc='))
      return callback($sdtleft) }) }
  else {
    setTimeout(() => callback($sdtleft), 0) }}


var quickInfo = next_p => {
  var date = new Date()
  var is_prev_year = date.getMonth() < 4 ||
    (date.getMonth() == 5 && date.getDay() > 15) || date.getMonth() == 6
  var semester = is_prev_year + 1
  var year = date.getFullYear() - is_prev_year
  if (next_p) {
    semester = 3 - semester
    if (semester == 1) {
      year++ }}
  year += '-' + (year + 1)
  return {year: year, semester: semester} }


var parseInfo = ($the_sdtleft = $sdtleft) => {
  var info = {}
  ;[['lblXm', 'name'],
    ['lblZy', 'major'],
    ['lblXn', 'year'],
    ['lblXq', 'semester'], ].forEach(([field_sdtleft, field_index]) => {
      info[field_index] = $the_sdtleft.find('#' + field_sdtleft).text() })
  return info }


var loadGrade = callback =>
  $.get(INFO_URL, data => {
    var grade = data.match(/<span id="lblXh".*?>\d(\d{2})/i)
    if (!grade) {
      return callback() }
    return callback('20' + grade[1]) })


var parseSdtleftMenu = ($table = $sdtleft.find('table[width=122]')) => {
  var l_entry = []
  $table.children().children().each(function () {
    var $div_child = $(this).find('.child')
    if ($div_child.length) {
      l_entry[l_entry.length - 1][0] = 'group'
      l_entry[l_entry.length - 1][1][1] =
        parseSdtleftMenu($div_child.children('table'))
      return }
    var $a = $(this).children('.unuse, .menu').find('a')
    if ($a.length) {
      l_entry.push(['url', [
        $a.text(),
        URI($a.attr('href')).absoluteTo(SDTLEFT_URL).toString(),
        $a.attr('href').includes('http://') ]]) }})
  return l_entry }


var loadSdtleftMenu = () => {
  sdtleft_menu = parseSdtleftMenu() }
